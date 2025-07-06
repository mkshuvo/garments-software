using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Banking
{
    public class BankTransfer
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string TransferNumber { get; set; } = string.Empty;

        [ForeignKey("FromAccount")]
        public Guid FromAccountId { get; set; }

        [ForeignKey("ToAccount")]
        public Guid ToAccountId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TransferFee { get; set; } = 0;

        public DateTime TransferDate { get; set; } = DateTime.UtcNow;

        [MaxLength(200)]
        public string? Reference { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public TransferStatus Status { get; set; } = TransferStatus.Draft;

        [ForeignKey("CreatedBy")]
        public Guid CreatedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }

    public enum TransferStatus
    {
        Draft,
        Pending,
        Completed,
        Failed,
        Cancelled
    }
}
