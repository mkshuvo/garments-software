namespace GarmentsERP.API.DTOs.Currency
{
    public class UpdateCurrencyDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Symbol { get; set; }
        public bool IsBaseCurrency { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }
}
