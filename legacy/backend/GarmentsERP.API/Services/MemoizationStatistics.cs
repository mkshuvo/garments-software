using System.Collections.Concurrent;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Services;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Memoization cache statistics
    /// </summary>
    public class MemoizationStatistics
    {
        public int TotalEntries { get; set; }
        public int ActiveEntries { get; set; }
        public int ExpiredEntries { get; set; }
        public int CacheExpiryMinutes { get; set; }
    }
}
