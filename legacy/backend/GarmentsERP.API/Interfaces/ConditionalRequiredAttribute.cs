using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Interfaces
{
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
