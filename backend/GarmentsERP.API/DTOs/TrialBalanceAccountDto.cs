namespace GarmentsERP.API.DTOs
{
    public class TrialBalanceAccountDto
    {
        public Guid AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryDescription { get; set; } = string.Empty;
        public string Particulars { get; set; } = string.Empty; // Transaction description/particulars
        public decimal DebitAmount { get; set; } // Negative values for debits
        public decimal CreditAmount { get; set; } // Positive values for credits
        public decimal NetBalance { get; set; }
        public int TransactionCount { get; set; }
    }
}