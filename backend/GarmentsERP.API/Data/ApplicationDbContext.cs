using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;
using GarmentsERP.API.Data.Seed;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Banking;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Currency;
using GarmentsERP.API.Models.Inventory;
using GarmentsERP.API.Models.Invoicing;
using GarmentsERP.API.Models.Payments;
using GarmentsERP.API.Models.Products;
using GarmentsERP.API.Models.Reports;
using GarmentsERP.API.Models.Settings;
using GarmentsERP.API.Models.Tax;

namespace GarmentsERP.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // User Profile Entities (legacy - keeping for compatibility)
        public DbSet<EmployeeProfile> EmployeeProfiles { get; set; }
        public DbSet<CustomerProfile> CustomerProfiles { get; set; }
        public DbSet<VendorProfile> VendorProfiles { get; set; }
        public DbSet<PayrollRecord> PayrollRecords { get; set; }

        // Enterprise Accounting Models
        // Accounting
        public DbSet<ChartOfAccount> ChartOfAccounts { get; set; }
        public DbSet<JournalEntry> JournalEntries { get; set; }
        public DbSet<JournalEntryLine> JournalEntryLines { get; set; }

        // Banking
        public DbSet<BankAccount> BankAccounts { get; set; }
        public DbSet<BankTransfer> BankTransfers { get; set; }
        public DbSet<BankReconciliation> BankReconciliations { get; set; }
        public DbSet<BankReconciliationItem> BankReconciliationItems { get; set; }

        // Contacts
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<ContactAddress> ContactAddresses { get; set; }

        // Currency
        public DbSet<Models.Currency.Currency> Currencies { get; set; }
        public DbSet<ExchangeRate> ExchangeRates { get; set; }

        // Inventory
        public DbSet<StockItem> StockItems { get; set; }
        public DbSet<StockMovement> StockMovements { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }

        // Invoicing
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesInvoiceItem> SalesInvoiceItems { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }

        // Payments
        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentAllocation> PaymentAllocations { get; set; }

        // Products
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }

        // Reports
        public DbSet<ReportTemplate> ReportTemplates { get; set; }

        // Settings
        public DbSet<Company> Companies { get; set; }
        public DbSet<BusinessSetting> BusinessSettings { get; set; }

        // Tax
        public DbSet<TaxRate> TaxRates { get; set; }
        public DbSet<TaxScheme> TaxSchemes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal precision for new enterprise models
            
            // Product decimal precision
            modelBuilder.Entity<Product>()
                .Property(p => p.SalesPrice)
                .HasPrecision(18, 4);

            modelBuilder.Entity<Product>()
                .Property(p => p.CostPrice)
                .HasPrecision(18, 4);

            modelBuilder.Entity<Product>()
                .Property(p => p.TaxPercentage)
                .HasPrecision(5, 2);

            // StockItem decimal precision
            modelBuilder.Entity<StockItem>()
                .Property(s => s.QuantityInStock)
                .HasPrecision(18, 4);

            modelBuilder.Entity<StockItem>()
                .Property(s => s.ReorderLevel)
                .HasPrecision(18, 4);

            modelBuilder.Entity<StockItem>()
                .Property(s => s.MaximumLevel)
                .HasPrecision(18, 4);

            modelBuilder.Entity<StockItem>()
                .Property(s => s.AverageCost)
                .HasPrecision(18, 4);

            // StockMovement decimal precision
            modelBuilder.Entity<StockMovement>()
                .Property(s => s.Quantity)
                .HasPrecision(18, 4);

            modelBuilder.Entity<StockMovement>()
                .Property(s => s.UnitCost)
                .HasPrecision(18, 4);

            // Sales Invoice decimal precision
            modelBuilder.Entity<SalesInvoice>()
                .Property(s => s.SubTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesInvoice>()
                .Property(s => s.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesInvoice>()
                .Property(s => s.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesInvoice>()
                .Property(s => s.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesInvoice>()
                .Property(s => s.PaidAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesInvoice>()
                .Property(s => s.BalanceAmount)
                .HasPrecision(18, 2);

            // Sales Invoice Item decimal precision
            modelBuilder.Entity<SalesInvoiceItem>()
                .Property(s => s.Quantity)
                .HasPrecision(18, 4);

            modelBuilder.Entity<SalesInvoiceItem>()
                .Property(s => s.UnitPrice)
                .HasPrecision(18, 4);

            modelBuilder.Entity<SalesInvoiceItem>()
                .Property(s => s.DiscountPercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<SalesInvoiceItem>()
                .Property(s => s.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesInvoiceItem>()
                .Property(s => s.TaxPercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<SalesInvoiceItem>()
                .Property(s => s.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesInvoiceItem>()
                .Property(s => s.LineTotal)
                .HasPrecision(18, 2);

            // Purchase Invoice decimal precision
            modelBuilder.Entity<PurchaseInvoice>()
                .Property(p => p.SubTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(p => p.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(p => p.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(p => p.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(p => p.PaidAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoice>()
                .Property(p => p.BalanceAmount)
                .HasPrecision(18, 2);

            // Purchase Invoice Item decimal precision
            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(p => p.Quantity)
                .HasPrecision(18, 4);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(p => p.UnitPrice)
                .HasPrecision(18, 4);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(p => p.DiscountPercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(p => p.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(p => p.TaxPercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(p => p.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseInvoiceItem>()
                .Property(p => p.LineTotal)
                .HasPrecision(18, 2);

            // Payment decimal precision
            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            // Payment Allocation decimal precision
            modelBuilder.Entity<PaymentAllocation>()
                .Property(p => p.AllocatedAmount)
                .HasPrecision(18, 2);

            // Bank Account decimal precision
            modelBuilder.Entity<BankAccount>()
                .Property(b => b.OpeningBalance)
                .HasPrecision(18, 2);

            modelBuilder.Entity<BankAccount>()
                .Property(b => b.CurrentBalance)
                .HasPrecision(18, 2);

            // Bank Transfer decimal precision
            modelBuilder.Entity<BankTransfer>()
                .Property(b => b.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<BankTransfer>()
                .Property(b => b.TransferFee)
                .HasPrecision(18, 2);

            // Chart of Account decimal precision
            modelBuilder.Entity<ChartOfAccount>()
                .Property(c => c.OpeningBalance)
                .HasPrecision(18, 2);

            // Journal Entry Line decimal precision
            modelBuilder.Entity<JournalEntryLine>()
                .Property(j => j.Debit)
                .HasPrecision(18, 2);

            modelBuilder.Entity<JournalEntryLine>()
                .Property(j => j.Credit)
                .HasPrecision(18, 2);

            // Exchange Rate decimal precision
            modelBuilder.Entity<ExchangeRate>()
                .Property(e => e.Rate)
                .HasPrecision(10, 6);

            // Tax Rate decimal precision
            modelBuilder.Entity<TaxRate>()
                .Property(t => t.TaxPercentage)
                .HasPrecision(5, 2);

            // Configure unique constraints
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.ProductCode)
                .IsUnique();

            modelBuilder.Entity<ChartOfAccount>()
                .HasIndex(c => c.AccountCode)
                .IsUnique();

            modelBuilder.Entity<Models.Currency.Currency>()
                .HasIndex(c => c.Code)
                .IsUnique();

            modelBuilder.Entity<SalesInvoice>()
                .HasIndex(s => s.InvoiceNumber)
                .IsUnique();

            modelBuilder.Entity<PurchaseInvoice>()
                .HasIndex(p => p.InvoiceNumber)
                .IsUnique();

            modelBuilder.Entity<BankAccount>()
                .HasIndex(b => b.AccountNumber)
                .IsUnique();

            // Configure self-referencing relationship for ChartOfAccount
            modelBuilder.Entity<ChartOfAccount>()
                .HasOne(c => c.ParentAccount)
                .WithMany(c => c.SubAccounts)
                .HasForeignKey(c => c.ParentAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure relationships for SalesInvoice
            modelBuilder.Entity<SalesInvoiceItem>()
                .HasOne(s => s.SalesInvoice)
                .WithMany(s => s.Items)
                .HasForeignKey(s => s.SalesInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationships for PurchaseInvoice
            modelBuilder.Entity<PurchaseInvoiceItem>()
                .HasOne(p => p.PurchaseInvoice)
                .WithMany(p => p.Items)
                .HasForeignKey(p => p.PurchaseInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationships for JournalEntry
            modelBuilder.Entity<JournalEntryLine>()
                .HasOne(j => j.JournalEntry)
                .WithMany(j => j.JournalEntryLines)
                .HasForeignKey(j => j.JournalEntryId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationships for PaymentAllocation
            modelBuilder.Entity<PaymentAllocation>()
                .HasOne(p => p.Payment)
                .WithMany(p => p.PaymentAllocations)
                .HasForeignKey(p => p.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationships for ContactAddress
            modelBuilder.Entity<ContactAddress>()
                .HasOne(c => c.Contact)
                .WithMany(c => c.Addresses)
                .HasForeignKey(c => c.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure relationships for ExchangeRate
            modelBuilder.Entity<ExchangeRate>()
                .HasOne(e => e.FromCurrency)
                .WithMany(c => c.FromExchangeRates)
                .HasForeignKey(e => e.FromCurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ExchangeRate>()
                .HasOne(e => e.ToCurrency)
                .WithMany(c => c.ToExchangeRates)
                .HasForeignKey(e => e.ToCurrencyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure relationships for TaxScheme
            modelBuilder.Entity<TaxScheme>()
                .HasOne(t => t.TaxRate)
                .WithMany(t => t.TaxSchemes)
                .HasForeignKey(t => t.TaxRateId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ProductCategory relationship
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure StockItem relationships
            modelBuilder.Entity<StockItem>()
                .HasOne(s => s.Product)
                .WithMany(p => p.StockItems)
                .HasForeignKey(s => s.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<StockItem>()
                .HasOne(s => s.Warehouse)
                .WithMany(w => w.StockItems)
                .HasForeignKey(s => s.WarehouseId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure StockMovement relationships
            modelBuilder.Entity<StockMovement>()
                .HasOne(s => s.StockItem)
                .WithMany(s => s.StockMovements)
                .HasForeignKey(s => s.StockItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed default roles
            SeedRoles(modelBuilder);
            // Seed admin user
            modelBuilder.ApplyConfiguration(new AdminUserSeeder());
            modelBuilder.ApplyConfiguration(new AdminUserRoleSeeder());
        }

        private void SeedRoles(ModelBuilder modelBuilder)
        {
            var adminRoleId = Guid.NewGuid();
            var managerRoleId = Guid.NewGuid();
            var employeeRoleId = Guid.NewGuid();
            var vendorRoleId = Guid.NewGuid();
            var customerRoleId = Guid.NewGuid();

            modelBuilder.Entity<ApplicationRole>().HasData(
                new ApplicationRole
                {
                    Id = adminRoleId,
                    Name = "Admin",
                    NormalizedName = "ADMIN",
                    Description = "System Administrator with full access"
                },
                new ApplicationRole
                {
                    Id = managerRoleId,
                    Name = "Manager",
                    NormalizedName = "MANAGER",
                    Description = "Manager with administrative privileges"
                },
                new ApplicationRole
                {
                    Id = employeeRoleId,
                    Name = "Employee",
                    NormalizedName = "EMPLOYEE",
                    Description = "Regular employee with limited access"
                },
                new ApplicationRole
                {
                    Id = vendorRoleId,
                    Name = "Vendor",
                    NormalizedName = "VENDOR",
                    Description = "External vendor/supplier"
                },
                new ApplicationRole
                {
                    Id = customerRoleId,
                    Name = "Customer",
                    NormalizedName = "CUSTOMER",
                    Description = "Customer with limited access"
                }
            );
        }
    }
}
