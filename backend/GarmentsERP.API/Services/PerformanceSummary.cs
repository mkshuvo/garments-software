using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;
using System.Collections.Concurrent;

namespace GarmentsERP.API.Services
{
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
}
