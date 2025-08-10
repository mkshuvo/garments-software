using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.DTOs
{
    public class TransactionSummaryDto
    {
        public Guid AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public DateTime TransactionDate { get; set; }
        public JournalType JournalType { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
    }
}