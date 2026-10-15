using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using System.Diagnostics;

namespace GarmentsERP.API.Services
{
    public class MaintenanceResult
    {
        public List<string> TasksCompleted { get; set; } = new();
        public Dictionary<string, object> BloatInformation { get; set; } = new();
        public long MaintenanceTime { get; set; }
        public bool HasErrors { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
    }
}
