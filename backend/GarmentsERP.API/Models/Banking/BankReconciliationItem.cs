using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Banking
{
    public class BankReconciliationItem
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("BankReconciliation")]
        public Guid BankReconciliationId { get; set; }

        public DateTime TransactionDate { get; set; }

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Reference { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DebitAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CreditAmount { get; set; } = 0;

        public bool IsReconciled { get; set; } = false;

        [ForeignKey("Payment")]
        public Guid? PaymentId { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        // Navigation properties
        public virtual BankReconciliation BankReconciliation { get; set; } = null!;
        public virtual Payment? Payment { get; set; }
    }
}
