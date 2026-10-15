using GarmentsERP.API.Data;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    // Enhanced Dynamic Accounting DTOs
    public class EnhancedCategoryDto
    {
        public Guid Id { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public Guid? ParentAccountId { get; set; }
        public string? ParentAccountName { get; set; }
        public string? Description { get; set; }
        public string? CategoryGroup { get; set; }
        public int SortOrder { get; set; }
        public bool AllowTransactions { get; set; }
        public bool IsDynamic { get; set; }
        public bool IsActive { get; set; }
        public decimal CurrentBalance { get; set; }
        public bool HasTransactions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ContactAssignmentDto> AssignedContacts { get; set; } = new();
    }
}
