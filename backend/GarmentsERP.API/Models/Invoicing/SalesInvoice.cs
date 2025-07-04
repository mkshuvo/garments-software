using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Payments;
using GarmentsERP.API.Models.Products;

namespace GarmentsERP.API.Models.Invoicing
{
    public class SalesInvoice
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        [ForeignKey("Contact")]
        public Guid ContactId { get; set; }

        public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

        public DateTime DueDate { get; set; }

        [MaxLength(50)]
        public string? Reference { get; set; }

        [MaxLength(1000)]
        public string? Terms { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal PaidAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal BalanceAmount { get; set; } = 0;

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

        [ForeignKey("CreatedBy")]
        public Guid CreatedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Contact Contact { get; set; } = null!;
        public virtual ApplicationUser CreatedBy { get; set; } = null!;
        public virtual ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
        public virtual ICollection<PaymentAllocation> PaymentAllocations { get; set; } = new List<PaymentAllocation>();
    }

    public enum InvoiceStatus
    {
        Draft,
        Sent,
        Paid,
        PartiallyPaid,
        Overdue,
        Cancelled,
        Void
    }
}
