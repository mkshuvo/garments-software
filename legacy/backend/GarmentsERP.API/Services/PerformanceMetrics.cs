using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;
using System.Collections.Concurrent;

namespace GarmentsERP.API.Services
{
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
}
