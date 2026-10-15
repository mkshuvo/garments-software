using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    public class EnhancedContactDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public ContactType ContactType { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Mobile { get; set; }
        public string? Fax { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CreditLimit { get; set; }
        public int PaymentTerms { get; set; }
        public bool IsActive { get; set; }
        public decimal OutstandingBalance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ContactCategoryAssignmentDto> AssignedCategories { get; set; } = new();
    }
}
