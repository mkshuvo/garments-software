using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Statistics response model
    /// </summary>
    public class JournalEntryStatisticsResponse
    {
        public bool Success { get; set; } = true;
        public string? Message { get; set; }
        public int TotalEntries { get; set; }
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal Balance { get; set; }
        public decimal AverageEntryAmount { get; set; }
        public decimal LargestEntry { get; set; }
        public Dictionary<string, int> EntriesByType { get; set; } = new();
        public Dictionary<string, int> EntriesByStatus { get; set; } = new();
        public List<MonthlyStatistics> EntriesByMonth { get; set; } = new();
        public List<TopCategoryStatistics> TopCategories { get; set; } = new();

        // Computed properties
        public string FormattedTotalDebits => TotalDebits.ToString("C2");
        public string FormattedTotalCredits => TotalCredits.ToString("C2");
        public string FormattedBalance => Balance.ToString("C2");
        public string FormattedAverageAmount => AverageEntryAmount.ToString("C2");
        public string FormattedLargestEntry => LargestEntry.ToString("C2");
    }
}
