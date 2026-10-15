using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Summary information for journal entries
    /// </summary>
    public class SummaryInfo
    {
        public int TotalEntries { get; set; }
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal Balance { get; set; }
        public int CreditEntries { get; set; }
        public int DebitEntries { get; set; }
        public Dictionary<string, int> EntriesByStatus { get; set; } = new();
        public Dictionary<string, int> EntriesByType { get; set; } = new();

        // Computed properties
        public string FormattedTotalDebits => TotalDebits.ToString("C2");
        public string FormattedTotalCredits => TotalCredits.ToString("C2");
        public string FormattedBalance => Balance.ToString("C2");
        public bool IsBalanced => TotalDebits == TotalCredits;
        public string BalanceColor => IsBalanced ? "success" : "error";
    }
}
