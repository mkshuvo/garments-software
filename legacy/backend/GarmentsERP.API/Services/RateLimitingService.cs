using GarmentsERP.API.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for implementing rate limiting using Redis distributed cache
    /// </summary>
    public class RateLimitingService : IRateLimitingService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<RateLimitingService> _logger;
        private readonly TimeSpan _defaultTimeWindow = TimeSpan.FromMinutes(1);

        public RateLimitingService(
            IDistributedCache cache,
            ILogger<RateLimitingService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        public async Task<bool> IsRequestAllowedAsync(string clientId, string endpoint, int maxRequests = 10, TimeSpan? timeWindow = null)
        {
            try
            {
                var rateLimitInfo = await GetRateLimitInfoAsync(clientId, endpoint, maxRequests, timeWindow);
                return rateLimitInfo.IsAllowed;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking rate limit for client {ClientId} and endpoint {Endpoint}", clientId, endpoint);
                // In case of error, allow the request to prevent blocking legitimate users
                return true;
            }
        }

        public async Task<int> GetRemainingRequestsAsync(string clientId, string endpoint, int maxRequests = 10, TimeSpan? timeWindow = null)
        {
            try
            {
                var rateLimitInfo = await GetRateLimitInfoAsync(clientId, endpoint, maxRequests, timeWindow);
                return rateLimitInfo.RemainingRequests;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting remaining requests for client {ClientId} and endpoint {Endpoint}", clientId, endpoint);
                return maxRequests; // Return max requests in case of error
            }
        }

        public async Task ResetRateLimitAsync(string clientId, string endpoint)
        {
            try
            {
                var key = GetRateLimitKey(clientId, endpoint);
                await _cache.RemoveAsync(key);
                _logger.LogInformation("Rate limit reset for client {ClientId} and endpoint {Endpoint}", clientId, endpoint);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting rate limit for client {ClientId} and endpoint {Endpoint}", clientId, endpoint);
            }
        }

        public async Task<RateLimitInfo> GetRateLimitInfoAsync(string clientId, string endpoint, int maxRequests = 10, TimeSpan? timeWindow = null)
        {
            var window = timeWindow ?? _defaultTimeWindow;
            var key = GetRateLimitKey(clientId, endpoint);
            var now = DateTime.UtcNow;
            var windowStart = now.Subtract(window);

            try
            {
                var cachedDataJson = await _cache.GetStringAsync(key);
                RateLimitData rateLimitData;

                if (string.IsNullOrEmpty(cachedDataJson))
                {
                    // First request in the window
                    rateLimitData = new RateLimitData
                    {
                        Requests = new List<DateTime> { now },
                        WindowStart = now
                    };
                }
                else
                {
                    rateLimitData = JsonSerializer.Deserialize<RateLimitData>(cachedDataJson) ?? new RateLimitData();
                    
                    // Remove requests outside the current window
                    rateLimitData.Requests = rateLimitData.Requests
                        .Where(requestTime => requestTime > windowStart)
                        .ToList();

                    // Add current request
                    rateLimitData.Requests.Add(now);
                    rateLimitData.WindowStart = windowStart;
                }

                // Update cache
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = window.Add(TimeSpan.FromMinutes(1)) // Add buffer
                };

                await _cache.SetStringAsync(key, JsonSerializer.Serialize(rateLimitData), options);

                var currentRequests = rateLimitData.Requests.Count;
                var remainingRequests = Math.Max(0, maxRequests - currentRequests);
                var isAllowed = currentRequests <= maxRequests;

                return new RateLimitInfo
                {
                    MaxRequests = maxRequests,
                    RemainingRequests = remainingRequests,
                    WindowStart = windowStart,
                    WindowEnd = now.Add(window),
                    TimeWindow = window,
                    IsAllowed = isAllowed
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting rate limit info for client {ClientId} and endpoint {Endpoint}", clientId, endpoint);
                
                // Return permissive rate limit info in case of error
                return new RateLimitInfo
                {
                    MaxRequests = maxRequests,
                    RemainingRequests = maxRequests,
                    WindowStart = windowStart,
                    WindowEnd = now.Add(window),
                    TimeWindow = window,
                    IsAllowed = true
                };
            }
        }

        private static string GetRateLimitKey(string clientId, string endpoint)
        {
            // Sanitize inputs to prevent cache key injection
            var sanitizedClientId = SanitizeForCacheKey(clientId);
            var sanitizedEndpoint = SanitizeForCacheKey(endpoint);
            return $"rate_limit:{sanitizedClientId}:{sanitizedEndpoint}";
        }

        private static string SanitizeForCacheKey(string input)
        {
            if (string.IsNullOrEmpty(input))
                return "unknown";

            // Remove or replace characters that could cause issues in cache keys
            return input
                .Replace(":", "_")
                .Replace(" ", "_")
                .Replace("/", "_")
                .Replace("\\", "_")
                .Replace("?", "_")
                .Replace("&", "_")
                .Replace("=", "_")
                .Replace("#", "_")
                .Replace("%", "_");
        }

        private class RateLimitData
        {
            public List<DateTime> Requests { get; set; } = new();
            public DateTime WindowStart { get; set; }
        }
    }
}