using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Individual step in the calculation process.
    /// </summary>
    public class CalculationStep
    {
        public Guid TransactionId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal RunningTotal { get; set; }
        public string Type { get; set; } = string.Empty; // "Debit" or "Credit"
    }
}
