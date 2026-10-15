using GarmentsERP.API.DTOs;
using GarmentsERP.API.Services;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Interface for trial balance caching service
    /// </summary>
    public interface ITrialBalanceCacheService
    {
        /// <summary>
        /// Get cached trial balance data
        /// </summary>
        Task<TrialBalanceResponseDto?> GetCachedTrialBalanceAsync(string cacheKey);

        /// <summary>
        /// Cache trial balance data
        /// </summary>
        Task SetCachedTrialBalanceAsync(string cacheKey, TrialBalanceResponseDto data, TimeSpan? expiry = null);

        /// <summary>
        /// Get cached account transactions
        /// </summary>
        Task<List<AccountTransactionDto>?> GetCachedAccountTransactionsAsync(string cacheKey);

        /// <summary>
        /// Cache account transactions
        /// </summary>
        Task SetCachedAccountTransactionsAsync(string cacheKey, List<AccountTransactionDto> data, TimeSpan? expiry = null);

        /// <summary>
        /// Generate cache key for trial balance request
        /// </summary>
        string GenerateTrialBalanceCacheKey(TrialBalanceRequestDto request);

        /// <summary>
        /// Generate cache key for account transactions
        /// </summary>
        string GenerateAccountTransactionsCacheKey(Guid accountId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Invalidate trial balance cache for a specific date range
        /// </summary>
        Task InvalidateTrialBalanceCacheAsync(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Clear all trial balance cache entries
        /// </summary>
        Task ClearAllCacheAsync();

        /// <summary>
        /// Get cache statistics
        /// </summary>
        Task<CacheStatistics> GetCacheStatisticsAsync();
    }
}