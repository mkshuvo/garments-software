using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Top category statistics
    /// </summary>
    public class TopCategoryStatistics
    {
        public string CategoryName { get; set; } = string.Empty;
        public int EntryCount { get; set; }
        public decimal TotalAmount { get; set; }
        public string FormattedTotalAmount => TotalAmount.ToString("C2");
        public decimal Percentage { get; set; }
        public string FormattedPercentage => $"{Percentage:F1}%";
    }
}
