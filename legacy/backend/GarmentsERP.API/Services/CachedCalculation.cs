using System.Collections.Concurrent;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Services;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Cached calculation result
    /// </summary>
    internal class CachedCalculation
    {
        public TrialBalanceCalculation? Result { get; set; }
        public string? Expression { get; set; }
        public decimal FinalBalance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
