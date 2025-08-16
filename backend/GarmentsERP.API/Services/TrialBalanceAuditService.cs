using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for trial balance audit logging
    /// </summary>
    public class TrialBalanceAuditService : ITrialBalanceAuditService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TrialBalanceAuditService> _logger;

        public TrialBalanceAuditService(
            ApplicationDbContext context,
            ILogger<TrialBalanceAuditService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task LogTrialBalanceGenerationAsync(
            string userId,
            string userName,
            string userRole,
            DateTime startDate,
            DateTime endDate,
            string requestId,
            string ipAddress,
            string userAgent,
            int? transactionCount = null,
            decimal? finalBalance = null,
            string? additionalData = null,
            string? errorMessage = null,
            bool isSuccess = true,
            int executionTimeMs = 0)
        {
            try
            {
                var auditLog = new TrialBalanceAuditLog
                {
                    Action = "GENERATE",
                    UserId = SanitizeInput(userId),
                    UserName = SanitizeInput(userName),
                    UserRole = SanitizeInput(userRole),
                    StartDate = startDate,
                    EndDate = endDate,
                    RequestId = SanitizeInput(requestId),
                    IpAddress = SanitizeInput(ipAddress),
                    UserAgent = SanitizeInput(userAgent, 500),
                    TransactionCount = transactionCount,
                    FinalBalance = finalBalance,
                    AdditionalData = SanitizeInput(additionalData, 2000),
                    ErrorMessage = SanitizeInput(errorMessage, 500),
                    IsSuccess = isSuccess,
                    ExecutionTimeMs = executionTimeMs,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TrialBalanceAuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Trial balance generation audit logged for user {UserId} with request {RequestId}", 
                    userId, requestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log trial balance generation audit for user {UserId}", userId);
                // Don't throw - audit logging should not break the main functionality
            }
        }

        public async Task LogTrialBalanceExportAsync(
            string userId,
            string userName,
            string userRole,
            DateTime startDate,
            DateTime endDate,
            string exportFormat,
            string requestId,
            string ipAddress,
            string userAgent,
            string? errorMessage = null,
            bool isSuccess = true,
            int executionTimeMs = 0)
        {
            try
            {
                var auditLog = new TrialBalanceAuditLog
                {
                    Action = $"EXPORT_{exportFormat.ToUpper()}",
                    UserId = SanitizeInput(userId),
                    UserName = SanitizeInput(userName),
                    UserRole = SanitizeInput(userRole),
                    StartDate = startDate,
                    EndDate = endDate,
                    ExportFormat = SanitizeInput(exportFormat),
                    RequestId = SanitizeInput(requestId),
                    IpAddress = SanitizeInput(ipAddress),
                    UserAgent = SanitizeInput(userAgent, 500),
                    ErrorMessage = SanitizeInput(errorMessage, 500),
                    IsSuccess = isSuccess,
                    ExecutionTimeMs = executionTimeMs,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TrialBalanceAuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Trial balance export audit logged for user {UserId} with format {ExportFormat}", 
                    userId, exportFormat);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log trial balance export audit for user {UserId}", userId);
            }
        }

        public async Task LogTrialBalanceComparisonAsync(
            string userId,
            string userName,
            string userRole,
            DateTime period1Start,
            DateTime period1End,
            DateTime period2Start,
            DateTime period2End,
            string requestId,
            string ipAddress,
            string userAgent,
            string? additionalData = null,
            string? errorMessage = null,
            bool isSuccess = true,
            int executionTimeMs = 0)
        {
            try
            {
                var auditLog = new TrialBalanceAuditLog
                {
                    Action = "COMPARE",
                    UserId = SanitizeInput(userId),
                    UserName = SanitizeInput(userName),
                    UserRole = SanitizeInput(userRole),
                    StartDate = period1Start,
                    EndDate = period1End,
                    RequestId = SanitizeInput(requestId),
                    IpAddress = SanitizeInput(ipAddress),
                    UserAgent = SanitizeInput(userAgent, 500),
                    AdditionalData = SanitizeInput($"Period2: {period2Start:yyyy-MM-dd} to {period2End:yyyy-MM-dd}. {additionalData}", 2000),
                    ErrorMessage = SanitizeInput(errorMessage, 500),
                    IsSuccess = isSuccess,
                    ExecutionTimeMs = executionTimeMs,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TrialBalanceAuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Trial balance comparison audit logged for user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log trial balance comparison audit for user {UserId}", userId);
            }
        }

        public async Task LogAccountDrillDownAsync(
            string userId,
            string userName,
            string userRole,
            Guid accountId,
            DateTime startDate,
            DateTime endDate,
            string requestId,
            string ipAddress,
            string userAgent,
            int? transactionCount = null,
            string? errorMessage = null,
            bool isSuccess = true,
            int executionTimeMs = 0)
        {
            try
            {
                var auditLog = new TrialBalanceAuditLog
                {
                    Action = "VIEW_ACCOUNT_DETAILS",
                    UserId = SanitizeInput(userId),
                    UserName = SanitizeInput(userName),
                    UserRole = SanitizeInput(userRole),
                    StartDate = startDate,
                    EndDate = endDate,
                    AccountId = accountId,
                    RequestId = SanitizeInput(requestId),
                    IpAddress = SanitizeInput(ipAddress),
                    UserAgent = SanitizeInput(userAgent, 500),
                    TransactionCount = transactionCount,
                    ErrorMessage = SanitizeInput(errorMessage, 500),
                    IsSuccess = isSuccess,
                    ExecutionTimeMs = executionTimeMs,
                    CreatedAt = DateTime.UtcNow
                };

                _context.TrialBalanceAuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Account drill-down audit logged for user {UserId} and account {AccountId}", 
                    userId, accountId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log account drill-down audit for user {UserId}", userId);
            }
        }

        public async Task<List<TrialBalanceAuditLog>> GetUserAuditLogsAsync(string userId, int pageSize = 50, int pageNumber = 1)
        {
            try
            {
                return await _context.TrialBalanceAuditLogs
                    .Where(log => log.UserId == userId)
                    .OrderByDescending(log => log.CreatedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve audit logs for user {UserId}", userId);
                return new List<TrialBalanceAuditLog>();
            }
        }

        public async Task<List<TrialBalanceAuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate, int pageSize = 50, int pageNumber = 1)
        {
            try
            {
                return await _context.TrialBalanceAuditLogs
                    .Where(log => log.CreatedAt >= startDate && log.CreatedAt <= endDate)
                    .OrderByDescending(log => log.CreatedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve audit logs for date range {StartDate} to {EndDate}", startDate, endDate);
                return new List<TrialBalanceAuditLog>();
            }
        }

        public async Task<List<TrialBalanceAuditLog>> GetAuditLogsByActionAsync(string action, int pageSize = 50, int pageNumber = 1)
        {
            try
            {
                return await _context.TrialBalanceAuditLogs
                    .Where(log => log.Action == action)
                    .OrderByDescending(log => log.CreatedAt)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve audit logs for action {Action}", action);
                return new List<TrialBalanceAuditLog>();
            }
        }

        public async Task CleanupOldAuditLogsAsync(int retentionDays = 365)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
                var oldLogs = await _context.TrialBalanceAuditLogs
                    .Where(log => log.CreatedAt < cutoffDate)
                    .ToListAsync();

                if (oldLogs.Any())
                {
                    _context.TrialBalanceAuditLogs.RemoveRange(oldLogs);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Cleaned up {Count} old audit logs older than {CutoffDate}", 
                        oldLogs.Count, cutoffDate);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cleanup old audit logs");
            }
        }

        /// <summary>
        /// Sanitize input to prevent injection attacks and ensure data integrity
        /// </summary>
        private static string SanitizeInput(string? input, int maxLength = 100)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            // Remove potentially dangerous characters
            var sanitized = input
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;")
                .Replace("'", "&#x27;")
                .Replace("/", "&#x2F;")
                .Replace("\\", "&#x5C;")
                .Replace("&", "&amp;");

            // Truncate if too long
            if (sanitized.Length > maxLength)
            {
                sanitized = sanitized.Substring(0, maxLength);
            }

            return sanitized;
        }
    }
}