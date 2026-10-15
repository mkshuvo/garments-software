using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Inventory
{
    public class StockItem
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("Product")]
        public Guid ProductId { get; set; }

        [ForeignKey("Warehouse")]
        public Guid? WarehouseId { get; set; }

        [Column(TypeName = "decimal(18,4)")]
        public decimal QuantityInStock { get; set; } = 0;

        [Column(TypeName = "decimal(18,4)")]
        public decimal ReorderLevel { get; set; } = 0;

        [Column(TypeName = "decimal(18,4)")]
        public decimal MaximumLevel { get; set; } = 0;

        [Column(TypeName = "decimal(18,4)")]
        public decimal AverageCost { get; set; } = 0;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        // SIMPLIFIED APPROACH - NO NAVIGATION PROPERTIES
        // Relationships are handled via foreign key IDs only
    }
}
