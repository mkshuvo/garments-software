using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Export response model
    /// </summary>
    public class ExportJournalEntriesResponse
    {
        public bool Success { get; set; }
        public string? Message { get; set; }
        public string? FileName { get; set; }
        public string? DownloadUrl { get; set; }
        public int ExportedRecords { get; set; }
        public DateTime ExportDate { get; set; } = DateTime.UtcNow;
    }
}
