using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models
{
    /// <summary>
    /// Model for tracking trial balance generation and export activities
    /// </summary>
    public class TrialBalanceAuditLog
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty; // GENERATE, EXPORT_PDF, EXPORT_CSV, COMPARE, VIEW_ACCOUNT_DETAILS

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string UserName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string UserRole { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [StringLength(50)]
        public string? ExportFormat { get; set; } // PDF, CSV

        [StringLength(36)]
        public string? RequestId { get; set; }

        [StringLength(45)]
        public string IpAddress { get; set; } = string.Empty;

        [StringLength(500)]
        public string UserAgent { get; set; } = string.Empty;

        public int? TransactionCount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? FinalBalance { get; set; }

        [StringLength(2000)]
        public string? AdditionalData { get; set; } // JSON for additional context

        [StringLength(500)]
        public string? ErrorMessage { get; set; }

        public bool IsSuccess { get; set; } = true;

        public int ExecutionTimeMs { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties for additional context
        public Guid? ComparisonPeriod1Id { get; set; }
        public Guid? ComparisonPeriod2Id { get; set; }
        public Guid? AccountId { get; set; } // For account drill-down activities
    }
}