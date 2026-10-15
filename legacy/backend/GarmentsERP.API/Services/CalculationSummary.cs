using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Summary of the calculation results.
    /// </summary>
    public class CalculationSummary
    {
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal FinalBalance { get; set; }
        public int TransactionCount { get; set; }
    }
}
