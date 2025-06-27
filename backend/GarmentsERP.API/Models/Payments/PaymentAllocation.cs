using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Invoicing;

namespace GarmentsERP.API.Models.Payments
{
    public class PaymentAllocation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("Payment")]
        public Guid PaymentId { get; set; }

        [ForeignKey("SalesInvoice")]
        public Guid? SalesInvoiceId { get; set; }

        [ForeignKey("PurchaseInvoice")]
        public Guid? PurchaseInvoiceId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AllocatedAmount { get; set; } = 0;

        public DateTime AllocationDate { get; set; } = DateTime.UtcNow;

        [MaxLength(200)]
        public string? Notes { get; set; }

        // Navigation properties
        public virtual Payment Payment { get; set; } = null!;
        public virtual SalesInvoice? SalesInvoice { get; set; }
        public virtual PurchaseInvoice? PurchaseInvoice { get; set; }
    }
}
