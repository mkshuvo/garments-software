using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class CashBookEntryResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public CashBookEntryDto? Entry { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }
}
