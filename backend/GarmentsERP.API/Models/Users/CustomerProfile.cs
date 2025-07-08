using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Users
{
    public class CustomerProfile : BaseUserProfile
    {
        [Required]
        [MaxLength(20)]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CompanyName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ContactPersonName { get; set; }

        [MaxLength(100)]
        public string? Industry { get; set; }

        [MaxLength(20)]
        public string? TaxId { get; set; }

        [MaxLength(50)]
        public string CustomerType { get; set; } = "Regular"; // Regular, VIP, Wholesale

        [Column(TypeName = "decimal(18,2)")]
        public decimal CreditLimit { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CurrentBalance { get; set; } = 0;

        [MaxLength(50)]
        public string PaymentTerms { get; set; } = "Net 30"; // Net 30, COD, etc.

        public DateTime? LastOrderDate { get; set; }

        public bool IsBlacklisted { get; set; } = false;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
