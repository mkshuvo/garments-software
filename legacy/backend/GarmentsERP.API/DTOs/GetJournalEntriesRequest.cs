using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Request model for getting journal entries with advanced filtering and pagination
    /// </summary>
    public class GetJournalEntriesRequest
    {
        [Range(1, 100, ErrorMessage = "Page must be between 1 and 100")]
        public int Page { get; set; } = 1;

        [Range(1, 100, ErrorMessage = "Limit must be between 1 and 100")]
        public int Limit { get; set; } = 20;

        public DateTime? DateFrom { get; set; }

        public DateTime? DateTo { get; set; }

        [RegularExpression("^(All|Credit|Debit)$", ErrorMessage = "Type must be All, Credit, or Debit")]
        public string Type { get; set; } = "All";

        [Range(0, double.MaxValue, ErrorMessage = "Minimum amount must be non-negative")]
        public decimal? AmountMin { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Maximum amount must be non-negative")]
        public decimal? AmountMax { get; set; }

        [MaxLength(200, ErrorMessage = "Category name cannot exceed 200 characters")]
        public string? Category { get; set; }

        [MaxLength(50, ErrorMessage = "Reference number cannot exceed 50 characters")]
        public string? ReferenceNumber { get; set; }

        [MaxLength(200, ErrorMessage = "Contact name cannot exceed 200 characters")]
        public string? ContactName { get; set; }

        [MaxLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string? Description { get; set; }

        [RegularExpression("^(All|Draft|Posted|Approved|Reversed)$", ErrorMessage = "Invalid status value")]
        public string Status { get; set; } = "All";

        [RegularExpression("^(TransactionDate|Amount|Type|Category|ReferenceNumber|CreatedAt)$", ErrorMessage = "Invalid sort field")]
        public string SortBy { get; set; } = "TransactionDate";

        [RegularExpression("^(asc|desc)$", ErrorMessage = "Sort order must be asc or desc")]
        public string SortOrder { get; set; } = "desc";

        /// <summary>
        /// Custom validation for date range
        /// </summary>
        public bool IsValidDateRange()
        {
            if (DateFrom.HasValue && DateTo.HasValue)
            {
                return DateFrom.Value <= DateTo.Value;
            }
            return true;
        }

        /// <summary>
        /// Custom validation for amount range
        /// </summary>
        public bool IsValidAmountRange()
        {
            if (AmountMin.HasValue && AmountMax.HasValue)
            {
                return AmountMin.Value <= AmountMax.Value;
            }
            return true;
        }
    }
}
