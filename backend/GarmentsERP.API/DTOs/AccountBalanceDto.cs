using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.DTOs
{
    public class AccountBalanceDto
    {
        public Guid AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public decimal Balance { get; set; }
        public DateTime LastUpdated { get; set; }
        public bool IsFromCache { get; set; }
    }
}
