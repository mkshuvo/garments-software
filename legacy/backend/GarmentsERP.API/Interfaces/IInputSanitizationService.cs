namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Interface for input sanitization service
    /// </summary>
    public interface IInputSanitizationService
    {
        /// <summary>
        /// Sanitize string input to prevent XSS and injection attacks
        /// </summary>
        string SanitizeString(string input, int maxLength = 1000);

        /// <summary>
        /// Sanitize HTML content
        /// </summary>
        string SanitizeHtml(string htmlInput);

        /// <summary>
        /// Sanitize SQL input to prevent SQL injection
        /// </summary>
        string SanitizeSqlInput(string input);

        /// <summary>
        /// Validate and sanitize email address
        /// </summary>
        string SanitizeEmail(string email);

        /// <summary>
        /// Validate and sanitize phone number
        /// </summary>
        string SanitizePhoneNumber(string phoneNumber);

        /// <summary>
        /// Sanitize file name to prevent directory traversal
        /// </summary>
        string SanitizeFileName(string fileName);

        /// <summary>
        /// Validate and sanitize URL
        /// </summary>
        string SanitizeUrl(string url);

        /// <summary>
        /// Sanitize numeric input
        /// </summary>
        decimal? SanitizeDecimal(string input);

        /// <summary>
        /// Sanitize integer input
        /// </summary>
        int? SanitizeInteger(string input);

        /// <summary>
        /// Sanitize date input
        /// </summary>
        DateTime? SanitizeDateTime(string input);

        /// <summary>
        /// Check if input contains potentially malicious content
        /// </summary>
        bool ContainsMaliciousContent(string input);

        /// <summary>
        /// Remove potentially dangerous characters
        /// </summary>
        string RemoveDangerousCharacters(string input);
    }
}