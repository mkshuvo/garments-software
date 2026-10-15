using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class CashBookFilterRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? Description { get; set; }
        public JournalStatus? Status { get; set; }
        public TransactionStatus? TransactionStatus { get; set; }
        public Guid? AccountId { get; set; }
        public Guid? ContactId { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "TransactionDate";
        public bool SortDescending { get; set; } = true;
    }
}
