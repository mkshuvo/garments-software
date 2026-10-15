using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
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
}
