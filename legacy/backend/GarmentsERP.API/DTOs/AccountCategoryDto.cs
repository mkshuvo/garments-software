namespace GarmentsERP.API.DTOs
{
    public class AccountCategoryDto
    {
        public string Name { get; set; } = string.Empty; // Assets, Liabilities, Equity, Income, Expenses
        public List<TrialBalanceAccountDto> Accounts { get; set; } = new();
        public decimal Subtotal { get; set; }
    }
}
