using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models.Currency
{
    public class Currency
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(3)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(10)]
        public string? Symbol { get; set; }

        public bool IsBaseCurrency { get; set; } = false;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<ExchangeRate> FromExchangeRates { get; set; } = new List<ExchangeRate>();
        public virtual ICollection<ExchangeRate> ToExchangeRates { get; set; } = new List<ExchangeRate>();
    }
}
