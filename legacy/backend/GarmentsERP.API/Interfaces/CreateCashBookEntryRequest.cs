using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    // Request/Response DTOs
    public class CreateCashBookEntryRequest
    {
        public DateTime TransactionDate { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<CashBookLineDto> Lines { get; set; } = new();
        public bool SaveAsDraft { get; set; } = false;
    }
}
