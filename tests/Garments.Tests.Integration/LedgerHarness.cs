using Garments.Core;
using Garments.Data;
using Garments.Ledger;
using Garments.Platform.Tenancy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Garments.Tests.Integration;

/// <summary>
/// Creates one company's worth of ledger and writes postings into it, for the suites that test the
/// kernel rather than the endpoints.
/// </summary>
/// <remarks>
/// Extracted once a second suite needed the same world. Two copies of ledger provisioning is how a test
/// suite ends up proving different things while looking like it proves the same ones: the day a rule
/// changes in one copy, the other keeps passing against a world that no longer exists.
///
/// Each call creates a brand-new tenant rather than sharing one. Postings are journal-numbered, and a
/// test that asserted "the first number is 000001" against a tenant another test had already written to
/// would fail for a reason that had nothing to do with what it was checking.
/// </remarks>
internal sealed class LedgerHarness(WebAppFactory factory)
{
    internal async Task<LedgerWorld> ProvisionAsync()
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

        var tenantId = await ReadTenantIdAsync(slug);
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

    /// <summary>
    /// Adds a non-postable parent account to a world, for the rule that grouping accounts are not
    /// somewhere money can be written.
    /// </summary>
    internal async Task<Guid> AddParentAccountAsync(LedgerWorld world)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

        var parent = new ChartOfAccount
        {
            Id = Guid.NewGuid(),
            TenantId = world.TenantId,
            Code = "100",
            Name = "Current Assets",
            Type = AccountType.Asset,
            SubType = AccountSubType.Cash,
            Path = "assets",
            IsPostable = false,
            IsActive = true,
        };

        context.Accounts.Add(parent);
        await context.SaveChangesAsync();

        return parent.Id;
    }

    /// <summary>An account id belonging to a different company, for cross-tenant refusal.</summary>
    internal async Task<Guid> ForeignAccountIdAsync()
    {
        var other = await ProvisionAsync();
        return other.Cash;
    }

    internal async Task LockPeriodAsync(LedgerWorld world)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

        var period = await context.FiscalPeriods.SingleAsync();

        // Locked through its last day, which is the whole period. An open period accepts the identical
        // posting, and that is the positive control beside every refusal.
        period.SoftLockedOn = period.EndDate;

        await context.SaveChangesAsync();
    }

    /// <summary>Every journal number the tenant's entries carry, in the order they were written.</summary>
    internal async Task<IReadOnlyList<string>> NumbersAsync(LedgerWorld world)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

        return await context.GlEntries
            .OrderBy(entry => entry.Number)
            .Select(entry => entry.Number)
            .ToListAsync();
    }

    /// <summary>
    /// Posts a balanced pair through <see cref="Poster"/>, which is the path the product uses.
    /// </summary>
    /// <remarks>
    /// Returns the outcome rather than throwing on failure: several tests are about the refusals, and a
    /// helper that threw would hide the code that says which rule fired.
    /// </remarks>
    internal Task<PostingOutcome> PostAsync(
        LedgerWorld world,
        decimal amount = 500m,
        string? sourceType = "test.manual",
        Guid? sourceId = null,
        int iteration = 1,
        DateOnly? postingDate = null,
        Guid? debitAccountId = null,
        Guid? creditAccountId = null)
    {
        var request = new PostingRequest
        {
            JournalCode = "GL",
            PostingDate = postingDate ?? world.PostingDate,
            SourceType = sourceType ?? "test.manual",
            SourceId = sourceId,
            Iteration = iteration,
            Memo = "written by the test suite",
            Lines =
            [
                Debit(debitAccountId ?? world.Cash, amount),
                Credit(creditAccountId ?? world.Income, amount),
            ],
        };

        return PostAsync(world, request);
    }

    internal async Task<PostingOutcome> PostAsync(LedgerWorld world, PostingRequest request)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var poster = scope.ServiceProvider.GetRequiredService<IPoster>();

        return await poster.PostAsync(request);
    }

    /// <summary>
    /// Writes an entry straight through the context, bypassing <see cref="IPoster"/>.
    /// </summary>
    /// <remarks>
    /// Only for the invariant suite, which must be able to build a posting the application layer would
    /// refuse before it ever reached the schema. Testing a database rule through a service that already
    /// enforces it proves the service, not the rule.
    /// </remarks>
    internal async Task WriteRawAsync(LedgerWorld world, Action<GlEntry> shape, bool post = true)
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
            Number = $"RAW-{number:000}",
            JournalCode = "GL",
            PeriodId = period.Id,
            PostingDate = world.PostingDate,
            SourceType = "test.raw",
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

        // Two saves, because that is the protocol the immutability trigger imposes: a posted entry's
        // lines are untouchable, so they have to exist while the entry is still a draft.
        await context.SaveChangesAsync();

        if (!post)
        {
            return;
        }

        entry.Status = GlEntryStatus.Posted;
        await context.SaveChangesAsync();
    }

    internal static PostingLine Debit(Guid accountId, decimal amount) => new()
    {
        AccountId = accountId,
        Debit = Money.Bdt(amount),
        AmountInCurrency = amount,
        Currency = CurrencyCode.Bdt,
        ExchangeRate = 1m,
    };

    internal static PostingLine Credit(Guid accountId, decimal amount) => new()
    {
        AccountId = accountId,
        Credit = Money.Bdt(amount),
        AmountInCurrency = amount,
        Currency = CurrencyCode.Bdt,
        ExchangeRate = 1m,
    };

    internal static GlLine Line(Guid accountId, decimal debit = 0m, decimal credit = 0m) => new()
    {
        AccountId = accountId,
        LineOrder = debit > 0m ? 1 : 2,
        Debit = debit > 0m ? debit : null,
        Credit = credit > 0m ? credit : null,
        Currency = CurrencyCode.Bdt,
        AmountInCurrency = debit > 0m ? debit : credit,
        ExchangeRate = 1m,
    };

    /// <summary>An entry id belonging to this company, newest first.</summary>
    internal async Task<IReadOnlyList<Guid>> EntryIdsAsync(LedgerWorld world)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

        return await context.GlEntries
            .OrderByDescending(entry => entry.CreatedAt)
            .Select(entry => entry.Id)
            .ToListAsync();
    }

    /// <summary>
    /// What each account is left holding after every entry in the world, debit positive.
    /// </summary>
    /// <remarks>
    /// The check that a reversal actually undid something. Two balanced entries side by side are a
    /// balanced ledger whether or not the second one cancels the first, so "the trial balance still
    /// balances" is not evidence that a correction worked — only the per-account net is.
    /// </remarks>
    internal async Task<IReadOnlyDictionary<Guid, decimal>> NetByAccountAsync(LedgerWorld world)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var context = scope.ServiceProvider.GetRequiredService<GarmentsDbContext>();

        var lines = await context.GlLines.ToListAsync();

        return lines
            .GroupBy(line => line.AccountId)
            .ToDictionary(
                group => group.Key,
                group => group.Sum(line => (line.Debit ?? 0m) - (line.Credit ?? 0m)));
    }

    internal async Task<PostingOutcome> ReverseAsync(
        LedgerWorld world,
        Guid entryId,
        string memo = "corrected by the test suite",
        DateOnly? reversalDate = null)
    {
        using var scope = TenantScope.Open(
            factory.Services.GetRequiredService<IServiceScopeFactory>(), world.TenantId);

        var poster = scope.ServiceProvider.GetRequiredService<IPoster>();

        return await poster.ReverseAsync(entryId, reversalDate ?? world.PostingDate, memo);
    }

    private async Task<TenantId> ReadTenantIdAsync(string slug)
    {
        using var systemScope = TenantScope.OpenSystem(
            factory.Services.GetRequiredService<IServiceScopeFactory>());

        var directory = systemScope.ServiceProvider.GetRequiredService<ITenantDirectory>();
        var tenant = await directory.FindBySlugAsync(slug);

        Assert.NotNull(tenant);
        return tenant.Id;
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
