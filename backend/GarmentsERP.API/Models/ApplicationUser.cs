using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Users;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Invoicing;
using GarmentsERP.API.Models.Payments;
using GarmentsERP.API.Models.Banking;
using GarmentsERP.API.Models.Inventory;

namespace GarmentsERP.API.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? ContactNumber { get; set; }

        [Required]
        public UserType UserType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties - One user can have only one profile type
        public virtual EmployeeProfile? EmployeeProfile { get; set; }
        public virtual CustomerProfile? CustomerProfile { get; set; }
        public virtual VendorProfile? VendorProfile { get; set; }

        public virtual ICollection<IdentityUserRole<Guid>> UserRoles { get; set; } = new List<IdentityUserRole<Guid>>();
        public virtual ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
        
        // Accounting navigation properties
        public virtual ICollection<JournalEntry> CreatedJournalEntries { get; set; } = new List<JournalEntry>();
        public virtual ICollection<JournalEntry> ApprovedJournalEntries { get; set; } = new List<JournalEntry>();
        public virtual ICollection<SalesInvoice> CreatedSalesInvoices { get; set; } = new List<SalesInvoice>();
        public virtual ICollection<PurchaseInvoice> CreatedPurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
        public virtual ICollection<Payment> CreatedPayments { get; set; } = new List<Payment>();
        public virtual ICollection<BankTransfer> CreatedBankTransfers { get; set; } = new List<BankTransfer>();
        public virtual ICollection<BankReconciliation> ReconciledBankReconciliations { get; set; } = new List<BankReconciliation>();
        public virtual ICollection<StockMovement> CreatedStockMovements { get; set; } = new List<StockMovement>();
    }
}
