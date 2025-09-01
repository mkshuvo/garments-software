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

    /// <summary>
    /// Response model for journal entries with pagination and summary information
    /// </summary>
    public class GetJournalEntriesResponse
    {
        public bool Success { get; set; } = true;
        public string? Message { get; set; }
        public List<JournalEntryDisplayDto> Entries { get; set; } = new();
        public PaginationInfo Pagination { get; set; } = new();
        public SummaryInfo Summary { get; set; } = new();
    }

    /// <summary>
    /// Display DTO for journal entries in list view
    /// </summary>
    public class JournalEntryDisplayDto
    {
        public string Id { get; set; } = string.Empty;
        public string JournalNumber { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string Type { get; set; } = string.Empty; // "Credit" or "Debit"
        public string CategoryName { get; set; } = string.Empty;
        public string Particulars { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? ContactName { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string TransactionStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string JournalType { get; set; } = string.Empty;

        // Computed properties for formatting
        public string FormattedAmount => Amount.ToString("C2");
        public string FormattedDate => TransactionDate.ToString("MMM dd, yyyy");
        public string FormattedCreatedDate => CreatedAt.ToString("MMM dd, yyyy HH:mm");
        public string TypeColor => Type == "Credit" ? "success" : "error";
        public string StatusColor => Status switch
        {
            "Draft" => "warning",
            "Posted" => "info",
            "Approved" => "success",
            "Reversed" => "error",
            _ => "default"
        };
    }

    /// <summary>
    /// Detailed DTO for journal entry view
    /// </summary>
    public class JournalEntryDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string JournalNumber { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string JournalType { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public string Status { get; set; } = string.Empty;
        public string TransactionStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public List<JournalEntryLineDetailDto> Lines { get; set; } = new();
        public List<AuditTrailEntryDto> AuditTrail { get; set; } = new();

        // Computed properties
        public string FormattedTotalDebit => TotalDebit.ToString("C2");
        public string FormattedTotalCredit => TotalCredit.ToString("C2");
        public string FormattedDate => TransactionDate.ToString("MMM dd, yyyy");
        public bool IsBalanced => TotalDebit == TotalCredit;
        public decimal Balance => TotalDebit - TotalCredit;
    }

    /// <summary>
    /// DTO for journal entry line details
    /// </summary>
    public class JournalEntryLineDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? Reference { get; set; }
        public int LineOrder { get; set; }
        public string? ContactName { get; set; }

        // Computed properties
        public string FormattedDebit => Debit > 0 ? Debit.ToString("C2") : "";
        public string FormattedCredit => Credit > 0 ? Credit.ToString("C2") : "";
        public string LineType => Debit > 0 ? "Debit" : "Credit";
        public decimal LineAmount => Debit > 0 ? Debit : Credit;
        public string FormattedLineAmount => LineAmount.ToString("C2");
    }

    /// <summary>
    /// Pagination information
    /// </summary>
    public class PaginationInfo
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalEntries { get; set; }
        public int PageSize { get; set; }
        public bool HasNextPage => CurrentPage < TotalPages;
        public bool HasPreviousPage => CurrentPage > 1;
        public int StartEntry => (CurrentPage - 1) * PageSize + 1;
        public int EndEntry => Math.Min(CurrentPage * PageSize, TotalEntries);
    }

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

    /// <summary>
    /// Audit trail entry for journal entries
    /// </summary>
    public class AuditTrailEntryDto
    {
        public DateTime Timestamp { get; set; }
        public string Action { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string? PreviousValue { get; set; }
        public string? NewValue { get; set; }

        // Computed properties
        public string FormattedTimestamp => Timestamp.ToString("MMM dd, yyyy HH:mm:ss");
    }

    /// <summary>
    /// Export request model
    /// </summary>
    public class ExportJournalEntriesRequest
    {
        [Required(ErrorMessage = "Export format is required")]
        [RegularExpression("^(csv|excel|pdf)$", ErrorMessage = "Export format must be csv, excel, or pdf")]
        public string Format { get; set; } = "csv";

        public GetJournalEntriesRequest Filters { get; set; } = new();

        public bool IncludeDetails { get; set; } = false;

        [MaxLength(50, ErrorMessage = "Date format cannot exceed 50 characters")]
        public string DateFormat { get; set; } = "MMM dd, yyyy";

        [MaxLength(50, ErrorMessage = "Currency format cannot exceed 50 characters")]
        public string CurrencyFormat { get; set; } = "C2";

        public bool IncludeSummary { get; set; } = true;
        public bool IncludeHeaders { get; set; } = true;
    }

    /// <summary>
    /// Export response model
    /// </summary>
    public class ExportJournalEntriesResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? FileName { get; set; }
        public string? DownloadUrl { get; set; }
        public int ExportedRecords { get; set; }
        public DateTime ExportDate { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Statistics request model
    /// </summary>
    public class JournalEntryStatisticsRequest
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? Status { get; set; }
        public string? JournalType { get; set; }
    }

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
