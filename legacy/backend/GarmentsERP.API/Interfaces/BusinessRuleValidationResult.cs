using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Interfaces
{
    // Business Rule Validation Result
    public class BusinessRuleValidationResult
    {
        public bool IsValid { get; set; } = true;
        public List<BusinessRuleError> Errors { get; set; } = new();
        public List<BusinessRuleWarning> Warnings { get; set; } = new();
        public Dictionary<string, object> Context { get; set; } = new();
        public string? Message { get; set; }

        public static BusinessRuleValidationResult Success(string? message = null)
        {
            return new BusinessRuleValidationResult { IsValid = true, Message = message };
        }

        public static BusinessRuleValidationResult Failure(string message)
        {
            return new BusinessRuleValidationResult 
            { 
                IsValid = false, 
                Message = message,
                Errors = new List<BusinessRuleError> 
                { 
                    new BusinessRuleError { Message = message, Code = "VALIDATION_FAILED" } 
                }
            };
        }

        public void AddError(string field, string message, string? code = null, object? context = null)
        {
            Errors.Add(new BusinessRuleError 
            { 
                Field = field, 
                Message = message, 
                Code = code ?? "BUSINESS_RULE_VIOLATION",
                Context = context
            });
            IsValid = false;
        }

        public void AddWarning(string field, string message, string? code = null, object? context = null)
        {
            Warnings.Add(new BusinessRuleWarning 
            { 
                Field = field, 
                Message = message, 
                Code = code ?? "BUSINESS_RULE_WARNING",
                Context = context
            });
        }

        public void Merge(BusinessRuleValidationResult other)
        {
            if (!other.IsValid)
            {
                IsValid = false;
            }
            Errors.AddRange(other.Errors);
            Warnings.AddRange(other.Warnings);
            
            foreach (var kvp in other.Context)
            {
                Context[kvp.Key] = kvp.Value;
            }
        }
    }
}
