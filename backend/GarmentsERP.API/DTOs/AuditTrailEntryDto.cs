using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Audit trail entry for journal entries
    /// </summary>
    public class AuditTrailEntryDto
    {
        public DateTime Timestamp { get; set; }
        public string Action { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string? PreviousValue { get; set; }
        public string? NewValue { get; set; }

        // Computed properties
        public string FormattedTimestamp => Timestamp.ToString("MMM dd, yyyy HH:mm:ss");
    }
}
