using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    public class ContactAutoCompleteDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public ContactType ContactType { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}
