using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class CashBookEntryDto
    {
        public Guid Id { get; set; }
        public string JournalNumber { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public JournalStatus Status { get; set; }
        public TransactionStatus TransactionStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public Guid? ApprovedByUserId { get; set; }
        public string? ApprovedByUserName { get; set; }
        public List<CashBookLineDto> Lines { get; set; } = new();
        public bool IsBalanced => Math.Abs(TotalDebit - TotalCredit) < 0.01m;
        public bool CanEdit => TransactionStatus == TransactionStatus.Draft;
        public bool CanComplete => TransactionStatus == TransactionStatus.Draft && IsBalanced;
        public bool CanReverse => TransactionStatus == TransactionStatus.Completed;
    }
}
