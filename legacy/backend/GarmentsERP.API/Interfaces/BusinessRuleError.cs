using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Interfaces
{
    public class BusinessRuleError
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public object? Context { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
