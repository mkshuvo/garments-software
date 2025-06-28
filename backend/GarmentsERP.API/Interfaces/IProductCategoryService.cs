using GarmentsERP.API.DTOs.Products;

namespace GarmentsERP.API.Interfaces
{
    public interface IProductCategoryService
    {
        Task<IEnumerable<ProductCategoryResponseDto>> GetAllAsync();
        Task<ProductCategoryResponseDto?> GetByIdAsync(Guid id);
        Task<ProductCategoryResponseDto> CreateAsync(CreateProductCategoryDto createDto);
        Task<ProductCategoryResponseDto?> UpdateAsync(Guid id, UpdateProductCategoryDto updateDto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(Guid id);
        Task<bool> NameExistsAsync(string name, Guid? excludeId = null);
    }
}
