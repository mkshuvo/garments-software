using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using GarmentsERP.API.Models.Banking;
using GarmentsERP.API.Models.Contacts;

namespace GarmentsERP.API.Models.Payments
{
    public class Payment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string PaymentNumber { get; set; } = string.Empty;

        [ForeignKey("Contact")]
        public Guid ContactId { get; set; }

        [ForeignKey("BankAccount")]
        public Guid? BankAccountId { get; set; }

        public PaymentType PaymentType { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; } = 0;

        [MaxLength(100)]
        public string? Reference { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? ChequeNumber { get; set; }

        public DateTime? ChequeDate { get; set; }

        public PaymentStatus Status { get; set; } = PaymentStatus.Draft;

        [ForeignKey("CreatedBy")]
        public Guid CreatedByUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public virtual Contact Contact { get; set; } = null!;
        public virtual BankAccount? BankAccount { get; set; }
        public virtual ApplicationUser CreatedBy { get; set; } = null!;
        public virtual ICollection<PaymentAllocation> PaymentAllocations { get; set; } = new List<PaymentAllocation>();
    }

    public enum PaymentType
    {
        Receipt,
        Payment
    }

    public enum PaymentMethod
    {
        Cash,
        Cheque,
        BankTransfer,
        CreditCard,
        DebitCard,
        OnlineTransfer
    }

    public enum PaymentStatus
    {
        Draft,
        Posted,
        Cleared,
        Bounced,
        Cancelled
    }
}
