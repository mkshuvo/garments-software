using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Banking
{
    public class BankReconciliation
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("BankAccount")]
        public Guid BankAccountId { get; set; }

        public DateTime StatementDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal StatementBalance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal BookBalance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ReconciledBalance { get; set; } = 0;

        public ReconciliationStatus Status { get; set; } = ReconciliationStatus.InProgress;

        [ForeignKey("ReconciledBy")]
        public Guid? ReconciledByUserId { get; set; }

        public DateTime? ReconciledAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(1000)]
        public string? Notes { get; set; }

        // Navigation properties
        public virtual BankAccount BankAccount { get; set; } = null!;
        public virtual ApplicationUser? ReconciledBy { get; set; }
        public virtual ICollection<BankReconciliationItem> ReconciliationItems { get; set; } = new List<BankReconciliationItem>();
    }

    public enum ReconciliationStatus
    {
        InProgress,
        Completed,
        Reviewed
    }
}
