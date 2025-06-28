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

    public class UpdateReportTemplateDto
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

        public bool IsActive { get; set; }
    }
}
