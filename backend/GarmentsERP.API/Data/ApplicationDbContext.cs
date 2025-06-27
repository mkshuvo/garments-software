using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;
using GarmentsERP.API.Data.Seed;

namespace GarmentsERP.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // User Profile Entities
        public DbSet<EmployeeProfile> EmployeeProfiles { get; set; }
        public DbSet<CustomerProfile> CustomerProfiles { get; set; }
        public DbSet<VendorProfile> VendorProfiles { get; set; }
        public DbSet<PayrollRecord> PayrollRecords { get; set; }

        // Business Entities
        public DbSet<Product> Products { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<SalesOrder> SalesOrders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<ProductionLine> ProductionLines { get; set; }
        public DbSet<WorkOrder> WorkOrders { get; set; }
        public DbSet<ProductionSchedule> ProductionSchedules { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Payroll> Payrolls { get; set; }
        public DbSet<ChartOfAccount> ChartOfAccounts { get; set; }
        public DbSet<GLEntry> GLEntries { get; set; }
        public DbSet<GLEntryLine> GLEntryLines { get; set; }

        // Purchasing Entities
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderItem> PurchaseOrderItems { get; set; }
        public DbSet<Bill> Bills { get; set; }
        public DbSet<BillItem> BillItems { get; set; }
        public DbSet<BillPayment> BillPayments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure decimal precision
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<SalesOrder>()
                .Property(s => s.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(o => o.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(o => o.LineTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderDetail>()
                .Property(o => o.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderDetail>()
                .Property(o => o.LineTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.Subtotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.Taxes)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<InvoiceItem>()
                .Property(i => i.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<InvoiceItem>()
                .Property(i => i.LineTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Employee>()
                .Property(e => e.Salary)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payroll>()
                .Property(p => p.GrossSalary)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payroll>()
                .Property(p => p.Deductions)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payroll>()
                .Property(p => p.NetSalary)
                .HasPrecision(18, 2);

            modelBuilder.Entity<GLEntry>()
                .Property(g => g.TotalDebit)
                .HasPrecision(18, 2);

            modelBuilder.Entity<GLEntry>()
                .Property(g => g.TotalCredit)
                .HasPrecision(18, 2);

            modelBuilder.Entity<GLEntryLine>()
                .Property(g => g.Debit)
                .HasPrecision(18, 2);
            modelBuilder.Entity<GLEntryLine>()
                .Property(g => g.Credit)
                .HasPrecision(18, 2);

            // Configure purchasing entity decimal precision
            modelBuilder.Entity<PurchaseOrder>()
                .Property(p => p.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrder>()
                .Property(p => p.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrder>()
                .Property(p => p.GrandTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(p => p.UnitPrice)
                .HasPrecision(18, 4);

            modelBuilder.Entity<PurchaseOrderItem>()
                .Property(p => p.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Bill>()
                .Property(b => b.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Bill>()
                .Property(b => b.TaxAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Bill>()
                .Property(b => b.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Bill>()
                .Property(b => b.PaidAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Bill>()
                .Property(b => b.BalanceAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<BillItem>()
                .Property(b => b.UnitPrice)
                .HasPrecision(18, 4);

            modelBuilder.Entity<BillItem>()
                .Property(b => b.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<BillPayment>()
                .Property(b => b.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<VendorProfile>()
                .Property(v => v.CurrentBalance)
                .HasPrecision(18, 2);

            // Configure unique constraints
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.SKU)
                .IsUnique();
            modelBuilder.Entity<ChartOfAccount>()
                .HasIndex(c => c.AccountCode)
                .IsUnique();

            // Configure relationships
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.SalesOrder)
                .WithMany(so => so.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderDetail>()
                .HasOne(od => od.Order)
                .WithMany(o => o.OrderDetails)
                .HasForeignKey(od => od.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvoiceItem>()
                .HasOne(ii => ii.Invoice)
                .WithMany(i => i.InvoiceItems)
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GLEntryLine>()
                .HasOne(gel => gel.GLEntry)
                .WithMany(ge => ge.GLEntryLines)
                .HasForeignKey(gel => gel.GLEntryId)
                .OnDelete(DeleteBehavior.Cascade);            // Configure self-referencing relationship for ChartOfAccount
            modelBuilder.Entity<ChartOfAccount>()
                .HasOne(c => c.ParentAccount)
                .WithMany(c => c.SubAccounts)
                .HasForeignKey(c => c.ParentAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure purchasing entity relationships
            modelBuilder.Entity<PurchaseOrderItem>()
                .HasOne(poi => poi.PurchaseOrder)
                .WithMany(po => po.Items)
                .HasForeignKey(poi => poi.PurchaseOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BillItem>()
                .HasOne(bi => bi.Bill)
                .WithMany(b => b.Items)
                .HasForeignKey(bi => bi.BillId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<BillPayment>()
                .HasOne(bp => bp.Bill)
                .WithMany(b => b.Payments)
                .HasForeignKey(bp => bp.BillId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Product relationships explicitly
            modelBuilder.Entity<BillItem>()
                .HasOne(bi => bi.Product)
                .WithMany()
                .HasForeignKey(bi => bi.ProductId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PurchaseOrderItem>()
                .HasOne(poi => poi.Product)
                .WithMany()
                .HasForeignKey(poi => poi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);            // Configure unique constraints for purchasing
            modelBuilder.Entity<PurchaseOrder>()
                .HasIndex(p => p.PurchaseOrderNumber)
                .IsUnique();

            modelBuilder.Entity<Bill>()
                .HasIndex(b => b.BillNumber)
                .IsUnique();

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
