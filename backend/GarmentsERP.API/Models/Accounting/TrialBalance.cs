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

    public class TrialBalanceEntry
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("TrialBalance")]
        public Guid TrialBalanceId { get; set; }

        [ForeignKey("Account")]
        public Guid AccountId { get; set; }

        [Required]
        [MaxLength(10)]
        public string AccountCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string AccountName { get; set; } = string.Empty;

        public AccountType AccountType { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OpeningBalance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DebitMovements { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CreditMovements { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ClosingBalance { get; set; } = 0;

        public int SortOrder { get; set; } = 0;
    }

    public enum TrialBalanceStatus
    {
        Draft,
        Generated,
        Approved,
        Archived
    }
}