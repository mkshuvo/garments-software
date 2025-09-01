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

    /// <summary>
    /// Implementation of database performance service
    /// </summary>
    public class DatabasePerformanceService : IDatabasePerformanceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DatabasePerformanceService> _logger;

        public DatabasePerformanceService(
            ApplicationDbContext context,
            ILogger<DatabasePerformanceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Get database performance metrics
        /// </summary>
        public async Task<DatabasePerformanceMetrics> GetPerformanceMetricsAsync()
        {
            var stopwatch = Stopwatch.StartNew();
            var metrics = new DatabasePerformanceMetrics();

            try
            {
                // Test journal entry query performance
                var journalEntryQueryTime = await MeasureQueryTimeAsync(async () =>
                {
                    return await _context.JournalEntries
                        .Include(je => je.JournalEntryLines)
                        .Where(je => je.TransactionDate >= DateTime.Today.AddDays(-30))
                        .OrderByDescending(je => je.TransactionDate)
                        .Take(100)
                        .ToListAsync();
                });

                metrics.JournalEntryQueryTime = journalEntryQueryTime;

                // Test statistics query performance
                var statisticsQueryTime = await MeasureQueryTimeAsync(async () =>
                {
                    return await _context.JournalEntries
                        .Where(je => je.TransactionDate >= DateTime.Today.AddDays(-90))
                        .GroupBy(je => new { je.TransactionDate.Year, je.TransactionDate.Month })
                        .Select(g => new
                        {
                            Year = g.Key.Year,
                            Month = g.Key.Month,
                            Count = g.Count(),
                            TotalDebit = g.Sum(je => je.TotalDebit),
                            TotalCredit = g.Sum(je => je.TotalCredit)
                        })
                        .ToListAsync();
                });

                metrics.StatisticsQueryTime = statisticsQueryTime;

                // Test search query performance
                var searchQueryTime = await MeasureQueryTimeAsync(async () =>
                {
                    return await _context.JournalEntries
                        .Where(je => (je.ReferenceNumber != null && je.ReferenceNumber.Contains("TEST")) || 
                                    (je.Description != null && je.Description.Contains("TEST")))
                        .Take(50)
                        .ToListAsync();
                });

                metrics.SearchQueryTime = searchQueryTime;

                // Get connection pool statistics
                metrics.ConnectionPoolSize = _context.Database.ProviderName ?? "Unknown";
                metrics.ActiveConnections = await GetActiveConnectionCountAsync();

                stopwatch.Stop();
                metrics.TotalExecutionTime = stopwatch.ElapsedMilliseconds;

                _logger.LogInformation("Database performance metrics collected successfully in {Time}ms", 
                    metrics.TotalExecutionTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error collecting database performance metrics");
                metrics.HasErrors = true;
                metrics.ErrorMessage = ex.Message;
            }

            return metrics;
        }

        /// <summary>
        /// Optimize database queries for journal entries
        /// </summary>
        public async Task<QueryOptimizationResult> OptimizeJournalEntryQueriesAsync()
        {
            var result = new QueryOptimizationResult();
            var stopwatch = Stopwatch.StartNew();

            try
            {
                // Check if indexes exist
                var indexExists = await CheckIndexesExistAsync();
                if (!indexExists)
                {
                    result.Recommendations.Add("Create database indexes for optimal performance");
                    result.Recommendations.Add("Run the CreateJournalEntryIndexes.sql script");
                }

                // Check query execution plans
                var executionPlan = await AnalyzeQueryExecutionPlanAsync();
                result.ExecutionPlanAnalysis = executionPlan;

                // Check for N+1 query problems
                var nPlusOneDetected = await DetectNPlusOneQueriesAsync();
                if (nPlusOneDetected)
                {
                    result.Recommendations.Add("Use Include() to avoid N+1 query problems");
                    result.Recommendations.Add("Consider using projection DTOs for better performance");
                }

                // Check for missing includes
                var missingIncludes = await CheckMissingIncludesAsync();
                result.Recommendations.AddRange(missingIncludes);

                stopwatch.Stop();
                result.OptimizationTime = stopwatch.ElapsedMilliseconds;

                _logger.LogInformation("Query optimization completed in {Time}ms", result.OptimizationTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during query optimization");
                result.HasErrors = true;
                result.ErrorMessage = ex.Message;
            }

            return result;
        }

        /// <summary>
        /// Check index usage and performance
        /// </summary>
        public async Task<IndexPerformanceReport> GetIndexPerformanceReportAsync()
        {
            var report = new IndexPerformanceReport();

            try
            {
                // Get index usage statistics from PostgreSQL
                var indexStats = await GetIndexUsageStatisticsAsync();
                report.IndexUsageStatistics = indexStats;

                // Check for unused indexes
                var unusedIndexes = await FindUnusedIndexesAsync();
                report.UnusedIndexes = unusedIndexes;

                // Check for missing indexes
                var missingIndexes = await FindMissingIndexesAsync();
                report.MissingIndexes = missingIndexes;

                // Get index fragmentation info
                var fragmentationInfo = await GetIndexFragmentationInfoAsync();
                report.FragmentationInfo = fragmentationInfo;

                _logger.LogInformation("Index performance report generated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating index performance report");
                report.HasErrors = true;
                report.ErrorMessage = ex.Message;
            }

            return report;
        }

        /// <summary>
        /// Run database maintenance tasks
        /// </summary>
        public async Task<MaintenanceResult> RunMaintenanceAsync()
        {
            var result = new MaintenanceResult();
            var stopwatch = Stopwatch.StartNew();

            try
            {
                // Update table statistics
                await _context.Database.ExecuteSqlRawAsync("ANALYZE \"JournalEntries\"");
                await _context.Database.ExecuteSqlRawAsync("ANALYZE \"JournalEntryLines\"");
                result.TasksCompleted.Add("Updated table statistics");

                // Vacuum tables
                await _context.Database.ExecuteSqlRawAsync("VACUUM ANALYZE \"JournalEntries\"");
                await _context.Database.ExecuteSqlRawAsync("VACUUM ANALYZE \"JournalEntryLines\"");
                result.TasksCompleted.Add("Vacuumed tables");

                // Check for table bloat
                var bloatInfo = await CheckTableBloatAsync();
                result.BloatInformation = bloatInfo;

                stopwatch.Stop();
                result.MaintenanceTime = stopwatch.ElapsedMilliseconds;

                _logger.LogInformation("Database maintenance completed in {Time}ms", result.MaintenanceTime);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database maintenance");
                result.HasErrors = true;
                result.ErrorMessage = ex.Message;
            }

            return result;
        }

        #region Private Helper Methods

        private async Task<long> MeasureQueryTimeAsync<T>(Func<Task<T>> query)
        {
            var stopwatch = Stopwatch.StartNew();
            await query();
            stopwatch.Stop();
            return stopwatch.ElapsedMilliseconds;
        }

        private async Task<bool> CheckIndexesExistAsync()
        {
            try
            {
                var indexCount = await _context.Database.SqlQueryRaw<int>(
                    "SELECT COUNT(*) FROM pg_indexes WHERE tablename IN ('JournalEntries', 'JournalEntryLines')")
                    .FirstOrDefaultAsync();
                return indexCount > 0;
            }
            catch
            {
                return false;
            }
        }

        private async Task<string> AnalyzeQueryExecutionPlanAsync()
        {
            try
            {
                var plan = await _context.Database.SqlQueryRaw<string>(
                    "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM \"JournalEntries\" LIMIT 1")
                    .FirstOrDefaultAsync();
                return plan ?? "Unable to analyze execution plan";
            }
            catch
            {
                return "Error analyzing execution plan";
            }
        }

        private Task<bool> DetectNPlusOneQueriesAsync()
        {
            // This is a simplified check - in production, you'd use more sophisticated monitoring
            return Task.FromResult(false);
        }

        private async Task<List<string>> CheckMissingIncludesAsync()
        {
            var recommendations = new List<string>();
            
            // Check if common queries are missing includes
            try
            {
                var queryWithoutInclude = await _context.JournalEntries
                    .Where(je => je.Status == Models.Accounting.JournalStatus.Posted)
                    .Take(1)
                    .ToListAsync();

                if (queryWithoutInclude.Any() && queryWithoutInclude.First().JournalEntryLines == null)
                {
                    recommendations.Add("Consider using Include(je => je.JournalEntryLines) for related data");
                }
            }
            catch
            {
                // Ignore errors in this diagnostic method
            }

            return recommendations;
        }

        private async Task<int> GetActiveConnectionCountAsync()
        {
            try
            {
                var connectionCount = await _context.Database.SqlQueryRaw<int>(
                    "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'")
                    .FirstOrDefaultAsync();
                return connectionCount;
            }
            catch
            {
                return 0;
            }
        }

        private async Task<Dictionary<string, object>> GetIndexUsageStatisticsAsync()
        {
            try
            {
                var stats = await _context.Database.SqlQueryRaw<dynamic>(
                    "SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch " +
                    "FROM pg_stat_user_indexes WHERE tablename IN ('JournalEntries', 'JournalEntryLines')")
                    .ToListAsync();

                var result = new Dictionary<string, object>();
                foreach (var stat in stats)
                {
                    result[$"{stat.tablename}_{stat.indexname}"] = new
                    {
                        Scans = stat.idx_scan,
                        TuplesRead = stat.idx_tup_read,
                        TuplesFetched = stat.idx_tup_fetch
                    };
                }
                return result;
            }
            catch
            {
                return new Dictionary<string, object>();
            }
        }

        private async Task<List<string>> FindUnusedIndexesAsync()
        {
            try
            {
                var unusedIndexes = await _context.Database.SqlQueryRaw<string>(
                    "SELECT indexname FROM pg_stat_user_indexes " +
                    "WHERE idx_scan = 0 AND tablename IN ('JournalEntries', 'JournalEntryLines')")
                    .ToListAsync();
                return unusedIndexes;
            }
            catch
            {
                return new List<string>();
            }
        }

        private async Task<List<string>> FindMissingIndexesAsync()
        {
            var missingIndexes = new List<string>();
            
            // Check for common query patterns that might benefit from indexes
            try
            {
                // Check if we have an index on EntryDate + Status
                var hasDateStatusIndex = await _context.Database.SqlQueryRaw<int>(
                    "SELECT COUNT(*) FROM pg_indexes " +
                    "WHERE tablename = 'JournalEntries' AND indexname LIKE '%DateRange_Status%'")
                    .FirstOrDefaultAsync();

                if (hasDateStatusIndex == 0)
                {
                    missingIndexes.Add("Composite index on (EntryDate, Status) for date range filtering");
                }
            }
            catch
            {
                // Ignore errors in this diagnostic method
            }

            return missingIndexes;
        }

        private Task<Dictionary<string, object>> GetIndexFragmentationInfoAsync()
        {
            // PostgreSQL doesn't have the same fragmentation concept as SQL Server
            // This is a placeholder for PostgreSQL-specific index health checks
            return Task.FromResult(new Dictionary<string, object>
            {
                ["Note"] = "PostgreSQL automatically maintains index health",
                ["Recommendation"] = "Regular VACUUM ANALYZE operations are sufficient"
            });
        }

        private async Task<Dictionary<string, object>> CheckTableBloatAsync()
        {
            try
            {
                var bloatInfo = await _context.Database.SqlQueryRaw<dynamic>(
                    "SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup, n_dead_tup " +
                    "FROM pg_stat_user_tables WHERE tablename IN ('JournalEntries', 'JournalEntryLines')")
                    .ToListAsync();

                var result = new Dictionary<string, object>();
                foreach (var info in bloatInfo)
                {
                    result[info.tablename.ToString()] = new
                    {
                        Inserts = info.n_tup_ins,
                        Updates = info.n_tup_upd,
                        Deletes = info.n_tup_del,
                        LiveTuples = info.n_live_tup,
                        DeadTuples = info.n_dead_tup
                    };
                }
                return result;
            }
            catch
            {
                return new Dictionary<string, object>();
            }
        }

        #endregion
    }

    #region DTOs

    public class DatabasePerformanceMetrics
    {
        public long JournalEntryQueryTime { get; set; }
        public long StatisticsQueryTime { get; set; }
        public long SearchQueryTime { get; set; }
        public string ConnectionPoolSize { get; set; } = string.Empty;
        public int ActiveConnections { get; set; }
        public long TotalExecutionTime { get; set; }
        public bool HasErrors { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class QueryOptimizationResult
    {
        public List<string> Recommendations { get; set; } = new();
        public string ExecutionPlanAnalysis { get; set; } = string.Empty;
        public long OptimizationTime { get; set; }
        public bool HasErrors { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class IndexPerformanceReport
    {
        public Dictionary<string, object> IndexUsageStatistics { get; set; } = new();
        public List<string> UnusedIndexes { get; set; } = new();
        public List<string> MissingIndexes { get; set; } = new();
        public Dictionary<string, object> FragmentationInfo { get; set; } = new();
        public bool HasErrors { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    public class MaintenanceResult
    {
        public List<string> TasksCompleted { get; set; } = new();
        public Dictionary<string, object> BloatInformation { get; set; } = new();
        public long MaintenanceTime { get; set; }
        public bool HasErrors { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }

    #endregion
}
