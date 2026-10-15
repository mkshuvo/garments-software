using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class UpdateContactRequest
    {
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public ContactType ContactType { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Mobile { get; set; }
        public string? Fax { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CreditLimit { get; set; } = 0;
        public int PaymentTerms { get; set; } = 30;
    }
}
