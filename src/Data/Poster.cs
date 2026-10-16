using Garments.Core;
using Garments.Ledger;
using Garments.Platform.Security;
using Garments.Platform.Tenancy;
using Microsoft.EntityFrameworkCore;

namespace Garments.Data;

/// <summary>
/// Turns a <see cref="PostingRequest"/> into a posted general-ledger entry.
/// </summary>
/// <remarks>
/// <para>
/// <b>Why the work happens in this order.</b> Every rule is checked before anything is written, and the
/// journal number is taken last. A rejected posting must not consume a number, because invariant I4
/// promises the numbering has no gaps — and a gap whose cause was a validation failure nobody remembers
/// is indistinguishable from a deleted entry when an auditor asks.
/// </para>
///
/// <para>
/// <b>Two saves inside one transaction.</b> The immutability trigger reads the entry's status to decide
/// whether a line may change, and a posted entry's lines are untouchable, so the lines have to be written
/// while the entry is still a draft. Both saves share a transaction so the number allocation rolls back
/// with the posting it belonged to: incrementing outside it would leave a hole in the journal every time
/// a commit failed.
/// </para>
///
/// <para>
/// <b>The database still wins.</b> Everything validated here is validated again by a constraint or a
/// trigger, and a refusal from Postgres is translated rather than allowed to escape as a stack trace.
/// Law L4 is that invariants live in the schema; this class exists to give a person a readable reason,
/// not to be the thing that protects the ledger.
/// </para>
/// </remarks>
public sealed class Poster(
    GarmentsDbContext context,
    ITenantContext tenantContext,
    ICurrentUser currentUser) : IPoster
{
    public async Task<PostingOutcome> PostAsync(
        PostingRequest request,
        CancellationToken cancellationToken = default)
    {
        var tenantId = tenantContext.TenantId;

        if (tenantId.IsEmpty)
        {
            throw new InvalidOperationException(
                "A posting needs a resolved tenant. Callers reach this through a tenant scope; arriving "
                + "without one is a wiring mistake, not a user error, and refusing here keeps it that way.");
        }

        var balance = PostingBalance.Check(request.Lines.ToList());
        if (!balance.Succeeded)
        {
            return new PostingOutcome(PostingOutcomeStatus.Rejected, balance.Errors);
        }

        var journal = await context.Journals
            .FirstOrDefaultAsync(each => each.Code == request.JournalCode, cancellationToken)
            .ConfigureAwait(false);

        if (journal is null)
        {
            return new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                PostingErrorCode.JournalNotFound,
                $"This company has no journal called '{request.JournalCode}'.")]);
        }

        var refused = await RefuseUnpostableAccountsAsync(request, cancellationToken).ConfigureAwait(false);
        if (refused is not null)
        {
            return refused;
        }

        var (period, periodRefusal) = await FindOpenPeriodAsync(request, cancellationToken).ConfigureAwait(false);
        if (periodRefusal is not null)
        {
            return periodRefusal;
        }

        var existing = await FindExistingAsync(request, cancellationToken).ConfigureAwait(false);
        if (existing is not null)
        {
            return new PostingOutcome(
                PostingOutcomeStatus.AlreadyPosted,
                [],
                existing.Id,
                existing.Number);
        }

        await using var transaction = await context.Database
            .BeginTransactionAsync(cancellationToken)
            .ConfigureAwait(false);

        var number = $"{journal.NumberPrefix}-{await AllocateNumberAsync(journal, cancellationToken)
            .ConfigureAwait(false):000000}";

        var entry = BuildEntry(request, tenantId, period!.Id, number);

        for (var index = 0; index < request.Lines.Count; index++)
        {
            entry.Lines.Add(BuildLine(request.Lines[index], tenantId, entry.Id, index + 1));
        }

        context.GlEntries.Add(entry);

        // Draft first: the lines are written while the entry can still be shaped, and the flip below is
        // the single act that makes it permanent.
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

        entry.Status = GlEntryStatus.Posted;

        try
        {
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        }
        catch (Exception exception) when (IsDatabaseRefusal(exception))
        {
            await transaction.RollbackAsync(cancellationToken).ConfigureAwait(false);

            // The balance trigger is deferred to commit, so this is where an entry the application
            // wrongly accepted is actually stopped — and where the number it took is given back.
            return new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                PostingErrorCode.RefusedByDatabase,
                $"The database refused this posting: {RootMessage(exception)}")]);
        }

        return new PostingOutcome(PostingOutcomeStatus.Posted, [], entry.Id, number);
    }

    public async Task<PostingOutcome> ReverseAsync(
        Guid entryId,
        DateOnly reversalDate,
        string memo,
        CancellationToken cancellationToken = default)
    {
        var original = await context.GlEntries
            .Include(each => each.Lines)
            .FirstOrDefaultAsync(each => each.Id == entryId, cancellationToken)
            .ConfigureAwait(false);

        if (original is null)
        {
            return new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                PostingErrorCode.EntryNotFound,
                "There is no entry here with that id.")]);
        }

        if (original.Status != GlEntryStatus.Posted)
        {
            return new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                PostingErrorCode.EntryNotPosted,
                $"{original.Number} is still a draft. Edit it instead of reversing it — a reversal "
                + "exists to correct a fact the ledger has already stated.")]);
        }

        // Checked before the mirror is built so a double click cannot post two corrections. The partial
        // unique index in the enforcement migration is the same rule; this is the readable version of it,
        // and the race the index exists to lose is one user's second click.
        var alreadyReversed = await context.GlEntries
            .AnyAsync(each => each.ReversesEntryId == entryId, cancellationToken)
            .ConfigureAwait(false);

        if (alreadyReversed)
        {
            return new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                PostingErrorCode.AlreadyReversed,
                $"{original.Number} has already been reversed. A second reversal would double the "
                + "correction while leaving both entries looking like the single one intended.")]);
        }

        var mirrored = original.Lines
            .OrderBy(line => line.LineOrder)
            .Select(Mirror)
            .ToList();

        return await PostAsync(new PostingRequest
        {
            JournalCode = original.JournalCode,
            PostingDate = reversalDate,
            // Keyed on the entry being corrected, so the database's idempotency index makes a retried
            // reversal the same posting rather than a second one.
            SourceType = "ledger.reversal",
            SourceId = original.Id,
            Memo = memo,
            ReversesEntryId = original.Id,
            Lines = mirrored,
        }, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// Confirms every account is one this tenant owns and can actually be posted to.
    /// </summary>
    /// <remarks>
    /// One query for the whole set rather than one per line: the failure being guarded against — a line
    /// mapped at a parent account, which is a grouping and not somewhere to post — is the same on the
    /// twentieth line as on the first, and twenty round trips to find that out is twenty more chances for
    /// the answer to change underneath.
    ///
    /// The tenant filter on <see cref="GarmentsDbContext"/> makes "not mine" and "does not exist" the same
    /// answer here, which is the intended shape: a guessed account id from another company must not be
    /// distinguishable from a typo.
    /// </remarks>
    private async Task<PostingOutcome?> RefuseUnpostableAccountsAsync(
        PostingRequest request,
        CancellationToken cancellationToken)
    {
        var ids = request.Lines.Select(line => line.AccountId).Distinct().ToArray();

        var found = await context.Accounts
            .Where(account => ids.Contains(account.Id))
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        var byId = found.ToDictionary(account => account.Id);

        for (var index = 0; index < request.Lines.Count; index++)
        {
            if (!byId.TryGetValue(request.Lines[index].AccountId, out var account))
            {
                return new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                    PostingErrorCode.AccountUnpostable,
                    "A line uses an account this company does not have.",
                    index)]);
            }

            if (!account.IsPostable || !account.IsActive)
            {
                return new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                    PostingErrorCode.AccountUnpostable,
                    $"'{account.Code} {account.Name}' cannot be posted to because "
                    + $"{(account.IsPostable ? "it is inactive" : "it is a parent account, not a leaf")}.",
                    index)]);
            }
        }

        return null;
    }

    private async Task<(FiscalPeriod? Period, PostingOutcome? Refusal)> FindOpenPeriodAsync(
        PostingRequest request,
        CancellationToken cancellationToken)
    {
        var period = await context.FiscalPeriods
            .Where(each => each.StartDate <= request.PostingDate && each.EndDate >= request.PostingDate)
            .FirstOrDefaultAsync(cancellationToken)
            .ConfigureAwait(false);

        if (period is null)
        {
            return (null, new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                PostingErrorCode.PeriodNotFound,
                $"No fiscal period covers {request.PostingDate:yyyy-MM-dd}. "
                + "Provision the company's year before posting into it.")]));
        }

        if (!period.AcceptsPosting(request.PostingDate))
        {
            var lockedThrough = period.HardLockedOn ?? period.TaxLockedOn ?? period.SoftLockedOn;

            return (null, new PostingOutcome(PostingOutcomeStatus.Rejected, [new PostingError(
                PostingErrorCode.PeriodLocked,
                $"Period {period.Number} of fiscal year {period.FiscalYear} is locked through "
                + $"{lockedThrough:yyyy-MM-dd}, so {request.PostingDate:yyyy-MM-dd} cannot be posted into it. "
                + "Lifting a lock is a separate act with its own audit entry.")]));
        }

        return (period, null);
    }

    private async Task<GlEntry?> FindExistingAsync(PostingRequest request, CancellationToken cancellationToken)
    {
        if (request.SourceId is null)
        {
            return null;
        }

        return await context.GlEntries
            .FirstOrDefaultAsync(
                entry => entry.SourceType == request.SourceType
                    && entry.SourceId == request.SourceId
                    && entry.Iteration == request.Iteration,
                cancellationToken)
            .ConfigureAwait(false);
    }

    /// <summary>
    /// Takes the next journal number, returning the number the entry should carry.
    /// </summary>
    /// <remarks>
    /// A single <c>UPDATE</c> that increments, then a reload of the locked row — not a read followed by a
    /// write. Two postings reading <c>next_number</c> before either wrote would each receive the same
    /// number, and the unique index would reject the second as a duplicate: a collision that looks like a
    /// bug in the index and is really two writers trusting a value each read too early. The increment
    /// takes the row lock and holds it until this transaction ends, and the reload reads
    /// <c>next_number - 1</c> because after the increment the column names the number <i>after</i> the one
    /// just handed out.
    /// </remarks>
    private async Task<int> AllocateNumberAsync(Journal journal, CancellationToken cancellationToken)
    {
        var consumed = await context.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE journals SET next_number = next_number + 1 WHERE id = {journal.Id}",
            cancellationToken)
            .ConfigureAwait(false);

        if (consumed != 1)
        {
            throw new InvalidOperationException(
                $"Allocating a number for journal '{journal.Code}' updated {consumed} rows, and the journal "
                + "row that should have been locked is not the one this posting read.");
        }

        await context.Entry(journal).ReloadAsync(cancellationToken).ConfigureAwait(false);

        return journal.NextNumber - 1;
    }

    private GlEntry BuildEntry(PostingRequest request, TenantId tenantId, Guid periodId, string number) => new()
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        Number = number,
        JournalCode = request.JournalCode,
        PeriodId = periodId,
        PostingDate = request.PostingDate,
        CreatedAt = DateTimeOffset.UtcNow,
        Memo = request.Memo,
        SourceType = request.SourceType,
        SourceId = request.SourceId,
        Iteration = request.Iteration,
        ReversesEntryId = request.ReversesEntryId,
        Status = GlEntryStatus.Draft,
        CreatedByUserId = currentUser.UserId,
        PostedByUserId = currentUser.UserId,
    };

    /// <summary>
    /// Flips one line to the other side, changing nothing else about it.
    /// </summary>
    /// <remarks>
    /// The account, currency, current-currency amount and rate all carry over untouched. Only the side
    /// moves: a reversal that also re-derived the exchange difference would be a second, different
    /// correction riding along with the one that was asked for.
    /// </remarks>
    private static PostingLine Mirror(GlLine source)
    {
        var currency = Currency.Of(source.Currency);

        return new PostingLine
        {
            AccountId = source.AccountId,
            Debit = source.Credit is null ? null : new Money(currency, source.Credit.Value),
            Credit = source.Debit is null ? null : new Money(currency, source.Debit.Value),
            Currency = source.Currency,
            AmountInCurrency = source.AmountInCurrency,
            ExchangeRate = source.ExchangeRate,
            ExchangeRateDate = source.ExchangeRateDate,
            AnalysisId = source.AnalysisId,
            Memo = source.Memo,
        };
    }

    private static GlLine BuildLine(PostingLine source, TenantId tenantId, Guid entryId, int lineOrder) => new()
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        EntryId = entryId,
        AccountId = source.AccountId,
        LineOrder = lineOrder,
        Debit = source.Debit?.Amount,
        Credit = source.Credit?.Amount,
        Currency = source.Currency,
        AmountInCurrency = source.AmountInCurrency,
        ExchangeRate = source.ExchangeRate,
        ExchangeRateDate = source.ExchangeRateDate,
        AnalysisId = source.AnalysisId,
        Memo = source.Memo,
    };

    /// <summary>
    /// Whether an exception is the database enforcing a rule, as opposed to the process failing.
    /// </summary>
    /// <remarks>
    /// Deliberately narrow, and keyed on SQLSTATE <c>P0001</c> — the code every <c>RAISE EXCEPTION</c> in
    /// this schema carries — rather than on a message prefix. A lost connection is not a refused posting,
    /// and reporting it as one would tell the caller their document is invalid when nothing was written
    /// and the ledger is fine, which is how someone re-keys an entry that already saved.
    /// </remarks>
    private static bool IsDatabaseRefusal(Exception exception) =>
        Unwind(exception).Any(each => each is Npgsql.PostgresException postgres
            && postgres.SqlState == "P0001");

    private static string RootMessage(Exception exception) => Unwind(exception).Last().Message;

    private static IEnumerable<Exception> Unwind(Exception exception)
    {
        for (Exception? current = exception; current is not null; current = current.InnerException)
        {
            yield return current;
        }
    }
}
