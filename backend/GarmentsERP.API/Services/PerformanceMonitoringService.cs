using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;
using System.Collections.Concurrent;

namespace GarmentsERP.API.Services
{
    public class PerformanceMonitoringService
    {
        private readonly ILogger<PerformanceMonitoringService> _logger;
        private readonly IMemoryCache _cache;
        private readonly ConcurrentDictionary<string, PerformanceMetrics> _endpointMetrics;
        private readonly ConcurrentDictionary<string, DatabaseQueryMetrics> _databaseMetrics;

        public PerformanceMonitoringService(
            ILogger<PerformanceMonitoringService> logger,
            IMemoryCache cache)
        {
            _logger = logger;
            _cache = cache;
            _endpointMetrics = new ConcurrentDictionary<string, PerformanceMetrics>();
            _databaseMetrics = new ConcurrentDictionary<string, DatabaseQueryMetrics>();
        }

        /// <summary>
        /// Starts monitoring an API endpoint
        /// </summary>
        public IDisposable MonitorEndpoint(string endpoint, string method = "GET")
        {
            var stopwatch = Stopwatch.StartNew();
            var key = $"{method}:{endpoint}";

            return new EndpointMonitor(this, key, stopwatch);
        }

        /// <summary>
        /// Starts monitoring a database query
        /// </summary>
        public IDisposable MonitorDatabaseQuery(string queryName, string connectionString = "default")
        {
            var stopwatch = Stopwatch.StartNew();
            var key = $"{connectionString}:{queryName}";

            return new DatabaseQueryMonitor(this, key, stopwatch);
        }

        /// <summary>
        /// Records endpoint performance metrics
        /// </summary>
        internal void RecordEndpointMetrics(string key, TimeSpan duration, bool success = true)
        {
            var metrics = _endpointMetrics.GetOrAdd(key, _ => new PerformanceMetrics());
            
            lock (metrics)
            {
                metrics.TotalRequests++;
                metrics.TotalDuration += duration;
                metrics.AverageDuration = metrics.TotalDuration.TotalMilliseconds / metrics.TotalRequests;
                metrics.MinDuration = Math.Min(metrics.MinDuration, duration.TotalMilliseconds);
                metrics.MaxDuration = Math.Max(metrics.MaxDuration, duration.TotalMilliseconds);
                metrics.SuccessCount += success ? 1 : 0;
                metrics.LastRequestTime = DateTime.UtcNow;
            }

            // Log slow requests
            if (duration.TotalMilliseconds > 1000) // 1 second threshold
            {
                _logger.LogWarning("Slow endpoint detected: {Key} took {Duration}ms", key, duration.TotalMilliseconds);
            }

            // Log failed requests
            if (!success)
            {
                _logger.LogError("Endpoint failure detected: {Key} failed after {Duration}ms", key, duration.TotalMilliseconds);
            }
        }

        /// <summary>
        /// Records database query performance metrics
        /// </summary>
        internal void RecordDatabaseQueryMetrics(string key, TimeSpan duration, int rowsAffected = 0, bool success = true)
        {
            var metrics = _databaseMetrics.GetOrAdd(key, _ => new DatabaseQueryMetrics());
            
            lock (metrics)
            {
                metrics.TotalQueries++;
                metrics.TotalDuration += duration;
                metrics.AverageDuration = metrics.TotalDuration.TotalMilliseconds / metrics.TotalQueries;
                metrics.MinDuration = Math.Min(metrics.MinDuration, duration.TotalMilliseconds);
                metrics.MaxDuration = Math.Max(metrics.MaxDuration, duration.TotalMilliseconds);
                metrics.SuccessCount += success ? 1 : 0;
                metrics.TotalRowsAffected += rowsAffected;
                metrics.LastQueryTime = DateTime.UtcNow;
            }

            // Log slow queries
            if (duration.TotalMilliseconds > 500) // 500ms threshold
            {
                _logger.LogWarning("Slow database query detected: {Key} took {Duration}ms", key, duration.TotalMilliseconds);
            }

            // Log failed queries
            if (!success)
            {
                _logger.LogError("Database query failure detected: {Key} failed after {Duration}ms", key, duration.TotalMilliseconds);
            }
        }

        /// <summary>
        /// Gets performance metrics for all endpoints
        /// </summary>
        public Dictionary<string, PerformanceMetrics> GetEndpointMetrics()
        {
            return _endpointMetrics.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Clone());
        }

        /// <summary>
        /// Gets performance metrics for all database queries
        /// </summary>
        public Dictionary<string, DatabaseQueryMetrics> GetDatabaseQueryMetrics()
        {
            return _databaseMetrics.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Clone());
        }

        /// <summary>
        /// Gets performance summary
        /// </summary>
        public PerformanceSummary GetPerformanceSummary()
        {
            var endpointMetrics = GetEndpointMetrics();
            var databaseMetrics = GetDatabaseQueryMetrics();

            return new PerformanceSummary
            {
                TotalEndpoints = endpointMetrics.Count,
                TotalDatabaseQueries = databaseMetrics.Count,
                SlowEndpoints = endpointMetrics.Values.Count(m => m.AverageDuration > 1000),
                SlowDatabaseQueries = databaseMetrics.Values.Count(m => m.AverageDuration > 500),
                FailedEndpoints = endpointMetrics.Values.Count(m => m.SuccessCount < m.TotalRequests),
                FailedDatabaseQueries = databaseMetrics.Values.Count(m => m.SuccessCount < m.TotalQueries),
                GeneratedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Clears all performance metrics
        /// </summary>
        public void ClearMetrics()
        {
            _endpointMetrics.Clear();
            _databaseMetrics.Clear();
            _logger.LogInformation("Performance metrics cleared");
        }

        /// <summary>
        /// Gets recommendations for performance improvements
        /// </summary>
        public List<PerformanceRecommendation> GetPerformanceRecommendations()
        {
            var recommendations = new List<PerformanceRecommendation>();

            // Analyze endpoint performance
            foreach (var kvp in _endpointMetrics)
            {
                var metrics = kvp.Value;
                var endpoint = kvp.Key;

                if (metrics.AverageDuration > 2000) // 2 seconds
                {
                    recommendations.Add(new PerformanceRecommendation
                    {
                        Type = "Endpoint",
                        Name = endpoint,
                        Issue = "Slow response time",
                        Severity = "High",
                        Suggestion = "Consider implementing caching, database optimization, or async processing"
                    });
                }

                if (metrics.SuccessCount < metrics.TotalRequests * 0.95) // 95% success rate
                {
                    recommendations.Add(new PerformanceRecommendation
                    {
                        Type = "Endpoint",
                        Name = endpoint,
                        Issue = "High failure rate",
                        Severity = "Medium",
                        Suggestion = "Review error handling and input validation"
                    });
                }
            }

            // Analyze database performance
            foreach (var kvp in _databaseMetrics)
            {
                var metrics = kvp.Value;
                var query = kvp.Key;

                if (metrics.AverageDuration > 1000) // 1 second
                {
                    recommendations.Add(new PerformanceRecommendation
                    {
                        Type = "Database",
                        Name = query,
                        Issue = "Slow query execution",
                        Severity = "High",
                        Suggestion = "Review query performance, add indexes, or implement query optimization"
                    });
                }

                if (metrics.SuccessCount < metrics.TotalQueries * 0.95) // 95% success rate
                {
                    recommendations.Add(new PerformanceRecommendation
                    {
                        Type = "Database",
                        Name = query,
                        Issue = "High query failure rate",
                        Severity = "Medium",
                        Suggestion = "Review database connection and query logic"
                    });
                }
            }

            return recommendations.OrderByDescending(r => r.Severity == "High").ToList();
        }
    }
}
