using GarmentsERP.API.Models.Audit;

namespace GarmentsERP.API.Interfaces
{
    public interface IAuditLogService
    {
        /// <summary>
        /// Log an audit event
        /// </summary>
        Task LogAuditEventAsync(AuditLogEntry auditLog);

        /// <summary>
        /// Log a journal entry operation
        /// </summary>
        Task LogJournalEntryOperationAsync(
            string operation,
            Guid? entryId,
            string userId,
            string details,
            bool success = true,
            string? errorMessage = null);

        /// <summary>
        /// Log a cash book entry operation
        /// </summary>
        Task LogCashBookEntryOperationAsync(
            string operation,
            Guid? entryId,
            string userId,
            string details,
            bool success = true,
            string? errorMessage = null);

        /// <summary>
        /// Get audit logs for a specific user
        /// </summary>
        Task<IEnumerable<AuditLogEntry>> GetUserAuditLogsAsync(string userId, DateTime? fromDate = null, DateTime? toDate = null);

        /// <summary>
        /// Get audit logs for a specific resource
        /// </summary>
        Task<IEnumerable<AuditLogEntry>> GetResourceAuditLogsAsync(string resourceType, Guid resourceId, DateTime? fromDate = null, DateTime? toDate = null);

        /// <summary>
        /// Get audit logs for a specific time period
        /// </summary>
        Task<IEnumerable<AuditLogEntry>> GetAuditLogsByDateRangeAsync(DateTime fromDate, DateTime toDate, string? resourceType = null);

        /// <summary>
        /// Get audit logs for compliance reporting
        /// </summary>
        Task<IEnumerable<AuditLogEntry>> GetComplianceAuditLogsAsync(DateTime fromDate, DateTime toDate, string[] resourceTypes);
    }
}
