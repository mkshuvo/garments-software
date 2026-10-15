using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// DTO for journal entry line details
    /// </summary>
    public class JournalEntryLineDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? Reference { get; set; }
        public int LineOrder { get; set; }
        public string? ContactName { get; set; }

        // Computed properties
        public string FormattedDebit => Debit > 0 ? Debit.ToString("C2") : "";
        public string FormattedCredit => Credit > 0 ? Credit.ToString("C2") : "";
        public string LineType => Debit > 0 ? "Debit" : "Credit";
        public decimal LineAmount => Debit > 0 ? Debit : Credit;
        public string FormattedLineAmount => LineAmount.ToString("C2");
    }
}
