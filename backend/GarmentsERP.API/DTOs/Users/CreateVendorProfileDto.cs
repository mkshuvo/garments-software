using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.DTOs.Users
{
    public class CreateVendorProfileDto
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
        public string VendorType { get; set; } = "Material";

        [MaxLength(50)]
        public string PaymentTerms { get; set; } = "Net 30";

        [MaxLength(20)]
        public string? BankAccount { get; set; }

        [MaxLength(50)]
        public string? BankName { get; set; }

        public bool IsPreferred { get; set; } = false;

        // Address fields
        [MaxLength(100)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? City { get; set; }

        [MaxLength(50)]
        public string? State { get; set; }

        [MaxLength(10)]
        public string? ZipCode { get; set; }

        [MaxLength(50)]
        public string? Country { get; set; }
    }
}
