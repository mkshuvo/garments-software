using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for caching trial balance data using Redis to improve performance
    /// </summary>
    public class TrialBalanceCacheService : ITrialBalanceCacheService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<TrialBalanceCacheService> _logger;
        private readonly TimeSpan _defaultCacheExpiry = TimeSpan.FromMinutes(5);
        private readonly string _cacheKeyPrefix = "trial_balance:";

        public TrialBalanceCacheService(
            IDistributedCache cache,
            ILogger<TrialBalanceCacheService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        /// <summary>
        /// Get cached trial balance data
        /// </summary>
        public async Task<TrialBalanceResponseDto?> GetCachedTrialBalanceAsync(string cacheKey)
        {
            try
            {
                var cachedData = await _cache.GetStringAsync($"{_cacheKeyPrefix}{cacheKey}");
                
                if (string.IsNullOrEmpty(cachedData))
                {
                    _logger.LogDebug("Cache miss for trial balance key: {CacheKey}", cacheKey);
                    return null;
                }

                var result = JsonSerializer.Deserialize<TrialBalanceResponseDto>(cachedData);
                _logger.LogDebug("Cache hit for trial balance key: {CacheKey}", cacheKey);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cached trial balance for key: {CacheKey}", cacheKey);
                return null; // Return null on cache errors to allow fallback to database
            }
        }

        /// <summary>
        /// Cache trial balance data
        /// </summary>
        public async Task SetCachedTrialBalanceAsync(string cacheKey, TrialBalanceResponseDto data, TimeSpan? expiry = null)
        {
            try
            {
                var serializedData = JsonSerializer.Serialize(data);
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiry ?? _defaultCacheExpiry
                };

                await _cache.SetStringAsync($"{_cacheKeyPrefix}{cacheKey}", serializedData, options);
                _logger.LogDebug("Cached trial balance data for key: {CacheKey}, expires in: {Expiry}", 
                    cacheKey, expiry ?? _defaultCacheExpiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error caching trial balance for key: {CacheKey}", cacheKey);
                // Don't throw - caching failures shouldn't break the application
            }
        }

        /// <summary>
        /// Get cached account transactions
        /// </summary>
        public async Task<List<AccountTransactionDto>?> GetCachedAccountTransactionsAsync(string cacheKey)
        {
            try
            {
                var cachedData = await _cache.GetStringAsync($"{_cacheKeyPrefix}transactions:{cacheKey}");
                
                if (string.IsNullOrEmpty(cachedData))
                {
                    _logger.LogDebug("Cache miss for account transactions key: {CacheKey}", cacheKey);
                    return null;
                }

                var result = JsonSerializer.Deserialize<List<AccountTransactionDto>>(cachedData);
                _logger.LogDebug("Cache hit for account transactions key: {CacheKey}", cacheKey);
                
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cached account transactions for key: {CacheKey}", cacheKey);
                return null;
            }
        }

        /// <summary>
        /// Cache account transactions
        /// </summary>
        public async Task SetCachedAccountTransactionsAsync(string cacheKey, List<AccountTransactionDto> data, TimeSpan? expiry = null)
        {
            try
            {
                var serializedData = JsonSerializer.Serialize(data);
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiry ?? _defaultCacheExpiry
                };

                await _cache.SetStringAsync($"{_cacheKeyPrefix}transactions:{cacheKey}", serializedData, options);
                _logger.LogDebug("Cached account transactions for key: {CacheKey}, expires in: {Expiry}", 
                    cacheKey, expiry ?? _defaultCacheExpiry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error caching account transactions for key: {CacheKey}", cacheKey);
            }
        }

        /// <summary>
        /// Generate cache key for trial balance request
        /// </summary>
        public string GenerateTrialBalanceCacheKey(TrialBalanceRequestDto request)
        {
            var keyComponents = new[]
            {
                request.StartDate.ToString("yyyy-MM-dd"),
                request.EndDate.ToString("yyyy-MM-dd"),
                request.GroupByCategory.ToString(),
                request.IncludeZeroBalances.ToString(),
                string.Join(",", request.CategoryFilter?.OrderBy(x => x) ?? Enumerable.Empty<string>())
            };

            return string.Join(":", keyComponents);
        }

        /// <summary>
        /// Generate cache key for account transactions
        /// </summary>
        public string GenerateAccountTransactionsCacheKey(Guid accountId, DateTime startDate, DateTime endDate)
        {
            return $"{accountId}:{startDate:yyyy-MM-dd}:{endDate:yyyy-MM-dd}";
        }

        /// <summary>
        /// Invalidate trial balance cache for a specific date range
        /// </summary>
        public Task InvalidateTrialBalanceCacheAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                // Since Redis doesn't support pattern-based deletion easily,
                // we'll implement a simple approach by tracking cache keys
                var pattern = $"{_cacheKeyPrefix}*{startDate:yyyy-MM-dd}*{endDate:yyyy-MM-dd}*";
                _logger.LogInformation("Invalidating trial balance cache for pattern: {Pattern}", pattern);
                
                // For now, we'll rely on cache expiry. In a production environment,
                // you might want to implement a more sophisticated cache invalidation strategy
                // using Redis SCAN command or maintaining a list of active cache keys
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating trial balance cache");
            }
            
            return Task.CompletedTask;
        }

        /// <summary>
        /// Clear all trial balance cache entries
        /// </summary>
        public Task ClearAllCacheAsync()
        {
            try
            {
                // This is a simplified implementation
                // In production, you'd want to use Redis SCAN to find and delete keys by pattern
                _logger.LogInformation("Cache clear requested - relying on expiry for cleanup");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing trial balance cache");
            }
            
            return Task.CompletedTask;
        }

        /// <summary>
        /// Get cache statistics
        /// </summary>
        public Task<CacheStatistics> GetCacheStatisticsAsync()
        {
            try
            {
                // This would require additional Redis commands to get actual statistics
                // For now, return basic info
                return Task.FromResult(new CacheStatistics
                {
                    DefaultExpiryMinutes = (int)_defaultCacheExpiry.TotalMinutes,
                    CacheKeyPrefix = _cacheKeyPrefix,
                    IsEnabled = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cache statistics");
                return Task.FromResult(new CacheStatistics
                {
                    DefaultExpiryMinutes = (int)_defaultCacheExpiry.TotalMinutes,
                    CacheKeyPrefix = _cacheKeyPrefix,
                    IsEnabled = false
                });
            }
        }
    }

    /// <summary>
    /// Cache statistics model
    /// </summary>
    public class CacheStatistics
    {
        public int DefaultExpiryMinutes { get; set; }
        public string CacheKeyPrefix { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public long TotalKeys { get; set; }
        public long HitCount { get; set; }
        public long MissCount { get; set; }
    }
}