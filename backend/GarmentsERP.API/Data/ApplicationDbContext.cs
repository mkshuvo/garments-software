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

        // Permission System
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }

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

            // Configure unique constraints - ESSENTIAL ONLY
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

            // SIMPLIFIED FOREIGN KEY APPROACH - NO NAVIGATION PROPERTIES
            // All relationships are handled via foreign key IDs only
            // This eliminates complex EF configuration issues

            // No foreign key constraints needed for simplified approach
            // Tables will have foreign key ID columns but no EF navigation setup
            // This allows the database to enforce referential integrity
            // while avoiding complex EF relationship configuration issues

            // Seed default roles
            SeedRoles(modelBuilder);
            // Seed admin user
            modelBuilder.ApplyConfiguration(new AdminUserSeeder());
            modelBuilder.ApplyConfiguration(new AdminUserRoleSeeder());
        }

        private void SeedRoles(ModelBuilder modelBuilder)
        {
            var adminRoleId = Guid.Parse("bdd250ff-3291-4e1b-b91f-ff58384985c2");
            var managerRoleId = Guid.Parse("0ceb3f14-ea92-4020-a414-230fc5def487");
            var employeeRoleId = Guid.Parse("3ee591c5-b37e-49b9-9478-59ad85c92275");
            var vendorRoleId = Guid.Parse("78e3da3d-efa1-4827-ad31-86d4d246f5af");
            var customerRoleId = Guid.Parse("f9287304-e722-4cf5-9266-421bfab30b05");

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
