namespace GarmentsERP.API.DTOs
{
    public class TrialBalanceComparisonDto
    {
        public TrialBalanceResponseDto Period1 { get; set; } = new();
        public TrialBalanceResponseDto Period2 { get; set; } = new();
        public List<AccountVarianceDto> Variances { get; set; } = new();
        public decimal TotalVariance { get; set; }
        public DateTime ComparisonGeneratedAt { get; set; } = DateTime.UtcNow;
    }
}
