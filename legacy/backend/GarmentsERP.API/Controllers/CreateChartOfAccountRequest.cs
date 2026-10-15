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
    public class CreateChartOfAccountRequest
    {
        [Required]
        [StringLength(20)]
        public string AccountCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; } = string.Empty;

        [Required]
        public AccountType AccountType { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }
    }
}
