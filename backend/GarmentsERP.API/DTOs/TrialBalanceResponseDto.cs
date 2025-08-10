namespace GarmentsERP.API.DTOs
{
    public class TrialBalanceResponseDto
    {
        public DateRangeDto DateRange { get; set; } = new();
        public List<AccountCategoryDto> Categories { get; set; } = new();
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal FinalBalance { get; set; }
        public string CalculationExpression { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
        public int TotalTransactions { get; set; }
    }

    public class DateRangeDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class AccountCategoryDto
    {
        public string Name { get; set; } = string.Empty; // Assets, Liabilities, Equity, Income, Expenses
        public List<TrialBalanceAccountDto> Accounts { get; set; } = new();
        public decimal Subtotal { get; set; }
    }
}