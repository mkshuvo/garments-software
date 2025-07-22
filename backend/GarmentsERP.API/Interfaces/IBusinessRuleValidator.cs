using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Interfaces
{
    public interface IBusinessRuleValidator
    {
        Task<BusinessRuleValidationResult> ValidateAsync<T>(T model) where T : class;
        Task<BusinessRuleValidationResult> ValidatePropertyAsync<T>(T model, string propertyName, object? value) where T : class;
        BusinessRuleValidationResult ValidateModel<T>(T model) where T : class;
        Task<BusinessRuleValidationResult> ValidateBusinessLogicAsync<T>(T model, string operation) where T : class;
        void RegisterCustomRule<T>(string ruleName, Func<T, Task<BusinessRuleValidationResult>> rule) where T : class;
        Task<BusinessRuleValidationResult> ExecuteCustomRuleAsync<T>(T model, string ruleName) where T : class;
    }

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

    public class BusinessRuleError
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public object? Context { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class BusinessRuleWarning
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public object? Context { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    // Custom validation attributes
    public class BusinessRuleAttribute : ValidationAttribute
    {
        public string RuleName { get; }
        public string? ErrorCode { get; set; }

        public BusinessRuleAttribute(string ruleName)
        {
            RuleName = ruleName;
        }

        public override bool IsValid(object? value)
        {
            // This will be handled by the BusinessRuleValidator
            return true;
        }
    }

    public class RequiredForOperationAttribute : ValidationAttribute
    {
        public string[] Operations { get; }

        public RequiredForOperationAttribute(params string[] operations)
        {
            Operations = operations;
        }

        public override bool IsValid(object? value)
        {
            // This will be handled by the BusinessRuleValidator
            return true;
        }
    }

    public class ConditionalRequiredAttribute : ValidationAttribute
    {
        public string DependentProperty { get; }
        public object? DependentValue { get; }

        public ConditionalRequiredAttribute(string dependentProperty, object? dependentValue = null)
        {
            DependentProperty = dependentProperty;
            DependentValue = dependentValue;
        }

        public override bool IsValid(object? value)
        {
            // This will be handled by the BusinessRuleValidator
            return true;
        }
    }
}