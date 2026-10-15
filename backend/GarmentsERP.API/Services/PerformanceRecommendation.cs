using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;
using System.Collections.Concurrent;

namespace GarmentsERP.API.Services
{
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
}
