using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Summary class for account balance calculations with enhanced categorization
    /// </summary>
    public class AccountBalanceSummary
    {
        public Guid AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryDescription { get; set; } = string.Empty;
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal NetBalance { get; set; }
        public int TransactionCount { get; set; }
        public string MostRecentParticulars { get; set; } = string.Empty;
    }
}
