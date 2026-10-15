using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Inventory
{
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
