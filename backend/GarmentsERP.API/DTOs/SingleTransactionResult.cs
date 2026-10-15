using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
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
}
