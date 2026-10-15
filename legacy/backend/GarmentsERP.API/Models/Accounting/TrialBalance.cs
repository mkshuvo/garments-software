using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
    public class TrialBalance
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public int Year { get; set; }

        public int Month { get; set; }

        [Required]
        [MaxLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? CompanyAddress { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalDebits { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCredits { get; set; }

        public bool IsBalanced => TotalDebits == TotalCredits;

        public TrialBalanceStatus Status { get; set; } = TrialBalanceStatus.Draft;

        [MaxLength(1000)]
        public string? Notes { get; set; }

        public DateTime GeneratedDate { get; set; } = DateTime.UtcNow;

        [ForeignKey("GeneratedBy")]
        public Guid GeneratedByUserId { get; set; }

        [ForeignKey("ApprovedBy")]
        public Guid? ApprovedByUserId { get; set; }

        public DateTime? ApprovedAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
