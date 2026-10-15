namespace GarmentsERP.API.DTOs
{
    public class AccountVarianceDto
    {
        public Guid AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public decimal Period1Balance { get; set; }
        public decimal Period2Balance { get; set; }
        public decimal AbsoluteChange { get; set; }
        public decimal PercentageChange { get; set; }
        public string ChangeType { get; set; } = string.Empty; // "Increased", "Decreased", "New", "Removed"
    }
}
