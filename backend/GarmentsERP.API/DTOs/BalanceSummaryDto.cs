using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.DTOs
{
    public class BalanceSummaryDto
    {
        public decimal BankBalance { get; set; }
        public decimal CashOnHand { get; set; }
        public decimal TotalAssets { get; set; }
        public decimal TotalLiabilities { get; set; }
        public decimal TotalEquity { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetIncome { get; set; }
        public DateTime LastUpdated { get; set; }
        public bool IsFromCache { get; set; }
        public List<AccountBalanceDto> KeyAccounts { get; set; } = new();
    }
}
