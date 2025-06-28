using GarmentsERP.API.DTOs.Settings;
using GarmentsERP.API.Models.Settings;

namespace GarmentsERP.API.Interfaces
{
    public interface IBusinessSettingService
    {
        Task<IEnumerable<BusinessSettingDto>> GetAllBusinessSettingsAsync();
        Task<BusinessSettingDto?> GetBusinessSettingByIdAsync(Guid id);
        Task<BusinessSettingDto?> GetBusinessSettingByKeyAsync(string key);
        Task<BusinessSettingDto> CreateBusinessSettingAsync(CreateBusinessSettingDto createDto);
        Task<BusinessSettingDto?> UpdateBusinessSettingAsync(Guid id, UpdateBusinessSettingDto updateDto);
        Task<bool> DeleteBusinessSettingAsync(Guid id);
        Task<IEnumerable<BusinessSettingDto>> GetBusinessSettingsByCategoryAsync(SettingCategory category);
        Task<string?> GetSettingValueAsync(string key);
        Task<bool> UpdateSettingValueAsync(string key, string value);
    }
}
