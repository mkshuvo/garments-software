using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Reports
{
    public class ReportTemplate
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

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

        [ForeignKey("CreatedBy")]
        public Guid CreatedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser CreatedBy { get; set; } = null!;
    }

    public enum ReportType
    {
        TrialBalance,
        ProfitAndLoss,
        BalanceSheet,
        CashFlow,
        AgedReceivables,
        AgedPayables,
        SalesReport,
        PurchaseReport,
        StockReport,
        Custom
    }
}
