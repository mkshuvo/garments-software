using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Response for recent transactions query
    /// </summary>
    public class RecentTransactionsResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<SavedTransactionDto> Transactions { get; set; } = new();
        public int TotalCount { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal TotalDebits { get; set; }
    }
}
