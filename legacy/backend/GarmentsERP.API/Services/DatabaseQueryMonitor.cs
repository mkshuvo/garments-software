using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;
using System.Collections.Concurrent;

namespace GarmentsERP.API.Services
{
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
