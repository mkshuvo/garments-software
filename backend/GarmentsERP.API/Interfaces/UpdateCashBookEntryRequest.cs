using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class UpdateCashBookEntryRequest
    {
        public DateTime TransactionDate { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<CashBookLineDto> Lines { get; set; } = new();
    }
}
