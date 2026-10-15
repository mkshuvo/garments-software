using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Tax
{
    public class CreateTaxSchemeDto
    {
        [Required]
        [MaxLength(100)]
        public string SchemeName { get; set; } = string.Empty;

        [Required]
        public Guid TaxRateId { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
