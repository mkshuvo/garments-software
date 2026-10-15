using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Tax
{
    public class TaxSchemeDto
    {
        public Guid Id { get; set; }
        public string SchemeName { get; set; } = string.Empty;
        public Guid TaxRateId { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public string? TaxRateName { get; set; }
        public decimal? TaxRatePercentage { get; set; }
    }
}
