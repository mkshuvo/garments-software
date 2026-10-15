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
}
