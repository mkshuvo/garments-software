using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Invoicing;

namespace GarmentsERP.API.Models.Inventory
{
    public class StockMovement
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("StockItem")]
        public Guid StockItemId { get; set; }

        public MovementType MovementType { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; } = 0;

        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitCost { get; set; } = 0;

        [MaxLength(200)]
        public string? Reference { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime MovementDate { get; set; } = DateTime.UtcNow;

        [ForeignKey("CreatedBy")]
        public Guid CreatedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Related transaction references
        [ForeignKey("SalesInvoice")]
        public Guid? SalesInvoiceId { get; set; }

        [ForeignKey("PurchaseInvoice")]
        public Guid? PurchaseInvoiceId { get; set; }

        // Navigation properties
        public virtual StockItem StockItem { get; set; } = null!;
        public virtual ApplicationUser CreatedBy { get; set; } = null!;
        public virtual SalesInvoice? SalesInvoice { get; set; }
        public virtual PurchaseInvoice? PurchaseInvoice { get; set; }
    }

    public enum MovementType
    {
        Purchase,
        Sale,
        Adjustment,
        Transfer,
        Opening,
        Closing,
        Scrap,
        Return
    }
}
