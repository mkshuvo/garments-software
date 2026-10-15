using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Interfaces
{
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
}
