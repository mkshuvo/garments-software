using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models.Users
{
    public class Permission
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Resource { get; set; } = string.Empty; // e.g., "Currency", "ProductCategory"

        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty; // e.g., "Create", "Read", "Update", "Delete"

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // SIMPLIFIED APPROACH - NO NAVIGATION PROPERTIES
        // Relationships are handled via foreign key IDs only
    }
}
