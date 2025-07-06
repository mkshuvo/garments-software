using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Accounting
{
    public class ChartOfAccount
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

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

        [Column(TypeName = "decimal(18,2)")]
        public decimal OpeningBalance { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CurrentBalance { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        // SIMPLIFIED APPROACH - NO NAVIGATION PROPERTIES
        // Relationships are handled via foreign key IDs only
    }

    public enum AccountType
    {
        Asset,
        Liability,
        Equity,
        Revenue,
        Expense
    }
}
