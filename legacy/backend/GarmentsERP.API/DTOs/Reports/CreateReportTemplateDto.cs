using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Reports;

namespace GarmentsERP.API.DTOs.Reports
{
    public class CreateReportTemplateDto
    {
        [Required]
        [MaxLength(200)]
        public string TemplateName { get; set; } = string.Empty;

        [Required]
        public ReportType ReportType { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public string TemplateContent { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;
    }
}
