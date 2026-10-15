using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Interfaces
{
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
}
