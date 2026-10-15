using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Response DTO for account transaction drill-down with pagination support
    /// </summary>
    public class AccountTransactionResponseDto
    {
        /// <summary>
        /// Account ID for the transactions
        /// </summary>
        /// <example>550e8400-e29b-41d4-a716-446655440001</example>
        public Guid AccountId { get; set; }

        /// <summary>
        /// Account name
        /// </summary>
        /// <example>Cash Account</example>
        public string AccountName { get; set; } = string.Empty;

        /// <summary>
        /// List of transactions for the account
        /// </summary>
        public List<AccountTransactionDto> Transactions { get; set; } = new();

        /// <summary>
        /// Total count of transactions (for pagination)
        /// </summary>
        /// <example>150</example>
        public int TotalCount { get; set; }

        /// <summary>
        /// Current page number (1-based)
        /// </summary>
        /// <example>1</example>
        public int CurrentPage { get; set; } = 1;

        /// <summary>
        /// Number of items per page
        /// </summary>
        /// <example>25</example>
        public int PageSize { get; set; } = 25;

        /// <summary>
        /// Total number of pages
        /// </summary>
        /// <example>6</example>
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);

        /// <summary>
        /// Whether there is a next page
        /// </summary>
        /// <example>true</example>
        public bool HasNextPage => CurrentPage < TotalPages;

        /// <summary>
        /// Whether there is a previous page
        /// </summary>
        /// <example>false</example>
        public bool HasPreviousPage => CurrentPage > 1;

        /// <summary>
        /// Date range for the transactions
        /// </summary>
        public DateRangeDto DateRange { get; set; } = new();

        /// <summary>
        /// Summary statistics for the account
        /// </summary>
        public AccountSummaryDto Summary { get; set; } = new();
    }
}
