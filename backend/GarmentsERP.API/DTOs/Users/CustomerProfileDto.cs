using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.DTOs.Users
{
    public class CustomerProfileDto
    {
        public Guid Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPersonName { get; set; }
        public string? Industry { get; set; }
        public string? TaxId { get; set; }
        public string CustomerType { get; set; } = string.Empty;
        public decimal CreditLimit { get; set; }
        public decimal CurrentBalance { get; set; }
        public string PaymentTerms { get; set; } = string.Empty;
        public DateTime? LastOrderDate { get; set; }
        public bool IsBlacklisted { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }
}
