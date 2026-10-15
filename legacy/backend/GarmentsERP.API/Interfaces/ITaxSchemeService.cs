using GarmentsERP.API.DTOs.Tax;

namespace GarmentsERP.API.Interfaces
{
    public interface ITaxSchemeService
    {
        Task<IEnumerable<TaxSchemeDto>> GetAllTaxSchemesAsync();
        Task<TaxSchemeDto?> GetTaxSchemeByIdAsync(Guid id);
        Task<TaxSchemeDto> CreateTaxSchemeAsync(CreateTaxSchemeDto createDto);
        Task<TaxSchemeDto?> UpdateTaxSchemeAsync(Guid id, UpdateTaxSchemeDto updateDto);
        Task<bool> DeleteTaxSchemeAsync(Guid id);
        Task<IEnumerable<TaxSchemeDto>> GetActiveTaxSchemesAsync();
        Task<IEnumerable<TaxSchemeDto>> GetTaxSchemesByTaxRateAsync(Guid taxRateId);
    }
}
