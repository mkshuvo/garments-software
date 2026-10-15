using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Cache statistics model
    /// </summary>
    public class CacheStatistics
    {
        public int DefaultExpiryMinutes { get; set; }
        public string CacheKeyPrefix { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public long TotalKeys { get; set; }
        public long HitCount { get; set; }
        public long MissCount { get; set; }
    }
}
