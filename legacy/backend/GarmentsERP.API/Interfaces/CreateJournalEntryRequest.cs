using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Journal entry creation request
    /// </summary>
    public class CreateJournalEntryRequest
    {
        public DateTime TransactionDate { get; set; }
        public string JournalType { get; set; } = "General";
        public string? ReferenceNumber { get; set; }
        public string? Description { get; set; }
        public List<JournalEntryLineRequest> Lines { get; set; } = new();
    }
}
