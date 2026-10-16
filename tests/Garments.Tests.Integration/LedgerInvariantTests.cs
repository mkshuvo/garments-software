using Garments.Core;
using Garments.Data;
using Garments.Ledger;
using Garments.Platform.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Garments.Tests.Integration;

/// <summary>
/// Proves the ledger's accounting rules reject a wrong posting <i>in the database</i>.
/// </summary>
/// <remarks>
/// <para>
/// This is the P2 gate. The invariants are only real if a write that breaks one fails, so each test
/// attempts a genuinely invalid posting against the migrated schema and asserts the database refused it,
/// naming which invariant fired.
/// </para>
///
/// <para>
/// Written against <see cref="GarmentsDbContext"/> on a real Postgres rather than through HTTP, because
/// what is under test is the schema: a posting path that validates in C# and a schema that enforces
/// nothing would pass an endpoint test and still corrupt a ledger on the first code path that forgot to
/// validate. The legacy build is that case study.
/// </para>
///
/// <para>
/// <b>Each test carries a matching refusal.</b> The positive control below is not a courtesy: five
/// triggers that reject everything would make four of these tests green while the product was unusable.
/// </para>
/// </remarks>
public sealed class LedgerInvariantTests(WebAppFactory factory) : IClassFixture<WebAppFactory>
{
    [Fact]
    public async Task A_balanced_entry_in_an_open_period_posts()
    {
        var world = await ProvisionAsync();

        var failure = await Record.ExceptionAsync(() => WriteAsync(world, entry =>
        {
            entry.Lines.Add(Line(world.Cash, debit: 500m));
            entry.Lines.Add(Line(world.Income, credit: 500m));
        }));

        Assert.Null(failure);
    }

    [Fact]
    public async Task An_unbalanced_posted_entry_is_refused_by_the_database()
    {
        var world = await ProvisionAsync();

        var message = await StoreErrorAsync(() => WriteAsync(world, entry =>
        {
            entry.Lines.Add(Line(world.Cash, debit: 500m));
            entry.Lines.Add(Line(world.Income, credit: 499.99m));
        }));

        Assert.Contains("Invariant I1", message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_one_paisa_imbalance_is_refused_because_there_is_no_tolerance()
    {
        var world = await ProvisionAsync();

        var message = await StoreErrorAsync(() => WriteAsync(world, entry =>
        {
            entry.Lines.Add(Line(world.Cash, debit: 1.00m));
            entry.Lines.Add(Line(world.Income, credit: 0.99m));
        }));

        Assert.Contains("Invariant I1", message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_single_sided_posted_entry_is_refused()
    {
        // The exact row the legacy cash book wrote: one line, status Posted, nothing checking it. The
        // line-level CHECK passes, because one line with a debit and no credit is a well-formed line.
        var world = await ProvisionAsync();

        var message = await StoreErrorAsync(() => WriteAsync(world, entry =>
        {
            entry.Lines.Add(Line(world.Cash, debit: 500m));
        }));

        Assert.Contains("Invariant I1", message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_line_with_both_sides_is_refused()
    {
        var world = await ProvisionAsync();

        var message = await StoreErrorAsync(() => WriteAsync(world, entry =>
        {
            entry.Lines.Add(new GlLine
            {
                TenantId = world.TenantId,
                AccountId = world.Cash,
                LineOrder = 1,
                Debit = 100m,
                Credit = 100m,
                Currency = CurrencyCode.Bdt,
                AmountInCurrency = 100m,
                ExchangeRate = 1m,
            });
        }));

        Assert.Contains("CK_gl_line_debit_xor_credit", message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_posted_entry_cannot_be_changed()
    {
        var world = await ProvisionAsync();

        await WriteAsync(world, entry =>
        {
            entry.Lines.Add(Line(world.Cash, debit: 500m));
            entry.Lines.Add(Line(world.Income, credit: 500m));
        });

        var message = await StoreErrorAsync(async () =>
        {
            using var scope = TenantScope.Open(
                factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

            var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

            // The memo is deliberately the only thing touched: correcting a posting by editing its text
            // is how an audit trail becomes decoration while every number still looks reconciled.
            var posted = await context.GlEntries.SingleAsync();
            posted.Memo = "looks fine now";

            await context.SaveChangesAsync();
        });

        Assert.Contains("Invariant I3", message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_line_cannot_be_added_to_a_posted_entry()
    {
        var world = await ProvisionAsync();

        await WriteAsync(world, entry =>
        {
            entry.Lines.Add(Line(world.Cash, debit: 500m));
            entry.Lines.Add(Line(world.Income, credit: 500m));
        });

        // A balanced pair appended on its own satisfies every other rule in this migration; only
        // immutability refuses it. This is why the line trigger covers insert and not just update.
        var message = await StoreErrorAsync(async () =>
        {
            using var scope = TenantScope.Open(
                factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

            var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

            var posted = await context.GlEntries.SingleAsync();

            context.GlLines.Add(new GlLine
            {
                TenantId = world.TenantId,
                EntryId = posted.Id,
                AccountId = world.Income,
                LineOrder = 3,
                Credit = 250m,
                Currency = CurrencyCode.Bdt,
                AmountInCurrency = 250m,
                ExchangeRate = 1m,
            });

            context.GlLines.Add(new GlLine
            {
                TenantId = world.TenantId,
                EntryId = posted.Id,
                AccountId = world.Cash,
                LineOrder = 4,
                Debit = 250m,
                Currency = CurrencyCode.Bdt,
                AmountInCurrency = 250m,
                ExchangeRate = 1m,
            });

            await context.SaveChangesAsync();
        });

        Assert.Contains("Invariant I3", message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_posted_entrys_lines_cannot_be_deleted()
    {
        var world = await ProvisionAsync();

        await WriteAsync(world, entry =>
        {
            entry.Lines.Add(Line(world.Cash, debit: 500m));
            entry.Lines.Add(Line(world.Income, credit: 500m));
        });

        var message = await StoreErrorAsync(async () =>
        {
            using var scope = TenantScope.Open(
                factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

            var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

            var line = await context.GlLines.OrderBy(x => x.LineOrder).Skip(1).SingleAsync();
            context.GlLines.Remove(line);

            await context.SaveChangesAsync();
        });

        Assert.Contains("Invariant I3", message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task A_locked_period_refuses_a_backdated_posting()
    {
        var world = await ProvisionAsync();

        await LockPeriodAsync(world);

        var message = await StoreErrorAsync(() => WriteAsync(world, entry =>
        {
            entry.Lines.Add(Line(world.Cash, debit: 500m));
            entry.Lines.Add(Line(world.Income, credit: 500m));
        }));

        Assert.Contains("Invariant I6", message, StringComparison.Ordinal);
    }

    private static GlLine Line(Guid accountId, decimal debit = 0m, decimal credit = 0m) => new()
    {
        AccountId = accountId,
        LineOrder = debit > 0m ? 1 : 2,
        Debit = debit > 0m ? debit : null,
        Credit = credit > 0m ? credit : null,
        Currency = CurrencyCode.Bdt,
        AmountInCurrency = debit > 0m ? debit : credit,
        ExchangeRate = 1m,
    };

    /// <summary>
    /// Creates one company's worth of ledger and returns the ids a posting needs.
    /// </summary>
    private async Task<LedgerWorld> ProvisionAsync()
    {
        var slug = "led-" + Guid.NewGuid().ToString("N")[..8];

        using (var systemScope = TenantScope.OpenSystem(
                   factory.Services.GetRequiredService<IServiceScopeFactory>()))
        {
            await systemScope.ServiceProvider.GetRequiredService<ITenantDirectory>().CreateAsync(new Tenant
            {
                Id = TenantId.New(),
                Slug = slug,
                DisplayName = slug,
            });
        }

        var tenantId = (await ReadTenantAsync(slug)).Id;
        var start = new DateOnly(2026, 7, 1);

        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), tenantId);

        var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

        var cash = NewAccount(tenantId, "1000", "Cash", AccountType.Asset, AccountSubType.Cash, "cash");
        var income = NewAccount(tenantId, "4000", "Sales Revenue", AccountType.Income, AccountSubType.SalesRevenue, "sales");

        context.Accounts.AddRange(cash, income);
        context.Journals.Add(new Journal
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Code = "GL",
            Name = "General",
            NumberPrefix = "GL",
        });
        context.FiscalPeriods.Add(new FiscalPeriod
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Number = 1,
            FiscalYear = 2026,
            StartDate = start,
            EndDate = start.AddMonths(1).AddDays(-1),
            Name = "July 2026",
        });

        await context.SaveChangesAsync();

        return new LedgerWorld(tenantId, cash.Id, income.Id, start);
    }

    private async Task<Tenant> ReadTenantAsync(string slug)
    {
        using var systemScope = TenantScope.OpenSystem(
            factory.Services.GetRequiredService<IServiceScopeFactory>());

        var directory = systemScope.ServiceProvider.GetRequiredService<ITenantDirectory>();
        var tenant = await directory.FindBySlugAsync(slug);

        Assert.NotNull(tenant);
        return tenant;
    }

    private async Task LockPeriodAsync(LedgerWorld world)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

        var period = await context.FiscalPeriods.SingleAsync();

        // Locked through the last day, which is the whole period. An open period would accept the same
        // posting, and that is the positive control above.
        period.SoftLockedOn = period.EndDate;

        await context.SaveChangesAsync();
    }

    private async Task WriteAsync(LedgerWorld world, Action<GlEntry> shape, bool post = true)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

        var period = await context.FiscalPeriods.SingleAsync();
        var number = (await context.GlEntries.CountAsync()) + 1;

        var entry = new GlEntry
        {
            Id = Guid.NewGuid(),
            TenantId = world.TenantId,
            Number = $"GL-{number:000}",
            JournalCode = "GL",
            PeriodId = period.Id,
            PostingDate = world.PostingDate,
            SourceType = "test.manual",
            SourceId = Guid.NewGuid(),
            Memo = "written by the invariant suite",
            Status = GlEntryStatus.Draft,
        };

        shape(entry);

        foreach (var line in entry.Lines)
        {
            line.TenantId = world.TenantId;
        }

        context.GlEntries.Add(entry);

        // Two saves, because that is the protocol the triggers impose: a Posted entry's lines are
        // untouchable, so the lines have to exist while the entry is still a draft.
        await context.SaveChangesAsync();

        if (!post)
        {
            return;
        }

        entry.Status = GlEntryStatus.Posted;
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Runs a write expected to fail and returns the whole exception chain as text.
    /// </summary>
    /// <remarks>
    /// The success branch throws rather than returning, because "the invariant did not fire" is the
    /// finding here — a test that simply failed an assertion would report it as a mismatch of two
    /// strings and hide the fact that an unbalanced posting reached the general ledger.
    /// </remarks>
    private static async Task<string> StoreErrorAsync(Func<Task> action)
    {
        try
        {
            await action();
        }
        catch (Exception exception)
        {
            return string.Join(" | ", Unwind(exception).Select(each => each.Message));
        }

        throw new InvalidOperationException(
            "The write succeeded, so the database did not enforce the invariant under test.");
    }

    private static IEnumerable<Exception> Unwind(Exception exception)
    {
        for (Exception? current = exception; current is not null; current = current.InnerException)
        {
            yield return current;
        }
    }
    private static ChartOfAccount NewAccount(
        TenantId tenantId,
        string code,
        string name,
        AccountType type,
        AccountSubType subType,
        string path) => new()
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Code = code,
            Name = name,
            Type = type,
            SubType = subType,
            // A leaf: the table's own check refuses a postable account that has a parent.
            ParentId = null,
            Path = path,
            IsPostable = true,
            IsActive = true,
        };
}
