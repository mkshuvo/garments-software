using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models.Accounting
{
    public class Category
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public CategoryType Type { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }
    }

    public enum CategoryType
    {
        Credit = 0,  // Money In categories (e.g., "Received: Urbo ltd")
        Debit = 1    // Money Out categories (e.g., "Fabric Purchase", "Electric Bill")
    }
}