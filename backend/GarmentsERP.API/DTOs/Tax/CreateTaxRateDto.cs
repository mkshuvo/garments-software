using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Tax;

namespace GarmentsERP.API.DTOs.Tax
{
    public class CreateTaxRateDto
    {
        [Required]
        [MaxLength(100)]
        public string TaxName { get; set; } = string.Empty;
        
        public decimal TaxPercentage { get; set; }
        public TaxType TaxType { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
        public DateTime? EffectiveTo { get; set; }
    }
}
