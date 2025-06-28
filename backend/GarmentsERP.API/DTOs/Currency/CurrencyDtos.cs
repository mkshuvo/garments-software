namespace GarmentsERP.API.DTOs.Currency
{
    public class CreateCurrencyDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Symbol { get; set; }
        public bool IsBaseCurrency { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }

    public class UpdateCurrencyDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Symbol { get; set; }
        public bool IsBaseCurrency { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }

    public class CurrencyResponseDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Symbol { get; set; }
        public bool IsBaseCurrency { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
