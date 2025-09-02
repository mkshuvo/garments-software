using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public interface ITransactionValidator
    {
        Task<TransactionValidationResult> ValidateDoubleEntryAsync(List<TransactionLineDto> lines);
        Task<TransactionValidationResult> ValidateAccountTypeRulesAsync(List<TransactionLineDto> lines);
        Task<TransactionValidationResult> ValidateTransactionDateAsync(DateTime transactionDate);
        Task<TransactionValidationResult> ValidateContactCategoryAssignmentAsync(Guid? contactId, Guid accountId);
        Task<TransactionValidationResult> ValidateImmutabilityAsync(Guid journalEntryId);
        Task<TransactionValidationResult> ValidateCompleteTransactionAsync(JournalEntry journalEntry, List<JournalEntryLine> lines);
        Task<TransactionValidationResult> ValidateBusinessRulesAsync(CreateTransactionRequest request);
    }

    // Validation DTOs
    public class TransactionValidationResult
    {
        public bool IsValid { get; set; }
        public List<ValidationError> Errors { get; set; } = new();
        public List<ValidationWarning> Warnings { get; set; } = new();
        public string? Message { get; set; }

        public static TransactionValidationResult Success(string? message = null)
        {
            return new TransactionValidationResult { IsValid = true, Message = message };
        }

        public static TransactionValidationResult Failure(string message, List<ValidationError>? errors = null)
        {
            return new TransactionValidationResult 
            { 
                IsValid = false, 
                Message = message, 
                Errors = errors ?? new List<ValidationError>() 
            };
        }

        public void AddError(string field, string message, string? code = null)
        {
            Errors.Add(new ValidationError { Field = field, Message = message, Code = code });
            IsValid = false;
        }

        public void AddWarning(string field, string message, string? code = null)
        {
            Warnings.Add(new ValidationWarning { Field = field, Message = message, Code = code });
        }
    }

    public class ValidationError
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Code { get; set; }
    }

    public class ValidationWarning
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Code { get; set; }
    }

    public class TransactionLineDto
    {
        public Guid AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
        public Guid? ContactId { get; set; }
        public int LineOrder { get; set; }
    }

    public class CreateTransactionRequest
    {
        public DateTime TransactionDate { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<TransactionLineDto> Lines { get; set; } = new();
        public JournalType JournalType { get; set; } = JournalType.General;
        public bool SaveAsDraft { get; set; } = false;
    }
}