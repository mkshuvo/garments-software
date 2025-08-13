using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// DTO representing a single transaction detail for account drill-down functionality
    /// </summary>
    public class AccountTransactionDto
    {
        /// <summary>
        /// Unique identifier for the transaction
        /// </summary>
        /// <example>550e8400-e29b-41d4-a716-446655440000</example>
        [Required]
        public Guid Id { get; set; }

        /// <summary>
        /// Date when the transaction occurred
        /// </summary>
        /// <example>2024-01-15</example>
        [Required]
        public DateTime Date { get; set; }

        /// <summary>
        /// Category description for the transaction
        /// </summary>
        /// <example>Office Supplies</example>
        public string CategoryDescription { get; set; } = string.Empty;

        /// <summary>
        /// Particulars or description of the transaction
        /// </summary>
        /// <example>Purchase of stationery items for office use</example>
        public string Particulars { get; set; } = string.Empty;

        /// <summary>
        /// Reference number or document number for the transaction
        /// </summary>
        /// <example>REF-2024-001</example>
        public string ReferenceNumber { get; set; } = string.Empty;

        /// <summary>
        /// Debit amount (negative value for debits, 0 for credits)
        /// </summary>
        /// <example>-500.00</example>
        public decimal DebitAmount { get; set; }

        /// <summary>
        /// Credit amount (positive value for credits, 0 for debits)
        /// </summary>
        /// <example>1000.00</example>
        public decimal CreditAmount { get; set; }

        /// <summary>
        /// Running balance after this transaction
        /// </summary>
        /// <example>500.00</example>
        public decimal RunningBalance { get; set; }

        /// <summary>
        /// Account ID this transaction belongs to
        /// </summary>
        /// <example>550e8400-e29b-41d4-a716-446655440001</example>
        public Guid AccountId { get; set; }

        /// <summary>
        /// Account name for reference
        /// </summary>
        /// <example>Cash Account</example>
        public string AccountName { get; set; } = string.Empty;

        /// <summary>
        /// Transaction type (Debit/Credit)
        /// </summary>
        /// <example>Debit</example>
        public string TransactionType => DebitAmount != 0 ? "Debit" : "Credit";

        /// <summary>
        /// Absolute amount (for sorting and display purposes)
        /// </summary>
        /// <example>500.00</example>
        public decimal AbsoluteAmount => Math.Abs(DebitAmount) + Math.Abs(CreditAmount);

        /// <summary>
        /// Validates the transaction data
        /// </summary>
        /// <returns>True if valid, false otherwise</returns>
        public bool IsValid()
        {
            // A transaction must have either a debit or credit amount, but not both
            return (DebitAmount != 0 && CreditAmount == 0) || (DebitAmount == 0 && CreditAmount != 0);
        }

        /// <summary>
        /// Gets validation error messages for the transaction
        /// </summary>
        /// <returns>List of validation error messages</returns>
        public List<string> GetValidationErrors()
        {
            var errors = new List<string>();

            if (Id == Guid.Empty)
                errors.Add("Transaction ID is required");

            if (Date == default)
                errors.Add("Transaction date is required");

            if (DebitAmount != 0 && CreditAmount != 0)
                errors.Add("Transaction cannot have both debit and credit amounts");

            if (DebitAmount == 0 && CreditAmount == 0)
                errors.Add("Transaction must have either a debit or credit amount");

            if (DebitAmount > 0)
                errors.Add("Debit amount should be negative or zero");

            if (CreditAmount < 0)
                errors.Add("Credit amount should be positive or zero");

            if (AccountId == Guid.Empty)
                errors.Add("Account ID is required");

            return errors;
        }
    }

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



    /// <summary>
    /// Account summary statistics DTO
    /// </summary>
    public class AccountSummaryDto
    {
        /// <summary>
        /// Total debit amount for the period
        /// </summary>
        /// <example>-2500.00</example>
        public decimal TotalDebits { get; set; }

        /// <summary>
        /// Total credit amount for the period
        /// </summary>
        /// <example>3000.00</example>
        public decimal TotalCredits { get; set; }

        /// <summary>
        /// Net balance for the period
        /// </summary>
        /// <example>500.00</example>
        public decimal NetBalance { get; set; }

        /// <summary>
        /// Opening balance at the start of the period
        /// </summary>
        /// <example>0.00</example>
        public decimal OpeningBalance { get; set; }

        /// <summary>
        /// Closing balance at the end of the period
        /// </summary>
        /// <example>500.00</example>
        public decimal ClosingBalance { get; set; }

        /// <summary>
        /// Number of transactions in the period
        /// </summary>
        /// <example>15</example>
        public int TransactionCount { get; set; }
    }
}