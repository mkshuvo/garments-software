using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Reports;

namespace GarmentsERP.API.DTOs.Reports
{
    public class ReportTemplateDto
    {
        public Guid Id { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public ReportType ReportType { get; set; }
        public string ReportTypeName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string TemplateContent { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public Guid CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
