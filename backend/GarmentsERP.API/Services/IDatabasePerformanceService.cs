using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using System.Diagnostics;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for monitoring and optimizing database performance
    /// </summary>
    public interface IDatabasePerformanceService
    {
        /// <summary>
        /// Get database performance metrics
        /// </summary>
        Task<DatabasePerformanceMetrics> GetPerformanceMetricsAsync();

        /// <summary>
        /// Optimize database queries for journal entries
        /// </summary>
        Task<QueryOptimizationResult> OptimizeJournalEntryQueriesAsync();

        /// <summary>
        /// Check index usage and performance
        /// </summary>
        Task<IndexPerformanceReport> GetIndexPerformanceReportAsync();

        /// <summary>
        /// Run database maintenance tasks
        /// </summary>
        Task<MaintenanceResult> RunMaintenanceAsync();
    }
}
