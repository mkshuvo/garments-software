using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public class CashBookLineDto
    {
        public Guid? Id { get; set; }
        public Guid AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
        public Guid? ContactId { get; set; }
        public string? ContactName { get; set; }
        public int LineOrder { get; set; }
    }
}
