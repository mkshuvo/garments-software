using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    public interface ITrialBalanceService
    {
        Task<TrialBalanceResponseDto> GenerateTrialBalanceAsync(TrialBalanceRequestDto request);
        Task<TrialBalanceComparisonDto> CompareTrialBalancesAsync(TrialBalanceRequestDto period1, TrialBalanceRequestDto period2);
        Task<List<AccountTransactionDto>> GetAccountTransactionsAsync(Guid accountId, DateTime startDate, DateTime endDate);
    }

    // Additional DTOs for account transactions
    public class AccountTransactionDto
    {
        public Guid TransactionId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string CategoryDescription { get; set; } = string.Empty;
        public string Particulars { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal RunningBalance { get; set; }
    }


}