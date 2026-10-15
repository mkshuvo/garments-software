using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using System.Diagnostics;

namespace GarmentsERP.API.Services
{
    public class IndexPerformanceReport
    {
        public Dictionary<string, object> IndexUsageStatistics { get; set; } = new();
        public List<string> UnusedIndexes { get; set; } = new();
        public List<string> MissingIndexes { get; set; } = new();
        public Dictionary<string, object> FragmentationInfo { get; set; } = new();
        public bool HasErrors { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
