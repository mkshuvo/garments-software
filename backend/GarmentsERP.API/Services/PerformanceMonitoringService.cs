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

    /// <summary>
    /// Performance metrics for endpoints
    /// </summary>
    public class PerformanceMetrics
    {
        public long TotalRequests { get; set; }
        public TimeSpan TotalDuration { get; set; }
        public double AverageDuration { get; set; }
        public double MinDuration { get; set; } = double.MaxValue;
        public double MaxDuration { get; set; }
        public long SuccessCount { get; set; }
        public DateTime LastRequestTime { get; set; }

        public PerformanceMetrics Clone()
        {
            return new PerformanceMetrics
            {
                TotalRequests = this.TotalRequests,
                TotalDuration = this.TotalDuration,
                AverageDuration = this.AverageDuration,
                MinDuration = this.MinDuration,
                MaxDuration = this.MaxDuration,
                SuccessCount = this.SuccessCount,
                LastRequestTime = this.LastRequestTime
            };
        }
    }

    /// <summary>
    /// Performance metrics for database queries
    /// </summary>
    public class DatabaseQueryMetrics
    {
        public long TotalQueries { get; set; }
        public TimeSpan TotalDuration { get; set; }
        public double AverageDuration { get; set; }
        public double MinDuration { get; set; } = double.MaxValue;
        public double MaxDuration { get; set; }
        public long SuccessCount { get; set; }
        public long TotalRowsAffected { get; set; }
        public DateTime LastQueryTime { get; set; }

        public DatabaseQueryMetrics Clone()
        {
            return new DatabaseQueryMetrics
            {
                TotalQueries = this.TotalQueries,
                TotalDuration = this.TotalDuration,
                AverageDuration = this.AverageDuration,
                MinDuration = this.MinDuration,
                MaxDuration = this.MaxDuration,
                SuccessCount = this.SuccessCount,
                TotalRowsAffected = this.TotalRowsAffected,
                LastQueryTime = this.LastQueryTime
            };
        }
    }

    /// <summary>
    /// Performance summary
    /// </summary>
    public class PerformanceSummary
    {
        public int TotalEndpoints { get; set; }
        public int TotalDatabaseQueries { get; set; }
        public int SlowEndpoints { get; set; }
        public int SlowDatabaseQueries { get; set; }
        public int FailedEndpoints { get; set; }
        public int FailedDatabaseQueries { get; set; }
        public DateTime GeneratedAt { get; set; }
    }

    /// <summary>
    /// Performance recommendation
    /// </summary>
    public class PerformanceRecommendation
    {
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Issue { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Suggestion { get; set; } = string.Empty;
    }

    /// <summary>
    /// Endpoint performance monitor
    /// </summary>
    internal class EndpointMonitor : IDisposable
    {
        private readonly PerformanceMonitoringService _service;
        private readonly string _key;
        private readonly Stopwatch _stopwatch;
        private bool _disposed;

        public EndpointMonitor(PerformanceMonitoringService service, string key, Stopwatch stopwatch)
        {
            _service = service;
            _key = key;
            _stopwatch = stopwatch;
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _stopwatch.Stop();
                _service.RecordEndpointMetrics(_key, _stopwatch.Elapsed);
                _disposed = true;
            }
        }
    }

    /// <summary>
    /// Database query performance monitor
    /// </summary>
    internal class DatabaseQueryMonitor : IDisposable
    {
        private readonly PerformanceMonitoringService _service;
        private readonly string _key;
        private readonly Stopwatch _stopwatch;
        private bool _disposed;

        public DatabaseQueryMonitor(PerformanceMonitoringService service, string key, Stopwatch stopwatch)
        {
            _service = service;
            _key = key;
            _stopwatch = stopwatch;
        }

        public void Dispose()
        {
            if (!_disposed)
            {
                _stopwatch.Stop();
                _service.RecordDatabaseQueryMetrics(_key, _stopwatch.Elapsed);
                _disposed = true;
            }
        }
    }
}
