using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
        public Guid? SalesInvoiceId { get; set; }

        public Guid? PurchaseInvoiceId { get; set; }
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
