using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;

namespace GarmentsERP.API.Middleware
{
    public class IPRestrictionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;
        private readonly ILogger<IPRestrictionMiddleware> _logger;
        private readonly HashSet<string> _allowedIPs;
        private readonly HashSet<string> _blockedIPs;

        public IPRestrictionMiddleware(
            RequestDelegate next,
            IConfiguration configuration,
            ILogger<IPRestrictionMiddleware> logger)
        {
            _next = next;
            _configuration = configuration;
            _logger = logger;
            
            // Load allowed and blocked IPs from configuration
            _allowedIPs = new HashSet<string>(
                _configuration.GetSection("Security:AllowedIPs").Get<string[]>() ?? Array.Empty<string>(),
                StringComparer.OrdinalIgnoreCase);
            
            _blockedIPs = new HashSet<string>(
                _configuration.GetSection("Security:BlockedIPs").Get<string[]>() ?? Array.Empty<string>(),
                StringComparer.OrdinalIgnoreCase);
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var clientIP = GetClientIPAddress(context);
            
            // Log the request for monitoring
            _logger.LogDebug("Request from IP: {ClientIP} to {Path}", clientIP, context.Request.Path);

            // Check if IP is blocked
            if (_blockedIPs.Contains(clientIP))
            {
                _logger.LogWarning("Blocked request from blocked IP: {ClientIP}", clientIP);
                await ReturnAccessDeniedResponse(context, "Access denied - IP address is blocked");
                return;
            }

            // If allowed IPs are configured, check if client IP is in the list
            if (_allowedIPs.Count > 0 && !_allowedIPs.Contains(clientIP))
            {
                _logger.LogWarning("Blocked request from unauthorized IP: {ClientIP}", clientIP);
                await ReturnAccessDeniedResponse(context, "Access denied - IP address not authorized");
                return;
            }

            // Add IP address to context for audit logging
            context.Items["ClientIP"] = clientIP;

            await _next(context);
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

            // Check for CF-Connecting-IP (Cloudflare)
            var cfConnectingIP = context.Request.Headers["CF-Connecting-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(cfConnectingIP))
            {
                return cfConnectingIP;
            }

            // Fall back to connection remote IP
            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private async Task ReturnAccessDeniedResponse(HttpContext context, string message)
        {
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            context.Response.ContentType = "application/json";

            var response = new
            {
                Success = false,
                Message = message,
                Timestamp = DateTime.UtcNow,
                RequestId = context.TraceIdentifier
            };

            var jsonResponse = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(jsonResponse);
        }
    }

    // Extension method for easy middleware registration
    public static class IPRestrictionMiddlewareExtensions
    {
        public static IApplicationBuilder UseIPRestriction(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<IPRestrictionMiddleware>();
        }
    }
}
