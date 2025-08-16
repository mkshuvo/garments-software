using GarmentsERP.API.Models;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Interface for trial balance audit logging service
    /// </summary>
    public interface ITrialBalanceAuditService
    {
        /// <summary>
        /// Log trial balance generation activity
        /// </summary>
        Task LogTrialBalanceGenerationAsync(
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
            int executionTimeMs = 0);

        /// <summary>
        /// Log trial balance export activity
        /// </summary>
        Task LogTrialBalanceExportAsync(
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
            int executionTimeMs = 0);

        /// <summary>
        /// Log trial balance comparison activity
        /// </summary>
        Task LogTrialBalanceComparisonAsync(
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
            int executionTimeMs = 0);

        /// <summary>
        /// Log account drill-down activity
        /// </summary>
        Task LogAccountDrillDownAsync(
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
            int executionTimeMs = 0);

        /// <summary>
        /// Get audit logs for a specific user
        /// </summary>
        Task<List<TrialBalanceAuditLog>> GetUserAuditLogsAsync(string userId, int pageSize = 50, int pageNumber = 1);

        /// <summary>
        /// Get audit logs for a specific date range
        /// </summary>
        Task<List<TrialBalanceAuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate, int pageSize = 50, int pageNumber = 1);

        /// <summary>
        /// Get audit logs for a specific action type
        /// </summary>
        Task<List<TrialBalanceAuditLog>> GetAuditLogsByActionAsync(string action, int pageSize = 50, int pageNumber = 1);

        /// <summary>
        /// Clean up old audit logs (older than specified days)
        /// </summary>
        Task CleanupOldAuditLogsAsync(int retentionDays = 365);
    }
}