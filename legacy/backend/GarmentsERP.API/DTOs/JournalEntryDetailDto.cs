using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Detailed DTO for journal entry view
    /// </summary>
    public class JournalEntryDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string JournalNumber { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string JournalType { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public string Status { get; set; } = string.Empty;
        public string TransactionStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? UpdatedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public List<JournalEntryLineDetailDto> Lines { get; set; } = new();
        public List<AuditTrailEntryDto> AuditTrail { get; set; } = new();

        // Computed properties
        public string FormattedTotalDebit => TotalDebit.ToString("C2");
        public string FormattedTotalCredit => TotalCredit.ToString("C2");
        public string FormattedDate => TransactionDate.ToString("MMM dd, yyyy");
        public bool IsBalanced => TotalDebit == TotalCredit;
        public decimal Balance => TotalDebit - TotalCredit;
    }
}
