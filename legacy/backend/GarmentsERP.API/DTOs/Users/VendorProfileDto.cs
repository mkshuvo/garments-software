using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.DTOs.Users
{
    public class VendorProfileDto
    {
        public Guid Id { get; set; }
        public string VendorId { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPersonName { get; set; }
        public string? Industry { get; set; }
        public string? TaxId { get; set; }
        public string VendorType { get; set; } = string.Empty;
        public string PaymentTerms { get; set; } = string.Empty;
        public decimal CurrentBalance { get; set; }
        public DateTime? LastPurchaseDate { get; set; }
        public string? BankAccount { get; set; }
        public string? BankName { get; set; }
        public bool IsPreferred { get; set; }
        public bool IsBlacklisted { get; set; }
        public int QualityRating { get; set; }
        public int DeliveryRating { get; set; }
        public int ServiceRating { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }
}
