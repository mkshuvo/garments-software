using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Inventory;
using GarmentsERP.API.Models.Invoicing;

namespace GarmentsERP.API.Models.Products
{
    public class Product
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string ProductCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string ProductName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [ForeignKey("Category")]
        public Guid? CategoryId { get; set; }

        public ProductType ProductType { get; set; }

        [MaxLength(50)]
        public string Unit { get; set; } = "Pcs";

        [Column(TypeName = "decimal(18,4)")]
        public decimal SalesPrice { get; set; } = 0;

        [Column(TypeName = "decimal(18,4)")]
        public decimal CostPrice { get; set; } = 0;

        [Column(TypeName = "decimal(5,2)")]
        public decimal TaxPercentage { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        // Garment-specific fields
        [MaxLength(100)]
        public string? Color { get; set; }

        [MaxLength(50)]
        public string? Size { get; set; }

        [MaxLength(100)]
        public string? Fabric { get; set; }

        [MaxLength(100)]
        public string? Style { get; set; }

        [MaxLength(50)]
        public string? Season { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // SIMPLIFIED APPROACH - NO NAVIGATION PROPERTIES
        // Relationships are handled via foreign key IDs only
        // Use services to fetch related data when needed
    }

    public enum ProductType
    {
        Finished,
        RawMaterial,
        Service
    }
}
