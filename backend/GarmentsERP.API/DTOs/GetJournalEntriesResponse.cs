using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Response model for journal entries with pagination and summary information
    /// </summary>
    public class GetJournalEntriesResponse
    {
        public bool Success { get; set; } = true;
        public string? Message { get; set; }
        public List<JournalEntryDisplayDto> Entries { get; set; } = new();
        public PaginationInfo Pagination { get; set; } = new();
        public SummaryInfo Summary { get; set; } = new();
    }
}
