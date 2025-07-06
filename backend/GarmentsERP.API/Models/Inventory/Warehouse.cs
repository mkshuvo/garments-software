using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models.Inventory
{
    public class Warehouse
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string WarehouseName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(100)]
        public string? State { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? ContactPerson { get; set; }

        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // SIMPLIFIED APPROACH - NO NAVIGATION PROPERTIES
        // Relationships are handled via foreign key IDs only
    }
}
