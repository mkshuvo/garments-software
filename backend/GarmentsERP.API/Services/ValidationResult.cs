using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using System.Web;

namespace GarmentsERP.API.Services
{
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
