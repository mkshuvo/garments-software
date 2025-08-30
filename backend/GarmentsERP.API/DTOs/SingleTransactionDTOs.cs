using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// DTO for saving a single credit transaction
    /// </summary>
    public class CreditTransactionDto
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MaxLength(200)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Particulars { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [MaxLength(200)]
        public string? ContactName { get; set; }
    }

    /// <summary>
    /// DTO for saving a single debit transaction
    /// </summary>
    public class DebitTransactionDto
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MaxLength(200)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Particulars { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [MaxLength(200)]
        public string? SupplierName { get; set; }

        [MaxLength(200)]
        public string? BuyerName { get; set; }
    }

    /// <summary>
    /// Result for single transaction operations
    /// </summary>
    public class SingleTransactionResult
    {
        /// <summary>
        /// Indicates if the operation was successful
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// Message describing the result
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// ID of the created journal entry
        /// </summary>
        public Guid JournalEntryId { get; set; }

        /// <summary>
        /// Auto-generated reference number
        /// </summary>
        public string ReferenceNumber { get; set; } = string.Empty;

        /// <summary>
        /// Number of categories created during the operation
        /// </summary>
        public int CategoriesCreated { get; set; }

        /// <summary>
        /// Number of contacts created during the operation
        /// </summary>
        public int ContactsCreated { get; set; }

        /// <summary>
        /// List of validation errors
        /// </summary>
        public List<string> Errors { get; set; } = new();

        /// <summary>
        /// Create a successful result
        /// </summary>
        public static SingleTransactionResult SuccessResult(
            Guid journalEntryId, 
            string referenceNumber, 
            string message = "Transaction saved successfully",
            int categoriesCreated = 0,
            int contactsCreated = 0)
        {
            return new SingleTransactionResult
            {
                Success = true,
                Message = message,
                JournalEntryId = journalEntryId,
                ReferenceNumber = referenceNumber,
                CategoriesCreated = categoriesCreated,
                ContactsCreated = contactsCreated
            };
        }

        /// <summary>
        /// Create a failed result
        /// </summary>
        public static SingleTransactionResult FailedResult(string message, List<string>? errors = null)
        {
            return new SingleTransactionResult
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }

    /// <summary>
    /// DTO for a saved transaction in the history
    /// </summary>
    public class SavedTransactionDto
    {
        public Guid Id { get; set; }
        public string Type { get; set; } = string.Empty; // "Credit" or "Debit"
        public DateTime Date { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Particulars { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? ContactName { get; set; }
        public string? SupplierName { get; set; }
        public string? BuyerName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

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
