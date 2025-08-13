using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    public interface ITrialBalanceService
    {
        Task<TrialBalanceResponseDto> GenerateTrialBalanceAsync(TrialBalanceRequestDto request);
        Task<TrialBalanceComparisonDto> CompareTrialBalancesAsync(TrialBalanceRequestDto period1, TrialBalanceRequestDto period2);
        Task<List<AccountTransactionDto>> GetAccountTransactionsAsync(Guid accountId, DateTime startDate, DateTime endDate);
    }




}