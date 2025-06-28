using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Inventory
{
    public class CreateWarehouseDto
    {
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
    }

    public class UpdateWarehouseDto
    {
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
    }

    public class WarehouseResponseDto
    {
        public Guid Id { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? ContactPerson { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
