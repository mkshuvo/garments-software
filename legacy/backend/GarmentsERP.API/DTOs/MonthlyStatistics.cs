using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Monthly statistics
    /// </summary>
    public class MonthlyStatistics
    {
        public string Month { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalAmount { get; set; }
        public string FormattedTotalAmount => TotalAmount.ToString("C2");
    }
}
