using GarmentsERP.API.DTOs.Settings;

namespace GarmentsERP.API.Interfaces
{
    public interface ICompanyService
    {
        Task<IEnumerable<CompanyResponseDto>> GetAllAsync();
        Task<CompanyResponseDto?> GetByIdAsync(Guid id);
        Task<CompanyResponseDto> CreateAsync(CreateCompanyDto createDto);
        Task<CompanyResponseDto?> UpdateAsync(Guid id, UpdateCompanyDto updateDto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(Guid id);
        Task<bool> NameExistsAsync(string name, Guid? excludeId = null);
    }
}
