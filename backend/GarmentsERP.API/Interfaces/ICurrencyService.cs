using GarmentsERP.API.DTOs.Currency;

namespace GarmentsERP.API.Interfaces
{
    public interface ICurrencyService
    {
        Task<IEnumerable<CurrencyResponseDto>> GetAllAsync();
        Task<CurrencyResponseDto?> GetByIdAsync(Guid id);
        Task<CurrencyResponseDto> CreateAsync(CreateCurrencyDto createDto);
        Task<CurrencyResponseDto?> UpdateAsync(Guid id, UpdateCurrencyDto updateDto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(Guid id);
        Task<bool> CodeExistsAsync(string code, Guid? excludeId = null);
    }
}
