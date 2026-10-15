using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Journal entry line request
    /// </summary>
    public class JournalEntryLineRequest
    {
        public Guid AccountId { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
        public int LineOrder { get; set; }
    }
}
