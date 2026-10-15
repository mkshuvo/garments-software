using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using System.Diagnostics;

namespace GarmentsERP.API.Services
{
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
}
