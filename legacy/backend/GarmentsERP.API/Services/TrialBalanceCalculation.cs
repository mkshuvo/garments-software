using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Represents the result of a trial balance calculation.
    /// </summary>
    public class TrialBalanceCalculation
    {
        public decimal FinalBalance { get; set; }
        public string Expression { get; set; } = string.Empty;
        public int TransactionCount { get; set; }
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
    }
}
