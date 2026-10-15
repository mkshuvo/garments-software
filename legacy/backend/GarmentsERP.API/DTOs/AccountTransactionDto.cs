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
}
