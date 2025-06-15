using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models
{
    public class ChartOfAccount
    {
        [Key]
        public Guid AccountId { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(10)]
        public string AccountCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string AccountName { get; set; } = string.Empty;

        public AccountType AccountType { get; set; }

        [ForeignKey("ParentAccount")]
        public Guid? ParentAccountId { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ChartOfAccount? ParentAccount { get; set; }
        public virtual ICollection<ChartOfAccount> SubAccounts { get; set; } = new List<ChartOfAccount>();
        public virtual ICollection<GLEntryLine> GLEntryLines { get; set; } = new List<GLEntryLine>();
    }

    public class GLEntry
    {
        [Key]
        public Guid GLEntryId { get; set; } = Guid.NewGuid();

        public VoucherType VoucherType { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(50)]
        public string ReferenceNumber { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal TotalDebit { get; set; }

        [Range(0, double.MaxValue)]
        public decimal TotalCredit { get; set; }

        public GLEntryStatus Status { get; set; } = GLEntryStatus.Draft;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CreatedBy")]
        public Guid? CreatedByUserId { get; set; }

        // Navigation properties
        public virtual ApplicationUser? CreatedBy { get; set; }
        public virtual ICollection<GLEntryLine> GLEntryLines { get; set; } = new List<GLEntryLine>();
    }

    public class GLEntryLine
    {
        [Key]
        public Guid LineId { get; set; } = Guid.NewGuid();

        [ForeignKey("GLEntry")]
        public Guid GLEntryId { get; set; }

        [ForeignKey("Account")]
        public Guid AccountId { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Debit { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Credit { get; set; }

        [MaxLength(500)]
        public string? Remarks { get; set; }

        // Navigation properties
        public virtual GLEntry GLEntry { get; set; } = null!;
        public virtual ChartOfAccount Account { get; set; } = null!;
    }

    public enum AccountType
    {
        Asset,
        Liability,
        Equity,
        Revenue,
        Expense
    }

    public enum VoucherType
    {
        Journal,
        Payment,
        Receipt,
        Sales,
        Purchase,
        Payroll
    }

    public enum GLEntryStatus
    {
        Draft,
        Posted,
        Reversed
    }
}
