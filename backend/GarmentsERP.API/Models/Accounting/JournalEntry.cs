using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
    public class JournalEntry
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string JournalNumber { get; set; } = string.Empty;

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public JournalType JournalType { get; set; }

        [Required]
        [MaxLength(50)]
        public string ReferenceNumber { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalDebit { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalCredit { get; set; }

        public JournalStatus Status { get; set; } = JournalStatus.Draft;

        [ForeignKey("CreatedBy")]
        public Guid CreatedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [ForeignKey("ApprovedBy")]
        public Guid? ApprovedByUserId { get; set; }

        public DateTime? ApprovedAt { get; set; }

        // Navigation properties
        public virtual ApplicationUser CreatedBy { get; set; } = null!;
        public virtual ApplicationUser? ApprovedBy { get; set; }
        public virtual ICollection<JournalEntryLine> JournalEntryLines { get; set; } = new List<JournalEntryLine>();
    }

    public enum JournalType
    {
        General,
        Sales,
        Purchase,
        CashReceipt,
        CashPayment,
        BankTransfer,
        Adjustment,
        Opening,
        Closing
    }

    public enum JournalStatus
    {
        Draft,
        Posted,
        Approved,
        Reversed
    }
}
