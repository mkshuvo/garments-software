using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Collections.Concurrent;
using ValidationResult = System.ComponentModel.DataAnnotations.ValidationResult;

namespace GarmentsERP.API.Services
{
    public class BusinessRuleValidator : IBusinessRuleValidator
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BusinessRuleValidator> _logger;
        private readonly ConcurrentDictionary<string, object> _customRules = new();

        public BusinessRuleValidator(ApplicationDbContext context, ILogger<BusinessRuleValidator> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<BusinessRuleValidationResult> ValidateAsync<T>(T model) where T : class
        {
            try
            {
                var result = new BusinessRuleValidationResult();

                // 1. Standard model validation (Data Annotations)
                var modelValidationResult = ValidateModel(model);
                result.Merge(modelValidationResult);

                // 2. Custom business logic validation
                var businessLogicResult = await ValidateBusinessLogicAsync(model, "default");
                result.Merge(businessLogicResult);

                // 3. Execute custom rules if any are registered for this type
                var customRulesResult = await ExecuteCustomRulesForType<T>(model);
                result.Merge(customRulesResult);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during comprehensive validation for {ModelType}", typeof(T).Name);
                return BusinessRuleValidationResult.Failure($"Validation error: {ex.Message}");
            }
        }

        public async Task<BusinessRuleValidationResult> ValidatePropertyAsync<T>(T model, string propertyName, object? value) where T : class
        {
            try
            {
                var result = new BusinessRuleValidationResult();
                var property = typeof(T).GetProperty(propertyName);

                if (property == null)
                {
                    result.AddError(propertyName, $"Property '{propertyName}' not found", "PROPERTY_NOT_FOUND");
                    return result;
                }

                // Validate using data annotations
                var validationContext = new ValidationContext(model) { MemberName = propertyName };
                var validationResults = new List<ValidationResult>();

                var attributes = property.GetCustomAttributes<ValidationAttribute>();
                foreach (var attribute in attributes)
                {
                    var validationResult = attribute.GetValidationResult(value, validationContext);
                    if (validationResult != null)
                    {
                        validationResults.Add(validationResult);
                    }
                }

                // Convert validation results to business rule errors
                foreach (var validationResult in validationResults)
                {
                    result.AddError(propertyName, validationResult.ErrorMessage ?? "Validation failed", "VALIDATION_ERROR");
                }

                // Custom business rule validation for specific properties
                await ValidatePropertyBusinessRules(model, propertyName, value, result);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating property {PropertyName} for {ModelType}", propertyName, typeof(T).Name);
                return BusinessRuleValidationResult.Failure($"Property validation error: {ex.Message}");
            }
        }

        public BusinessRuleValidationResult ValidateModel<T>(T model) where T : class
        {
            try
            {
                var result = new BusinessRuleValidationResult();
                var validationContext = new ValidationContext(model);
                var validationResults = new List<ValidationResult>();

                // Standard model validation
                bool isValid = Validator.TryValidateObject(model, validationContext, validationResults, true);

                if (!isValid)
                {
                    foreach (var validationResult in validationResults)
                    {
                        var field = validationResult.MemberNames.FirstOrDefault() ?? "Model";
                        result.AddError(field, validationResult.ErrorMessage ?? "Validation failed", "MODEL_VALIDATION");
                    }
                }

                // Custom attribute validation
                ValidateCustomAttributes(model, result);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during model validation for {ModelType}", typeof(T).Name);
                return BusinessRuleValidationResult.Failure($"Model validation error: {ex.Message}");
            }
        }

        public async Task<BusinessRuleValidationResult> ValidateBusinessLogicAsync<T>(T model, string operation) where T : class
        {
            try
            {
                var result = new BusinessRuleValidationResult();
                var modelType = typeof(T).Name;

                // Type-specific business logic validation
                switch (modelType)
                {
                    case "CreateCashBookEntryRequest":
                        await ValidateCashBookEntryBusinessLogic(model, operation, result);
                        break;
                    case "CreateCategoryRequest":
                        await ValidateCategoryBusinessLogic(model, operation, result);
                        break;
                    case "CreateContactRequest":
                        await ValidateContactBusinessLogic(model, operation, result);
                        break;
                    case "ChartOfAccount":
                        await ValidateChartOfAccountBusinessLogic(model, operation, result);
                        break;
                    default:
                        // Generic business logic validation
                        await ValidateGenericBusinessLogic(model, operation, result);
                        break;
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during business logic validation for {ModelType}", typeof(T).Name);
                return BusinessRuleValidationResult.Failure($"Business logic validation error: {ex.Message}");
            }
        }

        public void RegisterCustomRule<T>(string ruleName, Func<T, Task<BusinessRuleValidationResult>> rule) where T : class
        {
            var key = $"{typeof(T).Name}_{ruleName}";
            _customRules[key] = rule;
            _logger.LogInformation("Registered custom rule '{RuleName}' for type {TypeName}", ruleName, typeof(T).Name);
        }

        public async Task<BusinessRuleValidationResult> ExecuteCustomRuleAsync<T>(T model, string ruleName) where T : class
        {
            try
            {
                var key = $"{typeof(T).Name}_{ruleName}";
                
                if (_customRules.TryGetValue(key, out var rule))
                {
                    if (rule is Func<T, Task<BusinessRuleValidationResult>> typedRule)
                    {
                        return await typedRule(model);
                    }
                }

                return BusinessRuleValidationResult.Success($"Custom rule '{ruleName}' not found or not applicable");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing custom rule {RuleName} for {ModelType}", ruleName, typeof(T).Name);
                return BusinessRuleValidationResult.Failure($"Custom rule execution error: {ex.Message}");
            }
        }

        // Private helper methods

        private async Task<BusinessRuleValidationResult> ExecuteCustomRulesForType<T>(T model) where T : class
        {
            var result = new BusinessRuleValidationResult();
            var typeName = typeof(T).Name;

            var applicableRules = _customRules.Where(kvp => kvp.Key.StartsWith($"{typeName}_"));

            foreach (var ruleKvp in applicableRules)
            {
                try
                {
                    if (ruleKvp.Value is Func<T, Task<BusinessRuleValidationResult>> rule)
                    {
                        var ruleResult = await rule(model);
                        result.Merge(ruleResult);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error executing custom rule {RuleKey}", ruleKvp.Key);
                    result.AddError("CustomRule", $"Custom rule execution failed: {ex.Message}", "CUSTOM_RULE_ERROR");
                }
            }

            return result;
        }

        private void ValidateCustomAttributes<T>(T model, BusinessRuleValidationResult result) where T : class
        {
            var properties = typeof(T).GetProperties();

            foreach (var property in properties)
            {
                var value = property.GetValue(model);

                // Handle BusinessRuleAttribute
                var businessRuleAttrs = property.GetCustomAttributes<BusinessRuleAttribute>();
                foreach (var attr in businessRuleAttrs)
                {
                    // Custom business rule validation would go here
                    // For now, we'll just log that we found the attribute
                    _logger.LogDebug("Found BusinessRule attribute '{RuleName}' on property {PropertyName}", 
                        attr.RuleName, property.Name);
                }

                // Handle ConditionalRequiredAttribute
                var conditionalRequiredAttrs = property.GetCustomAttributes<ConditionalRequiredAttribute>();
                foreach (var attr in conditionalRequiredAttrs)
                {
                    var dependentProperty = typeof(T).GetProperty(attr.DependentProperty);
                    if (dependentProperty != null)
                    {
                        var dependentValue = dependentProperty.GetValue(model);
                        
                        bool shouldBeRequired = attr.DependentValue == null ? 
                            dependentValue != null : 
                            Equals(dependentValue, attr.DependentValue);

                        if (shouldBeRequired && (value == null || (value is string str && string.IsNullOrWhiteSpace(str))))
                        {
                            result.AddError(property.Name, 
                                $"{property.Name} is required when {attr.DependentProperty} is {attr.DependentValue}", 
                                "CONDITIONAL_REQUIRED");
                        }
                    }
                }
            }
        }

        private async Task ValidatePropertyBusinessRules<T>(T model, string propertyName, object? value, BusinessRuleValidationResult result) where T : class
        {
            // Property-specific business rules
            switch (propertyName.ToLower())
            {
                case "accountcode":
                    await ValidateAccountCodeBusinessRules(value as string, result);
                    break;
                case "email":
                    ValidateEmailBusinessRules(value as string, result);
                    break;
                case "transactiondate":
                    if (value is DateTime dateValue)
                    {
                        ValidateTransactionDateBusinessRules(dateValue, result);
                    }
                    break;
            }
        }

        private async Task ValidateAccountCodeBusinessRules(string? accountCode, BusinessRuleValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(accountCode))
                return;

            // Check for duplicate account codes
            var existingAccount = await _context.ChartOfAccounts
                .AnyAsync(a => a.AccountCode == accountCode);

            if (existingAccount)
            {
                result.AddError("AccountCode", "Account code already exists", "DUPLICATE_ACCOUNT_CODE");
            }

            // Validate account code format (should be numeric)
            if (!accountCode.All(char.IsDigit))
            {
                result.AddWarning("AccountCode", "Account code should be numeric for consistency", "NON_NUMERIC_CODE");
            }
        }

        private void ValidateEmailBusinessRules(string? email, BusinessRuleValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(email))
                return;

            // Additional email validation beyond standard EmailAddress attribute
            if (email.Contains(".."))
            {
                result.AddError("Email", "Email cannot contain consecutive dots", "INVALID_EMAIL_FORMAT");
            }

            if (email.StartsWith(".") || email.EndsWith("."))
            {
                result.AddError("Email", "Email cannot start or end with a dot", "INVALID_EMAIL_FORMAT");
            }
        }

        private void ValidateTransactionDateBusinessRules(DateTime transactionDate, BusinessRuleValidationResult result)
        {
            // Business rule: No future dates
            if (transactionDate.Date > DateTime.Today)
            {
                result.AddError("TransactionDate", "Transaction date cannot be in the future", "FUTURE_DATE");
            }

            // Business rule: Warn about very old dates
            if (transactionDate.Date < DateTime.Today.AddYears(-2))
            {
                result.AddWarning("TransactionDate", "Transaction date is more than 2 years old", "OLD_DATE");
            }
        }

        private async Task ValidateCashBookEntryBusinessLogic(object? model, string operation, BusinessRuleValidationResult result)
        {
            if (model == null) return;

            try
            {
                // Use reflection to safely access properties
                var modelType = model.GetType();
                var referenceNumberProp = modelType.GetProperty("ReferenceNumber");
                var transactionDateProp = modelType.GetProperty("TransactionDate");
                var linesProp = modelType.GetProperty("Lines");

                // Validate reference number uniqueness for the same date
                if (referenceNumberProp != null && transactionDateProp != null)
                {
                    var referenceNumber = referenceNumberProp.GetValue(model)?.ToString();
                    var transactionDate = transactionDateProp.GetValue(model);

                    if (!string.IsNullOrEmpty(referenceNumber) && transactionDate is DateTime dateValue)
                    {
                        var existingEntry = await _context.JournalEntries
                            .AnyAsync(j => j.ReferenceNumber == referenceNumber && 
                                          j.TransactionDate.Date == dateValue.Date);

                        if (existingEntry)
                        {
                            result.AddWarning("ReferenceNumber", 
                                "Reference number already exists for this date", 
                                "DUPLICATE_REFERENCE");
                        }
                    }
                }

                // Validate minimum lines requirement
                if (linesProp != null)
                {
                    var lines = linesProp.GetValue(model);
                    if (lines is System.Collections.ICollection collection && collection.Count < 2)
                    {
                        result.AddError("Lines", 
                            "Cash book entry must have at least 2 lines for double-entry", 
                            "INSUFFICIENT_LINES");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating cash book entry business logic");
                result.AddError("BusinessLogic", "Error validating cash book entry", "VALIDATION_ERROR");
            }
        }

        private async Task ValidateCategoryBusinessLogic(object? model, string operation, BusinessRuleValidationResult result)
        {
            if (model == null) return;

            try
            {
                var modelType = model.GetType();
                var accountNameProp = modelType.GetProperty("AccountName");
                var parentAccountIdProp = modelType.GetProperty("ParentAccountId");

                // Validate account name uniqueness
                if (accountNameProp != null)
                {
                    var accountName = accountNameProp.GetValue(model)?.ToString();
                    if (!string.IsNullOrEmpty(accountName))
                    {
                        var existingCategory = await _context.ChartOfAccounts
                            .AnyAsync(c => c.AccountName == accountName);

                        if (existingCategory)
                        {
                            result.AddError("AccountName", "Category name already exists", "DUPLICATE_CATEGORY_NAME");
                        }
                    }
                }

                // Validate parent-child relationship
                if (parentAccountIdProp != null)
                {
                    var parentAccountId = parentAccountIdProp.GetValue(model);
                    if (parentAccountId is Guid parentId)
                    {
                        var parentExists = await _context.ChartOfAccounts
                            .AnyAsync(c => c.Id == parentId);

                        if (!parentExists)
                        {
                            result.AddError("ParentAccountId", "Parent category does not exist", "INVALID_PARENT");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating category business logic");
                result.AddError("BusinessLogic", "Error validating category", "VALIDATION_ERROR");
            }
        }

        private async Task ValidateContactBusinessLogic(object? model, string operation, BusinessRuleValidationResult result)
        {
            if (model == null) return;

            try
            {
                var modelType = model.GetType();
                var emailProp = modelType.GetProperty("Email");
                var contactTypeProp = modelType.GetProperty("ContactType");
                var companyNameProp = modelType.GetProperty("CompanyName");

                // Validate email uniqueness
                if (emailProp != null)
                {
                    var email = emailProp.GetValue(model)?.ToString();
                    if (!string.IsNullOrEmpty(email))
                    {
                        var existingContact = await _context.Contacts
                            .AnyAsync(c => c.Email == email);

                        if (existingContact)
                        {
                            result.AddWarning("Email", "Email address already exists", "DUPLICATE_EMAIL");
                        }
                    }
                }

                // Validate company name for business contacts
                if (contactTypeProp != null && companyNameProp != null)
                {
                    var contactType = contactTypeProp.GetValue(model)?.ToString();
                    var companyName = companyNameProp.GetValue(model)?.ToString();

                    if (contactType != null && contactType != "Individual")
                    {
                        if (string.IsNullOrWhiteSpace(companyName))
                        {
                            result.AddError("CompanyName", "Company name is required for business contacts", "MISSING_COMPANY_NAME");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating contact business logic");
                result.AddError("BusinessLogic", "Error validating contact", "VALIDATION_ERROR");
            }
        }

        private async Task ValidateChartOfAccountBusinessLogic(object? model, string operation, BusinessRuleValidationResult result)
        {
            if (model == null) return;

            try
            {
                var modelType = model.GetType();
                var accountCodeProp = modelType.GetProperty("AccountCode");
                var accountTypeProp = modelType.GetProperty("AccountType");
                var idProp = modelType.GetProperty("Id");

                // Validate account code format based on account type
                if (accountCodeProp != null && accountTypeProp != null)
                {
                    var accountCode = accountCodeProp.GetValue(model)?.ToString();
                    var accountType = accountTypeProp.GetValue(model)?.ToString();

                    if (!string.IsNullOrEmpty(accountCode) && !string.IsNullOrEmpty(accountType))
                    {
                        var expectedPrefix = accountType switch
                        {
                            "Asset" => "1",
                            "Liability" => "2",
                            "Equity" => "3",
                            "Revenue" => "4",
                            "Expense" => "5",
                            _ => null
                        };

                        if (expectedPrefix != null && !accountCode.StartsWith(expectedPrefix))
                        {
                            result.AddWarning("AccountCode", 
                                $"Account code should start with '{expectedPrefix}' for {accountType} accounts", 
                                "INCONSISTENT_CODE_PREFIX");
                        }
                    }
                }

                // Check for existing transactions before allowing deactivation
                if (operation == "deactivate" && idProp != null)
                {
                    var id = idProp.GetValue(model);
                    if (id is Guid accountId)
                    {
                        var hasTransactions = await _context.JournalEntryLines
                            .AnyAsync(l => l.AccountId == accountId);

                        if (hasTransactions)
                        {
                            result.AddWarning("IsActive", 
                                "Account has existing transactions. Deactivation will prevent new transactions but preserve history.", 
                                "HAS_TRANSACTIONS");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating chart of account business logic");
                result.AddError("BusinessLogic", "Error validating chart of account", "VALIDATION_ERROR");
            }
        }

        private async Task ValidateGenericBusinessLogic<T>(T model, string operation, BusinessRuleValidationResult result) where T : class
        {
            // Generic business logic that applies to all models
            await Task.CompletedTask;

            // Add any cross-cutting concerns here
            result.Context["ValidatedAt"] = DateTime.UtcNow;
            result.Context["Operation"] = operation;
            result.Context["ModelType"] = typeof(T).Name;
        }
    }
}