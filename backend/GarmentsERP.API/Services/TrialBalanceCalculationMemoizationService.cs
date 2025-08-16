using System.Collections.Concurrent;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Services;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for memoizing trial balance calculation results to avoid re-computation
    /// </summary>
    public class TrialBalanceCalculationMemoizationService : ITrialBalanceCalculationMemoizationService
    {
        private readonly ITrialBalanceCalculationService _calculationService;
        private readonly ILogger<TrialBalanceCalculationMemoizationService> _logger;
        
        // In-memory cache for calculation results with expiry
        private readonly ConcurrentDictionary<string, CachedCalculation> _calculationCache;
        private readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(10);
        private readonly Timer _cleanupTimer;

        public TrialBalanceCalculationMemoizationService(
            ITrialBalanceCalculationService calculationService,
            ILogger<TrialBalanceCalculationMemoizationService> logger)
        {
            _calculationService = calculationService;
            _logger = logger;
            _calculationCache = new ConcurrentDictionary<string, CachedCalculation>();
            
            // Setup cleanup timer to run every 5 minutes
            _cleanupTimer = new Timer(CleanupExpiredEntries, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
        }

        /// <summary>
        /// Calculate trial balance with memoization
        /// </summary>
        public TrialBalanceCalculation CalculateTrialBalanceWithMemoization(List<TransactionData> transactions)
        {
            try
            {
                var cacheKey = GenerateCalculationCacheKey(transactions);
                
                // Check if we have a cached result
                if (_calculationCache.TryGetValue(cacheKey, out var cachedResult) && 
                    cachedResult.ExpiresAt > DateTime.UtcNow &&
                    cachedResult.Result != null)
                {
                    _logger.LogDebug("Returning memoized calculation result for key: {CacheKey}", cacheKey);
                    return cachedResult.Result;
                }

                // Calculate and cache the result
                var result = _calculationService.CalculateTrialBalance(transactions);
                
                if (result != null)
                {
                    var cachedCalculation = new CachedCalculation
                    {
                        Result = result,
                        CreatedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.Add(_cacheExpiry)
                    };

                    _calculationCache.AddOrUpdate(cacheKey, cachedCalculation, (key, existing) => cachedCalculation);
                    
                    _logger.LogDebug("Cached calculation result for key: {CacheKey}", cacheKey);
                }
                
                return result ?? new TrialBalanceCalculation
                {
                    FinalBalance = 0,
                    Expression = "No transactions",
                    TransactionCount = 0,
                    TotalDebits = 0,
                    TotalCredits = 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in memoized trial balance calculation");
                // Fallback to direct calculation
                var fallbackResult = _calculationService.CalculateTrialBalance(transactions);
                return fallbackResult ?? new TrialBalanceCalculation
                {
                    FinalBalance = 0,
                    Expression = "Calculation failed",
                    TransactionCount = 0,
                    TotalDebits = 0,
                    TotalCredits = 0
                };
            }
        }

        /// <summary>
        /// Generate calculation expression with memoization
        /// </summary>
        public string GenerateCalculationExpressionWithMemoization(List<decimal> values, decimal finalBalance)
        {
            try
            {
                var cacheKey = GenerateExpressionCacheKey(values, finalBalance);
                
                if (_calculationCache.TryGetValue(cacheKey, out var cachedResult) && 
                    cachedResult.ExpiresAt > DateTime.UtcNow)
                {
                    _logger.LogDebug("Returning memoized expression for key: {CacheKey}", cacheKey);
                    return cachedResult.Expression ?? string.Empty;
                }

                var expression = _calculationService.GenerateCalculationExpression(values, finalBalance);
                
                var cachedCalculation = new CachedCalculation
                {
                    Expression = expression,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.Add(_cacheExpiry)
                };

                _calculationCache.AddOrUpdate(cacheKey, cachedCalculation, (key, existing) => cachedCalculation);
                
                return expression;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in memoized expression generation");
                return _calculationService.GenerateCalculationExpression(values, finalBalance);
            }
        }

        /// <summary>
        /// Compute final balance with memoization
        /// </summary>
        public decimal ComputeFinalBalanceWithMemoization(List<decimal> values)
        {
            try
            {
                var cacheKey = GenerateBalanceCacheKey(values);
                
                if (_calculationCache.TryGetValue(cacheKey, out var cachedResult) && 
                    cachedResult.ExpiresAt > DateTime.UtcNow)
                {
                    _logger.LogDebug("Returning memoized balance for key: {CacheKey}", cacheKey);
                    return cachedResult.FinalBalance;
                }

                var balance = _calculationService.ComputeFinalBalance(values);
                
                var cachedCalculation = new CachedCalculation
                {
                    FinalBalance = balance,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = DateTime.UtcNow.Add(_cacheExpiry)
                };

                _calculationCache.AddOrUpdate(cacheKey, cachedCalculation, (key, existing) => cachedCalculation);
                
                return balance;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in memoized balance computation");
                return _calculationService.ComputeFinalBalance(values);
            }
        }

        /// <summary>
        /// Clear all memoized calculations
        /// </summary>
        public void ClearMemoizationCache()
        {
            try
            {
                var count = _calculationCache.Count;
                _calculationCache.Clear();
                _logger.LogInformation("Cleared {Count} memoized calculations", count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing memoization cache");
            }
        }

        /// <summary>
        /// Get memoization cache statistics
        /// </summary>
        public MemoizationStatistics GetMemoizationStatistics()
        {
            try
            {
                var now = DateTime.UtcNow;
                var activeEntries = _calculationCache.Values.Count(c => c.ExpiresAt > now);
                var expiredEntries = _calculationCache.Count - activeEntries;

                return new MemoizationStatistics
                {
                    TotalEntries = _calculationCache.Count,
                    ActiveEntries = activeEntries,
                    ExpiredEntries = expiredEntries,
                    CacheExpiryMinutes = (int)_cacheExpiry.TotalMinutes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting memoization statistics");
                return new MemoizationStatistics();
            }
        }

        /// <summary>
        /// Generate cache key for calculation results
        /// </summary>
        private string GenerateCalculationCacheKey(List<TransactionData> transactions)
        {
            // Create a hash of the transaction data for caching
            var keyData = transactions
                .OrderBy(t => t.TransactionId)
                .Select(t => $"{t.TransactionId}:{t.DebitAmount}:{t.CreditAmount}")
                .ToList();

            var combinedKey = string.Join("|", keyData);
            return $"calc:{combinedKey.GetHashCode():X}";
        }

        /// <summary>
        /// Generate cache key for expression results
        /// </summary>
        private string GenerateExpressionCacheKey(List<decimal> values, decimal finalBalance)
        {
            var valuesHash = string.Join(",", values.Take(20)).GetHashCode(); // Limit for performance
            return $"expr:{valuesHash:X}:{finalBalance:0}";
        }

        /// <summary>
        /// Generate cache key for balance computation
        /// </summary>
        private string GenerateBalanceCacheKey(List<decimal> values)
        {
            var valuesHash = string.Join(",", values).GetHashCode();
            return $"balance:{valuesHash:X}";
        }

        /// <summary>
        /// Cleanup expired cache entries
        /// </summary>
        private void CleanupExpiredEntries(object? state)
        {
            try
            {
                var now = DateTime.UtcNow;
                var expiredKeys = _calculationCache
                    .Where(kvp => kvp.Value.ExpiresAt <= now)
                    .Select(kvp => kvp.Key)
                    .ToList();

                foreach (var key in expiredKeys)
                {
                    _calculationCache.TryRemove(key, out _);
                }

                if (expiredKeys.Count > 0)
                {
                    _logger.LogDebug("Cleaned up {Count} expired memoization entries", expiredKeys.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during memoization cache cleanup");
            }
        }

        public void Dispose()
        {
            _cleanupTimer?.Dispose();
        }
    }

    /// <summary>
    /// Cached calculation result
    /// </summary>
    internal class CachedCalculation
    {
        public TrialBalanceCalculation? Result { get; set; }
        public string? Expression { get; set; }
        public decimal FinalBalance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    /// <summary>
    /// Memoization cache statistics
    /// </summary>
    public class MemoizationStatistics
    {
        public int TotalEntries { get; set; }
        public int ActiveEntries { get; set; }
        public int ExpiredEntries { get; set; }
        public int CacheExpiryMinutes { get; set; }
    }
}