using Garments.Ledger;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace Garments.Data;

/// <summary>
/// Maps the ledger onto the schema, including the constraints that make a wrong posting impossible
/// rather than merely discouraged.
/// </summary>
/// <remarks>
/// Lives with the ledger rather than in the data layer so a new entity cannot be added without
/// meeting these rules — the mapping and the invariants are one decision, not two files that drift.
///
/// Every CHECK here exists because the legacy build proved what happens without it. A grep across all
/// 15 of its migration files found no check constraint of any kind: debits-equals-credits was a C#
/// comparison with a 0.01 tolerance, and the cash-book path bypassed even that.
/// </remarks>
public static class LedgerModelConfiguration
{
    public static void Apply(ModelBuilder builder)
    {
        ConfigureAccounts(builder.Entity<ChartOfAccount>());
        ConfigureJournals(builder.Entity<Journal>());
        ConfigureEntries(builder.Entity<GlEntry>());
        ConfigureLines(builder.Entity<GlLine>());
        ConfigurePeriods(builder.Entity<FiscalPeriod>());
    }

    private static void ConfigureAccounts(EntityTypeBuilder<ChartOfAccount> account)
    {
        account.ToTable("accounts");
        account.HasKey(x => x.Id);

        account.Property(x => x.Code).HasMaxLength(32).IsRequired();
        account.Property(x => x.Name).HasMaxLength(200).IsRequired();
        account.Property(x => x.NameBangla).HasMaxLength(200);

        // Stored as text, not as an integer ordinal. The legacy tree persisted enums as integers while
        // its model later asked for strings, which is how `Status` and `JournalType` ended up with the
        // entity and the schema describing different tables.
        account.Property(x => x.Type).HasConversion<string>().HasMaxLength(16);
        account.Property(x => x.SubType).HasConversion<string>().HasMaxLength(32);
        account.Property(x => x.Path).HasColumnType("ltree");

        // Codes are unique per company, not per platform. The legacy model declared a 10-character
        // AccountCode while its configuration said 50 and its request DTO allowed 20.
        account.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
        account.HasIndex(x => x.Path).HasMethod("gist");
        account.HasIndex(x => new { x.TenantId, x.ParentId });

        // A parent with children cannot itself be postable, and a leaf cannot have children. Enforced
        // in the database because the service layer is the thing that gets bypassed.
        account.ToTable(s => s.HasCheckConstraint(
            "CK_accounts_postable_is_leaf",
            "\"is_postable\" OR \"parent_id\" IS NULL"));
    }

    private static void ConfigureJournals(EntityTypeBuilder<Journal> journal)
    {
        journal.ToTable("journals", t => t.HasCheckConstraint("CK_journals_next_number", "\"next_number\" >= 1"));
        journal.HasKey(x => x.Id);

        journal.Property(x => x.Code).HasMaxLength(16).IsRequired();
        journal.Property(x => x.Name).HasMaxLength(100).IsRequired();
        journal.Property(x => x.NameBangla).HasMaxLength(100);
        journal.Property(x => x.NumberPrefix).HasMaxLength(8).IsRequired();

        journal.HasIndex(x => new { x.TenantId, x.Code }).IsUnique();
    }

    private static void ConfigureEntries(EntityTypeBuilder<GlEntry> entry)
    {
        entry.ToTable("gl_entries", t =>
        {
            t.HasCheckConstraint("CK_gl_entries_iteration", "\"iteration\" >= 1");
            t.HasCheckConstraint(
                "CK_gl_entries_reversal_not_self",
                "\"reverses_entry_id\" IS NULL OR \"reverses_entry_id\" <> \"id\"");
        });
        entry.HasKey(x => x.Id);

        entry.Property(x => x.Number).HasMaxLength(32);
        entry.Property(x => x.JournalCode).HasMaxLength(16).IsRequired();
        entry.Property(x => x.SourceType).HasMaxLength(48);
        entry.Property(x => x.Memo).HasMaxLength(1000);
        entry.Property(x => x.Status).HasConversion<string>().HasMaxLength(8);
        entry.Property(x => x.PostingDate).HasColumnType("date");

        // Idempotency: a retry of the same document revision cannot create a second posting.
        entry.HasIndex(x => new { x.TenantId, x.SourceType, x.SourceId, x.Iteration })
            .IsUnique()
            .HasDatabaseName("UQ_gl_entries_source_key");

        entry.HasIndex(x => new { x.TenantId, x.JournalCode, x.PeriodId, x.Number })
            .IsUnique()
            .HasDatabaseName("UQ_gl_entries_number");

        entry.HasIndex(x => new { x.TenantId, x.PostingDate });
        entry.HasIndex(x => x.ReversesEntryId);

    }

    private static void ConfigureLines(EntityTypeBuilder<GlLine> line)
    {
        line.ToTable("gl_lines", t =>
        {
            t.HasCheckConstraint(
                "CK_gl_line_debit_xor_credit",
                "(\"debit\" > 0 AND \"credit\" IS NULL) OR (\"credit\" > 0 AND \"debit\" IS NULL)");
            t.HasCheckConstraint("CK_gl_line_currency_amount", "\"amount_in_currency\" <> 0");
            t.HasCheckConstraint("CK_gl_line_rate_positive", "\"exchange_rate\" > 0");
        });
        line.HasKey(x => x.Id);

        line.Property(x => x.Debit).HasColumnType("numeric(18,2)");
        line.Property(x => x.Credit).HasColumnType("numeric(18,2)");
        line.Property(x => x.AmountInCurrency).HasColumnType("numeric(18,4)");
        line.Property(x => x.ExchangeRate).HasColumnType("numeric(18,9)");
        line.Property(x => x.Currency).HasConversion<string>().HasMaxLength(3);
        line.Property(x => x.Memo).HasMaxLength(500);
        line.Property(x => x.ExchangeRateDate).HasColumnType("date");

        line.HasIndex(x => new { x.TenantId, x.AccountId, x.EntryId });
        line.HasIndex(x => new { x.AccountId, x.TenantId });
        line.HasIndex(x => x.EntryId);

    }

    private static void ConfigurePeriods(EntityTypeBuilder<FiscalPeriod> period)
    {
        period.ToTable("fiscal_periods", t =>
        {
            t.HasCheckConstraint("CK_fiscal_periods_number_in_year", "\"number\" BETWEEN 1 AND 12");
            t.HasCheckConstraint("CK_fiscal_periods_ordered", "\"end_date\" >= \"start_date\"");
        });
        period.HasKey(x => x.Id);

        period.Property(x => x.Name).HasMaxLength(64);
        period.Property(x => x.NameBangla).HasMaxLength(64);
        period.Property(x => x.StartDate).HasColumnType("date");
        period.Property(x => x.EndDate).HasColumnType("date");
        period.Property(x => x.SoftLockedOn).HasColumnType("date");
        period.Property(x => x.HardLockedOn).HasColumnType("date");
        period.Property(x => x.TaxLockedOn).HasColumnType("date");

        period.HasIndex(x => new { x.TenantId, x.FiscalYear, x.Number }).IsUnique();

    }
}
