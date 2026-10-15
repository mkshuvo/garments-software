using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Journal entry validation result
    /// </summary>
    public class JournalEntryValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal Balance => TotalDebits - TotalCredits;
        public bool IsBalanced => Math.Abs(Balance) < 0.01m;
    }
}
