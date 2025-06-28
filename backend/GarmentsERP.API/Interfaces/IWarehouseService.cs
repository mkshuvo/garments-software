using GarmentsERP.API.DTOs.Inventory;

namespace GarmentsERP.API.Interfaces
{
    public interface IWarehouseService
    {
        Task<IEnumerable<WarehouseResponseDto>> GetAllAsync();
        Task<WarehouseResponseDto?> GetByIdAsync(Guid id);
        Task<WarehouseResponseDto> CreateAsync(CreateWarehouseDto createDto);
        Task<WarehouseResponseDto?> UpdateAsync(Guid id, UpdateWarehouseDto updateDto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(Guid id);
        Task<bool> NameExistsAsync(string name, Guid? excludeId = null);
    }
}
