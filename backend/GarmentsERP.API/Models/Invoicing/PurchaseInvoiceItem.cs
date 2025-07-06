using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Products;

namespace GarmentsERP.API.Models.Invoicing
{
    public class PurchaseInvoiceItem
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("PurchaseInvoice")]
        public Guid PurchaseInvoiceId { get; set; }

        [ForeignKey("Product")]
        public Guid? ProductId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; } = 1;

        [MaxLength(50)]
        public string Unit { get; set; } = "Pcs";

        [Column(TypeName = "decimal(18,4)")]
        public decimal UnitPrice { get; set; } = 0;

        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercentage { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAmount { get; set; } = 0;

        [Column(TypeName = "decimal(5,2)")]
        public decimal TaxPercentage { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; } = 0;

        public int LineOrder { get; set; }

        // SIMPLIFIED APPROACH - NO NAVIGATION PROPERTIES
        // Relationships are handled via foreign key IDs only
    }
}
