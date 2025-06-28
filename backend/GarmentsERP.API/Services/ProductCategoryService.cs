using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Products;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Products;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    public class ProductCategoryService : IProductCategoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductCategoryService> _logger;

        public ProductCategoryService(ApplicationDbContext context, ILogger<ProductCategoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<ProductCategoryResponseDto>> GetAllAsync()
        {
            try
            {
                var categories = await _context.Set<ProductCategory>()
                    .OrderBy(c => c.CategoryName)
                    .ToListAsync();

                return categories.Select(c => new ProductCategoryResponseDto
                {
                    Id = c.Id,
                    CategoryName = c.CategoryName,
                    Description = c.Description,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting all product categories");
                throw;
            }
        }

        public async Task<ProductCategoryResponseDto?> GetByIdAsync(Guid id)
        {
            try
            {
                var category = await _context.Set<ProductCategory>()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                    return null;

                return new ProductCategoryResponseDto
                {
                    Id = category.Id,
                    CategoryName = category.CategoryName,
                    Description = category.Description,
                    IsActive = category.IsActive,
                    CreatedAt = category.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting product category with ID {Id}", id);
                throw;
            }
        }

        public async Task<ProductCategoryResponseDto> CreateAsync(CreateProductCategoryDto createDto)
        {
            try
            {
                var category = new ProductCategory
                {
                    CategoryName = createDto.CategoryName,
                    Description = createDto.Description,
                    IsActive = createDto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Set<ProductCategory>().Add(category);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Product category created with ID {Id}", category.Id);

                return new ProductCategoryResponseDto
                {
                    Id = category.Id,
                    CategoryName = category.CategoryName,
                    Description = category.Description,
                    IsActive = category.IsActive,
                    CreatedAt = category.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating product category");
                throw;
            }
        }

        public async Task<ProductCategoryResponseDto?> UpdateAsync(Guid id, UpdateProductCategoryDto updateDto)
        {
            try
            {
                var category = await _context.Set<ProductCategory>()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                    return null;

                category.CategoryName = updateDto.CategoryName;
                category.Description = updateDto.Description;
                category.IsActive = updateDto.IsActive;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Product category updated with ID {Id}", id);

                return new ProductCategoryResponseDto
                {
                    Id = category.Id,
                    CategoryName = category.CategoryName,
                    Description = category.Description,
                    IsActive = category.IsActive,
                    CreatedAt = category.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating product category with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            try
            {
                var category = await _context.Set<ProductCategory>()
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (category == null)
                    return false;

                _context.Set<ProductCategory>().Remove(category);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Product category deleted with ID {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting product category with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            try
            {
                return await _context.Set<ProductCategory>()
                    .AnyAsync(c => c.Id == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking if product category exists with ID {Id}", id);
                throw;
            }
        }

        public async Task<bool> NameExistsAsync(string name, Guid? excludeId = null)
        {
            try
            {
                var query = _context.Set<ProductCategory>()
                    .Where(c => c.CategoryName.ToLower() == name.ToLower());

                if (excludeId.HasValue)
                    query = query.Where(c => c.Id != excludeId.Value);

                return await query.AnyAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking if product category name exists: {Name}", name);
                throw;
            }
        }
    }
}
