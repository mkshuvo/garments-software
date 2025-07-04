using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Payments;

namespace GarmentsERP.API.Models.Banking
{
    public class BankAccount
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string AccountName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string BankName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? BranchName { get; set; }

        [MaxLength(20)]
        public string? IFSCCode { get; set; }

        [MaxLength(20)]
        public string? SWIFTCode { get; set; }

        public BankAccountType AccountType { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OpeningBalance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CurrentBalance { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public virtual ICollection<BankTransfer> FromTransfers { get; set; } = new List<BankTransfer>();
        public virtual ICollection<BankTransfer> ToTransfers { get; set; } = new List<BankTransfer>();
        public virtual ICollection<BankReconciliation> BankReconciliations { get; set; } = new List<BankReconciliation>();
    }

    public enum BankAccountType
    {
        Savings,
        Current,
        FixedDeposit,
        CashCredit,
        OverdraftAccount
    }
}
