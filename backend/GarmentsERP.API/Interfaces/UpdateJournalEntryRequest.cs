using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Journal entry update request
    /// </summary>
    public class UpdateJournalEntryRequest
    {
        public DateTime? TransactionDate { get; set; }
        public string? JournalType { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? Description { get; set; }
        public List<JournalEntryLineRequest>? Lines { get; set; }
    }
}
