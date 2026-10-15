using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Statistics request model
    /// </summary>
    public class JournalEntryStatisticsRequest
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? Status { get; set; }
        public string? JournalType { get; set; }
    }
}
