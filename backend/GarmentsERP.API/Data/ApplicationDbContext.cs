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

            // Configure ApplicationUser relationships for auditing fields
            // JournalEntry relationships - explicitly configure to avoid ambiguity
            modelBuilder.Entity<JournalEntry>()
                .HasOne(j => j.CreatedBy)
                .WithMany(u => u.CreatedJournalEntries)
                .HasForeignKey(j => j.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_JournalEntry_ApplicationUser_CreatedBy");

            modelBuilder.Entity<JournalEntry>()
                .HasOne(j => j.ApprovedBy)
                .WithMany(u => u.ApprovedJournalEntries)
                .HasForeignKey(j => j.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_JournalEntry_ApplicationUser_ApprovedBy");

            // SalesInvoice relationships
            modelBuilder.Entity<SalesInvoice>()
                .HasOne(s => s.CreatedBy)
                .WithMany(u => u.CreatedSalesInvoices)
                .HasForeignKey(s => s.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // PurchaseInvoice relationships
            modelBuilder.Entity<PurchaseInvoice>()
                .HasOne(p => p.CreatedBy)
                .WithMany(u => u.CreatedPurchaseInvoices)
                .HasForeignKey(p => p.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Payment relationships
            modelBuilder.Entity<Payment>()
                .HasOne(p => p.CreatedBy)
                .WithMany(u => u.CreatedPayments)
                .HasForeignKey(p => p.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // BankTransfer relationships
            modelBuilder.Entity<BankTransfer>()
                .HasOne(b => b.CreatedBy)
                .WithMany(u => u.CreatedBankTransfers)
                .HasForeignKey(b => b.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure BankTransfer to BankAccount relationships
            modelBuilder.Entity<BankTransfer>()
                .HasOne(bt => bt.FromAccount)
                .WithMany(ba => ba.FromTransfers)
                .HasForeignKey(bt => bt.FromAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BankTransfer>()
                .HasOne(bt => bt.ToAccount)
                .WithMany(ba => ba.ToTransfers)
                .HasForeignKey(bt => bt.ToAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // BankReconciliation relationships
            modelBuilder.Entity<BankReconciliation>()
                .HasOne(b => b.ReconciledBy)
                .WithMany(u => u.ReconciledBankReconciliations)
                .HasForeignKey(b => b.ReconciledByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ReportTemplate relationships
            modelBuilder.Entity<ReportTemplate>()
                .HasOne(r => r.CreatedBy)
                .WithMany()
                .HasForeignKey(r => r.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // StockMovement relationships
            modelBuilder.Entity<StockMovement>()
                .HasOne(s => s.CreatedBy)
                .WithMany(u => u.CreatedStockMovements)
                .HasForeignKey(s => s.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // UserPermission relationships
            modelBuilder.Entity<UserPermission>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserPermissions)
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserPermission>()
                .HasOne(up => up.Permission)
                .WithMany(p => p.UserPermissions)
                .HasForeignKey(up => up.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

            // RolePermission relationships
            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Role)
                .WithMany(r => r.RolePermissions)
                .HasForeignKey(rp => rp.RoleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RolePermission>()
                .HasOne(rp => rp.Permission)
                .WithMany(p => p.RolePermissions)
                .HasForeignKey(rp => rp.PermissionId)
                .OnDelete(DeleteBehavior.Cascade);

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
