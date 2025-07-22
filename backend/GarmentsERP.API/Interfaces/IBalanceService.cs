using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    public interface IBalanceService
    {
        /// <summary>
        /// Get current bank balance from cache or database
        /// </summary>
        Task<decimal> GetBankBalanceAsync();

        /// <summary>
        /// Get current cash on hand balance from cache or database
        /// </summary>
        Task<decimal> GetCashOnHandBalanceAsync();

        /// <summary>
        /// Get comprehensive balance summary with all key accounts
        /// </summary>
        Task<BalanceSummaryDto> GetBalanceSummaryAsync();

        /// <summary>
        /// Update balance cache after transaction posting
        /// </summary>
        Task UpdateBalanceCacheAsync(Guid accountId, decimal amount, bool isDebit);

        /// <summary>
        /// Refresh all balance caches from database
        /// </summary>
        Task RefreshBalanceCacheAsync();

        /// <summary>
        /// Get account balance with caching
        /// </summary>
        Task<decimal> GetAccountBalanceAsync(Guid accountId);

        /// <summary>
        /// Get account balance as of specific date
        /// </summary>
        Task<decimal> GetAccountBalanceAsOfDateAsync(Guid accountId, DateTime asOfDate);

        /// <summary>
        /// Clear balance cache for specific account
        /// </summary>
        Task ClearAccountBalanceCacheAsync(Guid accountId);

        /// <summary>
        /// Get real-time balance for cash book entry validation
        /// </summary>
        Task<decimal> GetRealTimeAccountBalanceAsync(Guid accountId);
    }
}