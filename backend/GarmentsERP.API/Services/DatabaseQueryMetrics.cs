using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;
using System.Collections.Concurrent;

namespace GarmentsERP.API.Services
{
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
}
