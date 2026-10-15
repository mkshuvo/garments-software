using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Detailed breakdown of the calculation process.
    /// </summary>
    public class CalculationBreakdown
    {
        public List<CalculationStep> Transactions { get; set; } = new();
        public CalculationSummary Summary { get; set; } = new();
    }
}
