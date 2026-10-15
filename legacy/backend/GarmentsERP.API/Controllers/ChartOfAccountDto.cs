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
    // DTOs
    public class ChartOfAccountDto
    {
        public Guid Id { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
