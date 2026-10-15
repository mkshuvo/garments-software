using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Represents transaction data for trial balance calculations.
    /// </summary>
    public class TransactionData
    {
        public Guid TransactionId { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string AccountName { get; set; } = string.Empty;
    }
}
