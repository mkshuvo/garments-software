using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace GarmentsERP.API.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _configuration;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly int _maxRequestsPerMinute;
        private readonly int _maxRequestsPerHour;
        private readonly int _maxRequestsPerDay;

        public RateLimitingMiddleware(
            RequestDelegate next,
            IMemoryCache cache,
            IConfiguration configuration,
            ILogger<RateLimitingMiddleware> logger)
        {
            _next = next;
            _cache = cache;
            _configuration = configuration;
            _logger = logger;
            
            _maxRequestsPerMinute = _configuration.GetValue<int>("RateLimiting:MaxRequestsPerMinute", 60);
            _maxRequestsPerHour = _configuration.GetValue<int>("RateLimiting:MaxRequestsPerHour", 1000);
            _maxRequestsPerDay = _configuration.GetValue<int>("RateLimiting:MaxRequestsPerDay", 10000);
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var clientIP = GetClientIPAddress(context);
            var endpoint = context.Request.Path.Value ?? "/";

            // Skip rate limiting for health checks and static files
            if (ShouldSkipRateLimiting(endpoint))
            {
                await _next(context);
                return;
            }

            // Check rate limits
            if (!await CheckRateLimits(clientIP, endpoint))
            {
                _logger.LogWarning("Rate limit exceeded for IP: {ClientIP} on endpoint: {Endpoint}", clientIP, endpoint);
                await ReturnRateLimitExceededResponse(context);
                return;
            }

            // Increment request counters
            IncrementRequestCounters(clientIP, endpoint);

            await _next(context);
        }

        private bool ShouldSkipRateLimiting(string endpoint)
        {
            return endpoint.StartsWith("/api/health") ||
                   endpoint.StartsWith("/api/status") ||
                   endpoint.StartsWith("/favicon.ico") ||
                   endpoint.StartsWith("/_next") ||
                   endpoint.StartsWith("/static");
        }

        private async Task<bool> CheckRateLimits(string clientIP, string endpoint)
        {
            var now = DateTime.UtcNow;
            var minuteKey = $"rate_limit_minute_{clientIP}_{endpoint}_{now:yyyyMMddHHmm}";
            var hourKey = $"rate_limit_hour_{clientIP}_{endpoint}_{now:yyyyMMddHH}";
            var dayKey = $"rate_limit_day_{clientIP}_{endpoint}_{now:yyyyMMdd}";

            // Check minute limit
            var minuteCount = await _cache.GetOrCreateAsync(minuteKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(1);
                return Task.FromResult(0);
            });

            if (minuteCount >= _maxRequestsPerMinute)
                return false;

            // Check hour limit
            var hourCount = await _cache.GetOrCreateAsync(hourKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
                return Task.FromResult(0);
            });

            if (hourCount >= _maxRequestsPerHour)
                return false;

            // Check day limit
            var dayCount = await _cache.GetOrCreateAsync(dayKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(1);
                return Task.FromResult(0);
            });

            return dayCount < _maxRequestsPerDay;
        }

        private void IncrementRequestCounters(string clientIP, string endpoint)
        {
            var now = DateTime.UtcNow;
            var minuteKey = $"rate_limit_minute_{clientIP}_{endpoint}_{now:yyyyMMddHHmm}";
            var hourKey = $"rate_limit_hour_{clientIP}_{endpoint}_{now:yyyyMMddHH}";
            var dayKey = $"rate_limit_day_{clientIP}_{endpoint}_{now:yyyyMMdd}";

            // Increment minute counter
            if (_cache.TryGetValue(minuteKey, out int minuteCount))
            {
                _cache.Set(minuteKey, minuteCount + 1, TimeSpan.FromMinutes(1));
            }

            // Increment hour counter
            if (_cache.TryGetValue(hourKey, out int hourCount))
            {
                _cache.Set(hourKey, hourCount + 1, TimeSpan.FromHours(1));
            }

            // Increment day counter
            if (_cache.TryGetValue(dayKey, out int dayCount))
            {
                _cache.Set(dayKey, dayCount + 1, TimeSpan.FromDays(1));
            }
        }

        private string GetClientIPAddress(HttpContext context)
        {
            // Check for forwarded headers (when behind proxy/load balancer)
            var forwardedHeader = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedHeader))
            {
                return forwardedHeader.Split(',')[0].Trim();
            }

            // Check for real IP header
            var realIpHeader = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIpHeader))
            {
                return realIpHeader;
            }

            // Fall back to connection remote IP
            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private async Task ReturnRateLimitExceededResponse(HttpContext context)
        {
            context.Response.StatusCode = 429; // Too Many Requests
            context.Response.ContentType = "application/json";
            context.Response.Headers["Retry-After"] = "60"; // Retry after 1 minute

            var response = new
            {
                Success = false,
                Message = "Rate limit exceeded. Please try again later.",
                Timestamp = DateTime.UtcNow,
                RequestId = context.TraceIdentifier,
                RetryAfter = 60
            };

            var jsonResponse = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(jsonResponse);
        }
    }

    // Extension method for easy middleware registration
    public static class RateLimitingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RateLimitingMiddleware>();
        }
    }
}