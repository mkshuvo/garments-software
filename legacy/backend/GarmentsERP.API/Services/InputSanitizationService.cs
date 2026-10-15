using GarmentsERP.API.Interfaces;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Web;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for sanitizing user input to prevent security vulnerabilities
    /// </summary>
    public class InputSanitizationService : IInputSanitizationService
    {
        private readonly ILogger<InputSanitizationService> _logger;

        // Patterns for detecting malicious content
        private static readonly Regex SqlInjectionPattern = new(@"(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|MERGE|SELECT|UPDATE|UNION|USE)\b)|('(''|[^'])*')|(;|\-\-|\/\*|\*\/)", 
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex XssPattern = new(@"<script[^>]*>.*?</script>|javascript:|vbscript:|onload=|onerror=|onclick=|onmouseover=", 
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex EmailPattern = new(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", 
            RegexOptions.Compiled);

        private static readonly Regex PhonePattern = new(@"^[\+]?[1-9][\d]{0,15}$", 
            RegexOptions.Compiled);

        private static readonly Regex FileNamePattern = new(@"^[a-zA-Z0-9._-]+$", 
            RegexOptions.Compiled);

        private static readonly string[] DangerousStrings = {
            "<script", "</script>", "javascript:", "vbscript:", "onload=", "onerror=", "onclick=", "onmouseover=",
            "eval(", "expression(", "url(", "import(", "document.cookie", "document.write", "window.location",
            "exec", "system", "cmd", "powershell", "../", "..\\", "%2e%2e", "%252e%252e"
        };

        public InputSanitizationService(ILogger<InputSanitizationService> logger)
        {
            _logger = logger;
        }

        public string SanitizeString(string input, int maxLength = 1000)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            try
            {
                // Trim whitespace
                var sanitized = input.Trim();

                // Check length
                if (sanitized.Length > maxLength)
                {
                    sanitized = sanitized.Substring(0, maxLength);
                    _logger.LogWarning("Input truncated to {MaxLength} characters", maxLength);
                }

                // HTML encode to prevent XSS
                sanitized = HttpUtility.HtmlEncode(sanitized);

                // Remove null characters and control characters
                sanitized = Regex.Replace(sanitized, @"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "");

                // Check for malicious content
                if (ContainsMaliciousContent(sanitized))
                {
                    _logger.LogWarning("Potentially malicious content detected and sanitized");
                    sanitized = RemoveDangerousCharacters(sanitized);
                }

                return sanitized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing string input");
                return string.Empty;
            }
        }

        public string SanitizeHtml(string htmlInput)
        {
            if (string.IsNullOrEmpty(htmlInput))
                return string.Empty;

            try
            {
                // Remove script tags and dangerous attributes
                var sanitized = XssPattern.Replace(htmlInput, "");
                
                // HTML encode the result
                sanitized = HttpUtility.HtmlEncode(sanitized);

                return sanitized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing HTML input");
                return HttpUtility.HtmlEncode(htmlInput);
            }
        }

        public string SanitizeSqlInput(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            try
            {
                // Remove SQL injection patterns
                var sanitized = SqlInjectionPattern.Replace(input, "");
                
                // Escape single quotes
                sanitized = sanitized.Replace("'", "''");
                
                // Remove dangerous characters
                sanitized = sanitized.Replace(";", "").Replace("--", "").Replace("/*", "").Replace("*/", "");

                return sanitized.Trim();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing SQL input");
                return string.Empty;
            }
        }

        public string SanitizeEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return string.Empty;

            try
            {
                var sanitized = email.Trim().ToLowerInvariant();
                
                if (!EmailPattern.IsMatch(sanitized))
                {
                    _logger.LogWarning("Invalid email format detected: {Email}", email);
                    return string.Empty;
                }

                return sanitized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing email");
                return string.Empty;
            }
        }

        public string SanitizePhoneNumber(string phoneNumber)
        {
            if (string.IsNullOrEmpty(phoneNumber))
                return string.Empty;

            try
            {
                // Remove all non-digit characters except + at the beginning
                var sanitized = Regex.Replace(phoneNumber, @"[^\d+]", "");
                
                // Ensure + is only at the beginning
                if (sanitized.Contains('+'))
                {
                    var parts = sanitized.Split('+');
                    sanitized = "+" + string.Join("", parts.Skip(1));
                }

                if (!PhonePattern.IsMatch(sanitized))
                {
                    _logger.LogWarning("Invalid phone number format detected: {PhoneNumber}", phoneNumber);
                    return string.Empty;
                }

                return sanitized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing phone number");
                return string.Empty;
            }
        }

        public string SanitizeFileName(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return string.Empty;

            try
            {
                // Remove path separators and dangerous characters
                var sanitized = Path.GetFileName(fileName);
                
                // Remove invalid file name characters
                var invalidChars = Path.GetInvalidFileNameChars();
                foreach (var c in invalidChars)
                {
                    sanitized = sanitized.Replace(c, '_');
                }

                // Remove dangerous patterns
                sanitized = sanitized.Replace("..", "").Replace("./", "").Replace(".\\", "");

                // Limit length
                if (sanitized.Length > 255)
                {
                    var extension = Path.GetExtension(sanitized);
                    var nameWithoutExtension = Path.GetFileNameWithoutExtension(sanitized);
                    sanitized = nameWithoutExtension.Substring(0, 255 - extension.Length) + extension;
                }

                return sanitized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing file name");
                return "sanitized_file";
            }
        }

        public string SanitizeUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
                return string.Empty;

            try
            {
                if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
                {
                    _logger.LogWarning("Invalid URL format detected: {Url}", url);
                    return string.Empty;
                }

                // Only allow HTTP and HTTPS schemes
                if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
                {
                    _logger.LogWarning("Unsafe URL scheme detected: {Scheme}", uri.Scheme);
                    return string.Empty;
                }

                return uri.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing URL");
                return string.Empty;
            }
        }

        public decimal? SanitizeDecimal(string input)
        {
            if (string.IsNullOrEmpty(input))
                return null;

            try
            {
                // Remove any non-numeric characters except decimal point and minus sign
                var sanitized = Regex.Replace(input, @"[^\d.-]", "");
                
                if (decimal.TryParse(sanitized, NumberStyles.AllowDecimalPoint | NumberStyles.AllowLeadingSign, 
                    CultureInfo.InvariantCulture, out var result))
                {
                    return result;
                }

                _logger.LogWarning("Invalid decimal format detected: {Input}", input);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing decimal input");
                return null;
            }
        }

        public int? SanitizeInteger(string input)
        {
            if (string.IsNullOrEmpty(input))
                return null;

            try
            {
                // Remove any non-numeric characters except minus sign
                var sanitized = Regex.Replace(input, @"[^\d-]", "");
                
                if (int.TryParse(sanitized, out var result))
                {
                    return result;
                }

                _logger.LogWarning("Invalid integer format detected: {Input}", input);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing integer input");
                return null;
            }
        }

        public DateTime? SanitizeDateTime(string input)
        {
            if (string.IsNullOrEmpty(input))
                return null;

            try
            {
                if (DateTime.TryParse(input, CultureInfo.InvariantCulture, DateTimeStyles.None, out var result))
                {
                    // Ensure the date is within reasonable bounds
                    if (result < DateTime.MinValue.AddYears(1900) || result > DateTime.MaxValue.AddYears(-100))
                    {
                        _logger.LogWarning("Date out of reasonable range: {Date}", result);
                        return null;
                    }

                    return result;
                }

                _logger.LogWarning("Invalid date format detected: {Input}", input);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sanitizing date input");
                return null;
            }
        }

        public bool ContainsMaliciousContent(string input)
        {
            if (string.IsNullOrEmpty(input))
                return false;

            var lowerInput = input.ToLowerInvariant();
            
            return DangerousStrings.Any(dangerous => lowerInput.Contains(dangerous.ToLowerInvariant())) ||
                   SqlInjectionPattern.IsMatch(input) ||
                   XssPattern.IsMatch(input);
        }

        public string RemoveDangerousCharacters(string input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            var sanitized = input;

            // Remove dangerous strings
            foreach (var dangerous in DangerousStrings)
            {
                sanitized = sanitized.Replace(dangerous, "", StringComparison.OrdinalIgnoreCase);
            }

            // Remove SQL injection patterns
            sanitized = SqlInjectionPattern.Replace(sanitized, "");

            // Remove XSS patterns
            sanitized = XssPattern.Replace(sanitized, "");

            return sanitized;
        }
    }
}