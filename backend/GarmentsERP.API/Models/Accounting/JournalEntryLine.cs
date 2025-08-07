using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
    public class JournalEntryLine
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("JournalEntry")]
        public Guid JournalEntryId { get; set; }

        [ForeignKey("Account")]
        public Guid AccountId { get; set; }

        // [ForeignKey("Category")]
        // public Guid? CategoryId { get; set; } // Temporarily disabled until migration is applied

        [MaxLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Debit { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Credit { get; set; } = 0;

        [MaxLength(200)]
        public string? Reference { get; set; }

        public int LineOrder { get; set; }

        // Additional properties for compatibility
        public Guid? ContactId { get; set; }
        public decimal DebitAmount => Debit;
        public decimal CreditAmount => Credit;

        // Navigation properties
        public virtual JournalEntry JournalEntry { get; set; } = null!;
        public virtual ChartOfAccount Account { get; set; } = null!;
        // public virtual Category? Category { get; set; } // Temporarily disabled until migration is applied
    }
}
