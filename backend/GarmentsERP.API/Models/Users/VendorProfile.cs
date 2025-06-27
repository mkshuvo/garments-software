using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Invoicing;

namespace GarmentsERP.API.Models.Users
{
    public class VendorProfile : BaseUserProfile
    {
        [Required]
        [MaxLength(20)]
        public string VendorId { get; set; } = string.Empty;

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
        public string VendorType { get; set; } = "Material"; // Material, Service, Equipment

        [MaxLength(50)]
        public string PaymentTerms { get; set; } = "Net 30";

        [Column(TypeName = "decimal(18,2)")]
        public decimal CurrentBalance { get; set; } = 0;

        public DateTime? LastPurchaseDate { get; set; }

        [MaxLength(20)]
        public string? BankAccount { get; set; }

        [MaxLength(50)]
        public string? BankName { get; set; }

        public bool IsPreferred { get; set; } = false;

        public bool IsBlacklisted { get; set; } = false;

        [MaxLength(500)]
        public string? Notes { get; set; }

        // Rating system
        public int QualityRating { get; set; } = 5; // 1-5 scale
        public int DeliveryRating { get; set; } = 5; // 1-5 scale
        public int ServiceRating { get; set; } = 5; // 1-5 scale

        // Navigation properties
        public virtual ICollection<PurchaseInvoice> PurchaseInvoices { get; set; } = new List<PurchaseInvoice>();
    }
}
