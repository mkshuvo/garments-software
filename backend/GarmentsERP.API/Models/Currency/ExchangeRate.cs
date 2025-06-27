using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Currency
{
    public class ExchangeRate
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [ForeignKey("FromCurrency")]
        public Guid FromCurrencyId { get; set; }

        [ForeignKey("ToCurrency")]
        public Guid ToCurrencyId { get; set; }

        [Column(TypeName = "decimal(10,6)")]
        public decimal Rate { get; set; } = 1;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Currency FromCurrency { get; set; } = null!;
        public virtual Currency ToCurrency { get; set; } = null!;
    }
}
