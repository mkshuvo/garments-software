using GarmentsERP.API.Interfaces;
using System.Net;
using System.Text.Json;

namespace GarmentsERP.API.Middleware
{
    /// <summary>
    /// Middleware for implementing rate limiting on API endpoints
    /// </summary>
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;

        // Rate limiting configuration for different endpoints
        private readonly Dictionary<string, RateLimitConfig> _endpointConfigs = new()
        {
            { "/api/trial-balance", new RateLimitConfig { MaxRequests = 30, TimeWindow = TimeSpan.FromMinutes(1) } },
            { "/api/trial-balance/account", new RateLimitConfig { MaxRequests = 60, TimeWindow = TimeSpan.FromMinutes(1) } },
            { "/api/trial-balance/compare", new RateLimitConfig { MaxRequests = 10, TimeWindow = TimeSpan.FromMinutes(1) } },
            { "/api/trial-balance/export", new RateLimitConfig { MaxRequests = 5, TimeWindow = TimeSpan.FromMinutes(1) } }
        };

        public RateLimitingMiddleware(
            RequestDelegate next,
            ILogger<RateLimitingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only apply rate limiting to trial balance endpoints
            if (!ShouldApplyRateLimit(context.Request.Path))
            {
                await _next(context);
                return;
            }

            var clientId = GetClientIdentifier(context);
            var endpoint = GetEndpointKey(context.Request.Path);
            var config = GetRateLimitConfig(endpoint);

            try
            {
                // Get the scoped service from the request's service provider
                var rateLimitingService = context.RequestServices.GetRequiredService<IRateLimitingService>();
                var rateLimitInfo = await rateLimitingService.GetRateLimitInfoAsync(
                    clientId, endpoint, config.MaxRequests, config.TimeWindow);

                // Add rate limit headers
                context.Response.Headers["X-RateLimit-Limit"] = config.MaxRequests.ToString();
                context.Response.Headers["X-RateLimit-Remaining"] = rateLimitInfo.RemainingRequests.ToString();
                context.Response.Headers["X-RateLimit-Reset"] = ((DateTimeOffset)rateLimitInfo.WindowEnd).ToUnixTimeSeconds().ToString();

                if (!rateLimitInfo.IsAllowed)
                {
                    _logger.LogWarning("Rate limit exceeded for client {ClientId} on endpoint {Endpoint}. " +
                                     "Requests: {CurrentRequests}/{MaxRequests}", 
                                     clientId, endpoint, rateLimitInfo.MaxRequests - rateLimitInfo.RemainingRequests, rateLimitInfo.MaxRequests);

                    context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                    context.Response.ContentType = "application/json";

                    var errorResponse = new
                    {
                        success = false,
                        message = "Rate limit exceeded. Please try again later.",
                        errorCode = "RATE_LIMIT_EXCEEDED",
                        details = new
                        {
                            maxRequests = rateLimitInfo.MaxRequests,
                            remainingRequests = rateLimitInfo.RemainingRequests,
                            resetTime = rateLimitInfo.WindowEnd,
                            retryAfterSeconds = (int)(rateLimitInfo.WindowEnd - DateTime.UtcNow).TotalSeconds
                        }
                    };

                    await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                    return;
                }

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in rate limiting middleware for client {ClientId} and endpoint {Endpoint}", 
                    clientId, endpoint);
                
                // Continue processing the request if rate limiting fails
                await _next(context);
            }
        }

        private bool ShouldApplyRateLimit(string path)
        {
            return path.StartsWith("/api/trial-balance", StringComparison.OrdinalIgnoreCase);
        }

        private string GetClientIdentifier(HttpContext context)
        {
            // Try to get user ID from claims first
            var userId = context.User?.FindFirst("sub")?.Value ?? 
                        context.User?.FindFirst("id")?.Value ?? 
                        context.User?.FindFirst("userId")?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                return $"user:{userId}";
            }

            // Fall back to IP address
            var ipAddress = GetClientIpAddress(context);
            return $"ip:{ipAddress}";
        }

        private string GetClientIpAddress(HttpContext context)
        {
            // Check for forwarded IP addresses (common in load balancer scenarios)
            var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                var ips = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries);
                if (ips.Length > 0)
                {
                    return ips[0].Trim();
                }
            }

            var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
            {
                return realIp;
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        }

        private string GetEndpointKey(string path)
        {
            // Normalize the path to match our configuration keys
            var normalizedPath = path.ToLowerInvariant();

            if (normalizedPath.StartsWith("/api/trial-balance/account"))
                return "/api/trial-balance/account";
            
            if (normalizedPath.StartsWith("/api/trial-balance/compare"))
                return "/api/trial-balance/compare";
            
            if (normalizedPath.Contains("export"))
                return "/api/trial-balance/export";
            
            if (normalizedPath.StartsWith("/api/trial-balance"))
                return "/api/trial-balance";

            return normalizedPath;
        }

        private RateLimitConfig GetRateLimitConfig(string endpoint)
        {
            return _endpointConfigs.TryGetValue(endpoint, out var config) 
                ? config 
                : new RateLimitConfig { MaxRequests = 20, TimeWindow = TimeSpan.FromMinutes(1) }; // Default config
        }

        private class RateLimitConfig
        {
            public int MaxRequests { get; set; }
            public TimeSpan TimeWindow { get; set; }
        }
    }
}