using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using System.Diagnostics;

namespace GarmentsERP.API.Services
{
    public class QueryOptimizationResult
    {
        public List<string> Recommendations { get; set; } = new();
        public string ExecutionPlanAnalysis { get; set; } = string.Empty;
        public long OptimizationTime { get; set; }
        public bool HasErrors { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
