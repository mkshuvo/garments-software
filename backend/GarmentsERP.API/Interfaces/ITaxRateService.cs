using GarmentsERP.API.DTOs.Tax;

namespace GarmentsERP.API.Interfaces
{
    public interface ITaxRateService
    {
        Task<IEnumerable<TaxRateResponseDto>> GetAllTaxRatesAsync();
        Task<TaxRateResponseDto?> GetTaxRateByIdAsync(Guid id);
        Task<TaxRateResponseDto> CreateTaxRateAsync(CreateTaxRateDto createDto);
        Task<TaxRateResponseDto?> UpdateTaxRateAsync(Guid id, UpdateTaxRateDto updateDto);
        Task<bool> DeleteTaxRateAsync(Guid id);
        Task<IEnumerable<TaxRateResponseDto>> GetActiveTaxRatesAsync();
    }
}
