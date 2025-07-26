using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(ApplicationDbContext context, ILogger<CategoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        #region Read Operations

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            try
            {
                _logger.LogInformation("Retrieving all categories");

                var categories = await _context.Categories
                    .Where(x => x.IsActive)
                    .OrderBy(x => x.Type)
                    .ThenBy(x => x.Name)
                    .ToListAsync();

                var categoryDtos = new List<CategoryDto>();
                foreach (var category in categories)
                {
                    var usageCount = await GetCategoryUsageCountAsync(category.Id);
                    categoryDtos.Add(MapToCategoryDto(category, usageCount));
                }

                _logger.LogInformation("Retrieved {Count} categories", categoryDtos.Count);
                return categoryDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all categories");
                throw;
            }
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesByTypeAsync(CategoryType type)
        {
            try
            {
                _logger.LogInformation("Retrieving categories by type: {Type}", type);

                var categories = await _context.Categories
                    .Where(x => x.IsActive && x.Type == type)
                    .OrderBy(x => x.Name)
                    .ToListAsync();

                var categoryDtos = new List<CategoryDto>();
                foreach (var category in categories)
                {
                    var usageCount = await GetCategoryUsageCountAsync(category.Id);
                    categoryDtos.Add(MapToCategoryDto(category, usageCount));
                }

                _logger.LogInformation("Retrieved {Count} categories for type {Type}", categoryDtos.Count, type);
                return categoryDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories by type: {Type}", type);
                throw;
            }
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(Guid id)
        {
            try
            {
                _logger.LogInformation("Retrieving category by ID: {Id}", id);

                var category = await _context.Categories
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (category == null)
                {
                    _logger.LogWarning("Category not found: {Id}", id);
                    return null;
                }

                var usageCount = await GetCategoryUsageCountAsync(category.Id);
                var categoryDto = MapToCategoryDto(category, usageCount);

                _logger.LogInformation("Retrieved category: {Name}", category.Name);
                return categoryDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category by ID: {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<CategoryDto>> SearchCategoriesAsync(string searchTerm)
        {
            try
            {
                _logger.LogInformation("Searching categories with term: {SearchTerm}", searchTerm);

                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return await GetAllCategoriesAsync();
                }

                var lowerSearchTerm = searchTerm.ToLower();

                var categories = await _context.Categories
                    .Where(x => x.IsActive && 
                        (x.Name.ToLower().Contains(lowerSearchTerm) ||
                         (x.Description != null && x.Description.ToLower().Contains(lowerSearchTerm))))
                    .OrderBy(x => x.Type)
                    .ThenBy(x => x.Name)
                    .ToListAsync();

                var categoryDtos = new List<CategoryDto>();
                foreach (var category in categories)
                {
                    var usageCount = await GetCategoryUsageCountAsync(category.Id);
                    categoryDtos.Add(MapToCategoryDto(category, usageCount));
                }

                _logger.LogInformation("Found {Count} categories matching search term: {SearchTerm}", categoryDtos.Count, searchTerm);
                return categoryDtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching categories with term: {SearchTerm}", searchTerm);
                throw;
            }
        }

        #endregion

        #region Write Operations

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, string? userId = null)
        {
            try
            {
                _logger.LogInformation("Creating category: {Name} of type {Type}", request.Name, request.Type);

                // Validate name uniqueness within type
                if (!await IsCategoryNameUniqueAsync(request.Name, request.Type))
                {
                    var message = $"Category name '{request.Name}' already exists for type '{request.Type}'";
                    _logger.LogWarning(message);
                    throw new InvalidOperationException(message);
                }

                var category = new Category
                {
                    Name = request.Name.Trim(),
                    Description = request.Description?.Trim(),
                    Type = request.Type,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };

                _context.Categories.Add(category);
                await _context.SaveChangesAsync();

                var categoryDto = MapToCategoryDto(category, 0);

                _logger.LogInformation("Created category: {Id} - {Name}", category.Id, category.Name);
                return categoryDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category: {Name}", request.Name);
                throw;
            }
        }

        public async Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request, string? userId = null)
        {
            try
            {
                _logger.LogInformation("Updating category: {Id}", id);

                var category = await _context.Categories
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (category == null)
                {
                    var message = $"Category not found: {id}";
                    _logger.LogWarning(message);
                    throw new ArgumentException(message);
                }

                // Validate name uniqueness within type (excluding current category)
                if (!await IsCategoryNameUniqueAsync(request.Name, category.Type, id))
                {
                    var message = $"Category name '{request.Name}' already exists for type '{category.Type}'";
                    _logger.LogWarning(message);
                    throw new InvalidOperationException(message);
                }

                // Update category properties
                category.Name = request.Name.Trim();
                category.Description = request.Description?.Trim();
                category.IsActive = request.IsActive;
                category.UpdatedAt = DateTime.UtcNow;
                category.UpdatedBy = userId;

                await _context.SaveChangesAsync();

                var usageCount = await GetCategoryUsageCountAsync(category.Id);
                var categoryDto = MapToCategoryDto(category, usageCount);

                _logger.LogInformation("Updated category: {Id} - {Name}", category.Id, category.Name);
                return categoryDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category: {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            try
            {
                _logger.LogInformation("Deleting category: {Id}", id);

                var category = await _context.Categories
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (category == null)
                {
                    _logger.LogWarning("Category not found for deletion: {Id}", id);
                    return false;
                }

                // Check if category is used in transactions
                if (await IsCategoryUsedInTransactionsAsync(id))
                {
                    var message = $"Cannot delete category '{category.Name}' because it is used in existing transactions. Use deactivate instead.";
                    _logger.LogWarning(message);
                    throw new InvalidOperationException(message);
                }

                // Soft delete by marking as inactive
                category.IsActive = false;
                category.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted category: {Id} - {Name}", category.Id, category.Name);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category: {Id}", id);
                throw;
            }
        }

        public async Task<CategoryDto> ToggleActiveStatusAsync(Guid id, string? userId = null)
        {
            try
            {
                _logger.LogInformation("Toggling active status for category: {Id}", id);

                var category = await _context.Categories
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (category == null)
                {
                    var message = $"Category not found: {id}";
                    _logger.LogWarning(message);
                    throw new ArgumentException(message);
                }

                // If trying to deactivate, check if category is used in transactions
                if (category.IsActive && await IsCategoryUsedInTransactionsAsync(id))
                {
                    var message = $"Cannot deactivate category '{category.Name}' because it is used in existing transactions.";
                    _logger.LogWarning(message);
                    throw new InvalidOperationException(message);
                }

                category.IsActive = !category.IsActive;
                category.UpdatedAt = DateTime.UtcNow;
                category.UpdatedBy = userId;

                await _context.SaveChangesAsync();

                var usageCount = await GetCategoryUsageCountAsync(category.Id);
                var categoryDto = MapToCategoryDto(category, usageCount);

                _logger.LogInformation("Toggled active status for category: {Id} - {Name} to {IsActive}", 
                    category.Id, category.Name, category.IsActive);
                
                return categoryDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling active status for category: {Id}", id);
                throw;
            }
        }

        #endregion

        #region Business Logic Operations

        public async Task<bool> IsCategoryNameUniqueAsync(string name, CategoryType type, Guid? excludeId = null)
        {
            try
            {
                var query = _context.Categories
                    .Where(x => x.Name.ToLower() == name.ToLower() && x.Type == type && x.IsActive);

                if (excludeId.HasValue)
                {
                    query = query.Where(x => x.Id != excludeId.Value);
                }

                var exists = await query.AnyAsync();
                return !exists;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking category name uniqueness: {Name}, {Type}", name, type);
                throw;
            }
        }

        public async Task<bool> IsCategoryUsedInTransactionsAsync(Guid categoryId)
        {
            try
            {
                _logger.LogDebug("Checking if category {CategoryId} is used in transactions", categoryId);

                // Check if category is referenced in any transaction tables
                // Currently, the new Category system is not yet integrated with transaction tables
                // The existing JournalEntryLine uses AccountId (ChartOfAccount), not CategoryId
                
                // Future integration points to check when cashbook transactions are implemented:
                // 1. CashbookEntry table (when created) - should have CategoryId field
                // 2. Any other transaction tables that will use the new Category system
                
                // For now, return false as no transaction tables reference the new Category system
                // When implemented, this should be:
                // var isUsed = await _context.CashbookEntries.AnyAsync(x => x.CategoryId == categoryId);
                
                var isUsed = await Task.FromResult(false);
                
                _logger.LogDebug("Category {CategoryId} usage check result: {IsUsed}", categoryId, isUsed);
                return isUsed;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking category usage in transactions: {CategoryId}", categoryId);
                throw;
            }
        }

        public async Task<int> GetCategoryUsageCountAsync(Guid categoryId)
        {
            try
            {
                _logger.LogDebug("Getting usage count for category {CategoryId}", categoryId);

                // Count how many transactions use this category
                // Currently, the new Category system is not yet integrated with transaction tables
                // The existing JournalEntryLine uses AccountId (ChartOfAccount), not CategoryId
                
                // Future implementation should count:
                // 1. CashbookEntry records (when created) that reference this CategoryId
                // 2. Any other transaction records that will use the new Category system
                
                // When implemented, this should be:
                // var usageCount = await _context.CashbookEntries
                //     .Where(x => x.CategoryId == categoryId)
                //     .CountAsync();
                
                var usageCount = await Task.FromResult(0);
                
                _logger.LogDebug("Category {CategoryId} usage count: {UsageCount}", categoryId, usageCount);
                return usageCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category usage count: {CategoryId}", categoryId);
                throw;
            }
        }

        #endregion

        #region Private Helper Methods

        private static CategoryDto MapToCategoryDto(Category category, int usageCount)
        {
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                Type = category.Type,
                TypeName = category.Type.ToString(),
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt,
                CreatedBy = category.CreatedBy,
                UpdatedBy = category.UpdatedBy,
                UsageCount = usageCount
            };
        }

        #endregion
    }
}