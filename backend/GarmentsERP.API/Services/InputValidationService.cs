using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using System.Web;

namespace GarmentsERP.API.Services
{
    public class InputValidationService
    {
        private readonly ILogger<InputValidationService> _logger;
        private readonly Dictionary<string, Regex> _validationPatterns;

        public InputValidationService(ILogger<InputValidationService> logger)
        {
            _logger = logger;
            _validationPatterns = InitializeValidationPatterns();
        }

        /// <summary>
        /// Validates and sanitizes a string input
        /// </summary>
        public ValidationResult ValidateAndSanitizeString(string? input, string fieldName, int maxLength = 500)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} cannot be empty",
                    SanitizedValue = string.Empty
                };
            }

            if (input.Length > maxLength)
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} exceeds maximum length of {maxLength} characters",
                    SanitizedValue = string.Empty
                };
            }

            // Check for potentially dangerous content
            if (ContainsDangerousContent(input))
            {
                _logger.LogWarning("Potentially dangerous content detected in {FieldName}: {Input}", fieldName, input);
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} contains invalid content",
                    SanitizedValue = string.Empty
                };
            }

            // Sanitize the input
            var sanitized = SanitizeString(input);

            return new ValidationResult
            {
                IsValid = true,
                SanitizedValue = sanitized,
                ErrorMessage = string.Empty
            };
        }

        /// <summary>
        /// Validates and sanitizes a numeric input
        /// </summary>
        public ValidationResult ValidateAndSanitizeNumeric(string? input, string fieldName, decimal minValue = decimal.MinValue, decimal maxValue = decimal.MaxValue)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} cannot be empty",
                    SanitizedValue = string.Empty
                };
            }

            // Remove any non-numeric characters except decimal point and minus
            var cleanedInput = Regex.Replace(input, @"[^\d.-]", "");

            if (!decimal.TryParse(cleanedInput, out decimal numericValue))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} must be a valid number",
                    SanitizedValue = string.Empty
                };
            }

            if (numericValue < minValue || numericValue > maxValue)
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} must be between {minValue} and {maxValue}",
                    SanitizedValue = string.Empty
                };
            }

            return new ValidationResult
            {
                IsValid = true,
                SanitizedValue = numericValue.ToString(),
                ErrorMessage = string.Empty
            };
        }

        /// <summary>
        /// Validates and sanitizes an email address
        /// </summary>
        public ValidationResult ValidateAndSanitizeEmail(string? input, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} cannot be empty",
                    SanitizedValue = string.Empty
                };
            }

            // Basic email validation pattern
            var emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            if (!Regex.IsMatch(input, emailPattern))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} must be a valid email address",
                    SanitizedValue = string.Empty
                };
            }

            // Sanitize email (remove any HTML encoding)
            var sanitized = HttpUtility.HtmlDecode(input).Trim().ToLowerInvariant();

            return new ValidationResult
            {
                IsValid = true,
                SanitizedValue = sanitized,
                ErrorMessage = string.Empty
            };
        }

        /// <summary>
        /// Validates and sanitizes a date input
        /// </summary>
        public ValidationResult ValidateAndSanitizeDate(string? input, string fieldName, DateTime? minDate = null, DateTime? maxDate = null)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} cannot be empty",
                    SanitizedValue = string.Empty
                };
            }

            if (!DateTime.TryParse(input, out DateTime dateValue))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} must be a valid date",
                    SanitizedValue = string.Empty
                };
            }

            if (minDate.HasValue && dateValue < minDate.Value)
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} cannot be earlier than {minDate.Value:yyyy-MM-dd}",
                    SanitizedValue = string.Empty
                };
            }

            if (maxDate.HasValue && dateValue > maxDate.Value)
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} cannot be later than {maxDate.Value:yyyy-MM-dd}",
                    SanitizedValue = string.Empty
                };
            }

            return new ValidationResult
            {
                IsValid = true,
                SanitizedValue = dateValue.ToString("yyyy-MM-dd"),
                ErrorMessage = string.Empty
            };
        }

        /// <summary>
        /// Validates and sanitizes a GUID input
        /// </summary>
        public ValidationResult ValidateAndSanitizeGuid(string? input, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} cannot be empty",
                    SanitizedValue = string.Empty
                };
            }

            // Remove any non-GUID characters
            var cleanedInput = Regex.Replace(input, @"[^a-fA-F0-9-]", "");

            if (!Guid.TryParse(cleanedInput, out Guid guidValue))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} must be a valid GUID",
                    SanitizedValue = string.Empty
                };
            }

            return new ValidationResult
            {
                IsValid = true,
                SanitizedValue = guidValue.ToString(),
                ErrorMessage = string.Empty
            };
        }

        /// <summary>
        /// Validates and sanitizes a phone number
        /// </summary>
        public ValidationResult ValidateAndSanitizePhoneNumber(string? input, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} cannot be empty",
                    SanitizedValue = string.Empty
                };
            }

            // Remove all non-digit characters
            var cleanedInput = Regex.Replace(input, @"[^\d]", "");

            if (cleanedInput.Length < 10 || cleanedInput.Length > 15)
            {
                return new ValidationResult
                {
                    IsValid = false,
                    ErrorMessage = $"{fieldName} must be between 10 and 15 digits",
                    SanitizedValue = string.Empty
                };
            }

            return new ValidationResult
            {
                IsValid = true,
                SanitizedValue = cleanedInput,
                ErrorMessage = string.Empty
            };
        }

        /// <summary>
        /// Checks if input contains potentially dangerous content
        /// </summary>
        private bool ContainsDangerousContent(string input)
        {
            var lowerInput = input.ToLowerInvariant();

            // Check for SQL injection patterns
            var sqlPatterns = new[]
            {
                "select ", "insert ", "update ", "delete ", "drop ", "create ", "alter ",
                "exec ", "execute ", "union ", "script", "javascript:", "vbscript:",
                "<script", "</script>", "onload=", "onerror=", "onclick="
            };

            foreach (var pattern in sqlPatterns)
            {
                if (lowerInput.Contains(pattern))
                {
                    return true;
                }
            }

            // Check for HTML/XML injection
            if (Regex.IsMatch(input, @"<[^>]*>") || input.Contains("&lt;") || input.Contains("&gt;"))
            {
                return true;
            }

            // Check for command injection
            if (Regex.IsMatch(input, @"[;&|`$(){}[\]]"))
            {
                return true;
            }

            return false;
        }

        /// <summary>
        /// Sanitizes a string input
        /// </summary>
        private string SanitizeString(string input)
        {
            // Remove HTML tags
            var sanitized = Regex.Replace(input, @"<[^>]*>", "");
            
            // Decode HTML entities
            sanitized = HttpUtility.HtmlDecode(sanitized);
            
            // Remove control characters
            sanitized = Regex.Replace(sanitized, @"[\x00-\x1F\x7F]", "");
            
            // Trim whitespace
            sanitized = sanitized.Trim();
            
            return sanitized;
        }

        /// <summary>
        /// Initializes validation patterns
        /// </summary>
        private Dictionary<string, Regex> InitializeValidationPatterns()
        {
            return new Dictionary<string, Regex>
            {
                { "Email", new Regex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", RegexOptions.Compiled) },
                { "Phone", new Regex(@"^[\d\s\-\(\)\+]+$", RegexOptions.Compiled) },
                { "PostalCode", new Regex(@"^[\dA-Za-z\s\-]+$", RegexOptions.Compiled) },
                { "Currency", new Regex(@"^[\d,]+\.?\d{0,2}$", RegexOptions.Compiled) }
            };
        }
    }

    /// <summary>
    /// Result of validation and sanitization
    /// </summary>
    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string SanitizedValue { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
