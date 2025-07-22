using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
    public class CategoryContact
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("Category")]
        public Guid CategoryId { get; set; } // FK to ChartOfAccount

        [ForeignKey("Contact")]
        public Guid ContactId { get; set; } // FK to Contact

        public ContactRole Role { get; set; } // Supplier, Buyer, Both

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public enum ContactRole
    {
        Supplier,
        Buyer,
        Both
    }
}