using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// Display DTO for journal entries in list view
    /// </summary>
    public class JournalEntryDisplayDto
    {
        public string Id { get; set; } = string.Empty;
        public string JournalNumber { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string Type { get; set; } = string.Empty; // "Credit" or "Debit"
        public string CategoryName { get; set; } = string.Empty;
        public string Particulars { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? ContactName { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string TransactionStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string JournalType { get; set; } = string.Empty;

        // Computed properties for formatting
        public string FormattedAmount => Amount.ToString("C2");
        public string FormattedDate => TransactionDate.ToString("MMM dd, yyyy");
        public string FormattedCreatedDate => CreatedAt.ToString("MMM dd, yyyy HH:mm");
        public string TypeColor => Type == "Credit" ? "success" : "error";
        public string StatusColor => Status switch
        {
            "Draft" => "warning",
            "Posted" => "info",
            "Approved" => "success",
            "Reversed" => "error",
            _ => "default"
        };
    }
}
