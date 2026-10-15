using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Audit;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace GarmentsERP.API.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<AuditLogService> _logger;

        public AuditLogService(
            ApplicationDbContext context,
            IHttpContextAccessor httpContextAccessor,
            ILogger<AuditLogService> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task LogAuditEventAsync(AuditLogEntry auditLog)
        {
            try
            {
                // Enrich audit log with HTTP context information
                EnrichAuditLogWithHttpContext(auditLog);

                _context.AuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Audit log created: {Operation} on {ResourceType} by {UserId}", 
                    auditLog.Operation, auditLog.ResourceType, auditLog.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating audit log");
                // Don't throw - audit logging should not break the main operation
            }
        }

        public async Task LogJournalEntryOperationAsync(
            string operation,
            Guid? entryId,
            string userId,
            string details,
            bool success = true,
            string? errorMessage = null)
        {
            var auditLog = new AuditLogEntry
            {
                Operation = operation,
                ResourceType = "JournalEntry",
                ResourceId = entryId,
                UserId = userId,
                Details = details,
                Success = success,
                ErrorMessage = errorMessage,
                Module = "Accounting",
                SubModule = "JournalEntry"
            };

            await LogAuditEventAsync(auditLog);
        }

        public async Task LogCashBookEntryOperationAsync(
            string operation,
            Guid? entryId,
            string userId,
            string details,
            bool success = true,
            string? errorMessage = null)
        {
            var auditLog = new AuditLogEntry
            {
                Operation = operation,
                ResourceType = "CashBookEntry",
                ResourceId = entryId,
                UserId = userId,
                Details = details,
                Success = success,
                ErrorMessage = errorMessage,
                Module = "Accounting",
                SubModule = "CashBookEntry"
            };

            await LogAuditEventAsync(auditLog);
        }

        public async Task<IEnumerable<AuditLogEntry>> GetUserAuditLogsAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.AuditLogs
                .Where(log => log.UserId == userId);

            if (fromDate.HasValue)
                query = query.Where(log => log.Timestamp >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(log => log.Timestamp <= toDate.Value);

            return await query.OrderByDescending(log => log.Timestamp).ToListAsync();
        }

        public async Task<IEnumerable<AuditLogEntry>> GetResourceAuditLogsAsync(string resourceType, Guid resourceId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = _context.AuditLogs
                .Where(log => log.ResourceType == resourceType && log.ResourceId == resourceId);

            if (fromDate.HasValue)
                query = query.Where(log => log.Timestamp >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(log => log.Timestamp <= toDate.Value);

            return await query.OrderByDescending(log => log.Timestamp).ToListAsync();
        }

        public async Task<IEnumerable<AuditLogEntry>> GetAuditLogsByDateRangeAsync(DateTime fromDate, DateTime toDate, string? resourceType = null)
        {
            var query = _context.AuditLogs
                .Where(log => log.Timestamp >= fromDate && log.Timestamp <= toDate);

            if (!string.IsNullOrEmpty(resourceType))
                query = query.Where(log => log.ResourceType == resourceType);

            return await query.OrderByDescending(log => log.Timestamp).ToListAsync();
        }

        public async Task<IEnumerable<AuditLogEntry>> GetComplianceAuditLogsAsync(DateTime fromDate, DateTime toDate, string[] resourceTypes)
        {
            return await _context.AuditLogs
                .Where(log => log.Timestamp >= fromDate && 
                             log.Timestamp <= toDate && 
                             resourceTypes.Contains(log.ResourceType))
                .OrderByDescending(log => log.Timestamp)
                .ToListAsync();
        }

        private void EnrichAuditLogWithHttpContext(AuditLogEntry auditLog)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null) return;

            // Get IP address
            auditLog.IPAddress = GetClientIPAddress(httpContext);

            // Get user agent
            auditLog.UserAgent = httpContext.Request.Headers["User-Agent"].FirstOrDefault();

            // Get session ID
            auditLog.SessionId = httpContext.Session.Id;

            // Get request ID for correlation
            if (httpContext.Request.Headers.TryGetValue("X-Request-ID", out var requestId))
            {
                auditLog.RequestId = requestId.FirstOrDefault();
            }

            // Get user information from claims
            var user = httpContext.User;
            if (user.Identity?.IsAuthenticated == true)
            {
                var nameClaim = user.FindFirst(ClaimTypes.Name);
                var emailClaim = user.FindFirst(ClaimTypes.Email);

                if (nameClaim != null)
                    auditLog.UserName = nameClaim.Value;

                if (emailClaim != null)
                    auditLog.UserEmail = emailClaim.Value;
            }
        }

        private string? GetClientIPAddress(HttpContext httpContext)
        {
            // Check for forwarded headers (when behind proxy/load balancer)
            var forwardedHeader = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedHeader))
            {
                return forwardedHeader.Split(',')[0].Trim();
            }

            // Check for real IP header
            var realIpHeader = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIpHeader))
            {
                return realIpHeader;
            }

            // Fall back to connection remote IP
            return httpContext.Connection.RemoteIpAddress?.ToString();
        }
    }
}
