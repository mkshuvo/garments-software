using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class CreateTransactionRequest
    {
        public DateTime TransactionDate { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<TransactionLineDto> Lines { get; set; } = new();
        public JournalType JournalType { get; set; } = JournalType.General;
        public bool SaveAsDraft { get; set; } = false;
    }
}
