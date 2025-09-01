using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using GarmentsERP.API.Data;

namespace GarmentsERP.API.Config
{
    /// <summary>
    /// Database configuration and optimization settings
    /// </summary>
    public static class DatabaseConfig
    {
        /// <summary>
        /// Configure database services with optimization settings
        /// </summary>
        public static IServiceCollection AddDatabaseConfiguration(
            this IServiceCollection services, 
            IConfiguration configuration)
        {
            // Add DbContext with optimized settings
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    npgsqlOptions =>
                    {
                        // Enable connection resiliency
                        npgsqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 3,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorCodesToAdd: null);

                        // Enable performance optimizations
                        npgsqlOptions.CommandTimeout(30);
                        npgsqlOptions.MaxBatchSize(100);
                        
                        // Enable query splitting for better performance
                        npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    });

                // Enable detailed logging in development
                if (configuration.GetValue<bool>("EnableDetailedLogging"))
                {
                    options.EnableSensitiveDataLogging();
                    options.EnableDetailedErrors();
                }

                // Configure query optimization
                options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
                
                // Enable lazy loading (if needed)
                // options.UseLazyLoadingProxies();
            });

            // Configure connection pooling
            services.AddDbContextPool<ApplicationDbContext>(options =>
            {
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection"),
                    npgsqlOptions =>
                    {
                        npgsqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 3,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorCodesToAdd: null);
                        
                        npgsqlOptions.CommandTimeout(30);
                        npgsqlOptions.MaxBatchSize(100);
                        npgsqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    });
            }, poolSize: 128);

            return services;
        }

        /// <summary>
        /// Configure database context with journal entry optimizations
        /// </summary>
        public static void ConfigureJournalEntryOptimizations(this ModelBuilder modelBuilder)
        {
            // Configure JournalEntry entity for optimal performance
            modelBuilder.Entity<Models.Accounting.JournalEntry>(entity =>
            {
                // Set table name
                entity.ToTable("JournalEntries");

                // Configure primary key
                entity.HasKey(e => e.Id);

                // Configure indexes for optimal query performance
                entity.HasIndex(e => new { e.TransactionDate, e.Status })
                    .HasDatabaseName("IX_JournalEntry_DateRange_Status");

                entity.HasIndex(e => e.ReferenceNumber)
                    .HasDatabaseName("IX_JournalEntry_ReferenceNumber");

                entity.HasIndex(e => e.JournalNumber)
                    .HasDatabaseName("IX_JournalEntry_JournalNumber");

                entity.HasIndex(e => e.JournalType)
                    .HasDatabaseName("IX_JournalEntry_JournalType");

                entity.HasIndex(e => e.TotalDebit)
                    .HasDatabaseName("IX_JournalEntry_TotalDebit");

                entity.HasIndex(e => e.TotalCredit)
                    .HasDatabaseName("IX_JournalEntry_TotalCredit");

                entity.HasIndex(e => new { e.TransactionDate, e.TotalDebit })
                    .HasDatabaseName("IX_JournalEntry_Date_Debit");

                entity.HasIndex(e => new { e.TransactionDate, e.TotalCredit })
                    .HasDatabaseName("IX_JournalEntry_Date_Credit");

                entity.HasIndex(e => e.CreatedByUserId)
                    .HasDatabaseName("IX_JournalEntry_CreatedBy");

                entity.HasIndex(e => e.ApprovedByUserId)
                    .HasDatabaseName("IX_JournalEntry_ApprovedBy");

                entity.HasIndex(e => new { e.TransactionDate, e.Id })
                    .HasDatabaseName("IX_JournalEntry_Pagination");

                // Configure relationships
                entity.HasMany(e => e.JournalEntryLines)
                    .WithOne(l => l.JournalEntry)
                    .HasForeignKey(l => l.JournalEntryId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Configure properties for optimal storage
                entity.Property(e => e.TransactionDate)
                    .IsRequired()
                    .HasColumnType("date");

                entity.Property(e => e.ReferenceNumber)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.JournalNumber)
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.Description)
                    .HasMaxLength(500);

                entity.Property(e => e.TotalDebit)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(e => e.TotalCredit)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(e => e.Status)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.JournalType)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                entity.Property(e => e.TransactionStatus)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();

                // Configure audit properties
                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.UpdatedAt)
                    .IsRequired(false);
            });

            // Configure JournalEntryLine entity
            modelBuilder.Entity<Models.Accounting.JournalEntryLine>(entity =>
            {
                // Set table name
                entity.ToTable("JournalEntryLines");

                // Configure primary key
                entity.HasKey(e => e.Id);

                // Configure indexes
                entity.HasIndex(e => e.AccountId)
                    .HasDatabaseName("IX_JournalEntryLine_AccountId");

                entity.HasIndex(e => e.JournalEntryId)
                    .HasDatabaseName("IX_JournalEntryLine_JournalEntryId");

                entity.HasIndex(e => e.Description)
                    .HasDatabaseName("IX_JournalEntryLine_Description");

                entity.HasIndex(e => new { e.JournalEntryId, e.AccountId })
                    .HasDatabaseName("IX_JournalEntryLine_Entry_Account");

                // Configure relationships
                entity.HasOne(l => l.Account)
                    .WithMany()
                    .HasForeignKey(l => l.AccountId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Configure properties
                entity.Property(l => l.Description)
                    .HasMaxLength(500);

                entity.Property(l => l.Debit)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(l => l.Credit)
                    .HasColumnType("decimal(18,2)")
                    .IsRequired();

                entity.Property(l => l.Reference)
                    .HasMaxLength(200);

                entity.Property(l => l.LineOrder)
                    .IsRequired();
            });

            // Configure ChartOfAccount entity (if not already configured)
            modelBuilder.Entity<Models.Accounting.ChartOfAccount>(entity =>
            {
                entity.ToTable("ChartOfAccounts");
                
                entity.HasKey(e => e.Id);
                
                entity.Property(e => e.AccountName)
                    .HasMaxLength(200)
                    .IsRequired();
                
                entity.Property(e => e.AccountCode)
                    .HasMaxLength(50)
                    .IsRequired();
                
                entity.Property(e => e.AccountType)
                    .HasConversion<string>()
                    .HasMaxLength(50)
                    .IsRequired();
            });
        }
    }
}
