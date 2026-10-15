using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
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
}
