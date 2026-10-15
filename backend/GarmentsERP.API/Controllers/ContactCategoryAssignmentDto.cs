using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    public class ContactCategoryAssignmentDto
    {
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
        public Guid CategoryId { get; set; }
        public ContactRole Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
