using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    public interface ICategoryService
    {
        // Read operations
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
        Task<IEnumerable<CategoryDto>> GetCategoriesByTypeAsync(CategoryType type);
        Task<CategoryDto?> GetCategoryByIdAsync(Guid id);
        Task<IEnumerable<CategoryDto>> SearchCategoriesAsync(string searchTerm);
        
        // Write operations
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, string? userId = null);
        Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request, string? userId = null);
        Task<bool> DeleteCategoryAsync(Guid id);
        Task<CategoryDto> ToggleActiveStatusAsync(Guid id, string? userId = null);
        
        // Business logic operations
        Task<bool> IsCategoryNameUniqueAsync(string name, CategoryType type, Guid? excludeId = null);
        Task<bool> IsCategoryUsedInTransactionsAsync(Guid categoryId);
        Task<int> GetCategoryUsageCountAsync(Guid categoryId);
    }
}