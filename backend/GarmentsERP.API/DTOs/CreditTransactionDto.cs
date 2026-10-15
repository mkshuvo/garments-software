using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    /// <summary>
    /// DTO for saving a single credit transaction
    /// </summary>
    public class CreditTransactionDto
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MaxLength(200)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Particulars { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [MaxLength(200)]
        public string? ContactName { get; set; }
    }
}
