namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Interface for rate limiting service
    /// </summary>
    public interface IRateLimitingService
    {
        /// <summary>
        /// Check if the request is allowed based on rate limiting rules
        /// </summary>
        Task<bool> IsRequestAllowedAsync(string clientId, string endpoint, int maxRequests = 10, TimeSpan? timeWindow = null);

        /// <summary>
        /// Get remaining requests for a client and endpoint
        /// </summary>
        Task<int> GetRemainingRequestsAsync(string clientId, string endpoint, int maxRequests = 10, TimeSpan? timeWindow = null);

        /// <summary>
        /// Reset rate limit for a specific client and endpoint
        /// </summary>
        Task ResetRateLimitAsync(string clientId, string endpoint);

        /// <summary>
        /// Get rate limit information for a client and endpoint
        /// </summary>
        Task<RateLimitInfo> GetRateLimitInfoAsync(string clientId, string endpoint, int maxRequests = 10, TimeSpan? timeWindow = null);
    }

    /// <summary>
    /// Rate limit information
    /// </summary>
    public class RateLimitInfo
    {
        public int MaxRequests { get; set; }
        public int RemainingRequests { get; set; }
        public DateTime WindowStart { get; set; }
        public DateTime WindowEnd { get; set; }
        public TimeSpan TimeWindow { get; set; }
        public bool IsAllowed { get; set; }
    }
}