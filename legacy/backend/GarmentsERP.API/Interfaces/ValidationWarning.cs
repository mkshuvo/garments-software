using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class ValidationWarning
    {
        public string Field { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Code { get; set; }
    }
}
