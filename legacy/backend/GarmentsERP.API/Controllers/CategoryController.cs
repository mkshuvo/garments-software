using GarmentsERP.API.DTOs;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;
        private readonly ILogger<CategoryController> _logger;

        public CategoryController(
            ICategoryService categoryService,
            ILogger<CategoryController> logger)
        {
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all categories
        /// </summary>
        [HttpGet]
        [RequirePermission("Category", "View")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories");
                return StatusCode(500, new { message = "Error retrieving categories" });
            }
        }

        /// <summary>
        /// Get category by ID
        /// </summary>
        [HttpGet("{id}")]
        [RequirePermission("Category", "View")]
        public async Task<ActionResult<CategoryDto>> GetCategory(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return BadRequest(new { message = "Invalid category ID" });
                }

                var category = await _categoryService.GetCategoryByIdAsync(id);
                
                if (category == null)
                {
                    return NotFound(new { message = "Category not found" });
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category with ID: {Id}", id);
                return StatusCode(500, new { message = "Error retrieving category" });
            }
        }

        /// <summary>
        /// Get categories by type (Credit or Debit)
        /// </summary>
        [HttpGet("type/{type}")]
        [RequirePermission("Category", "View")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategoriesByType(CategoryType type)
        {
            try
            {
                if (!Enum.IsDefined(typeof(CategoryType), type))
                {
                    return BadRequest(new { message = "Invalid category type" });
                }

                var categories = await _categoryService.GetCategoriesByTypeAsync(type);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories by type: {Type}", type);
                return StatusCode(500, new { message = "Error retrieving categories by type" });
            }
        }

        /// <summary>
        /// Search categories by name or description
        /// </summary>
        [HttpGet("search")]
        [RequirePermission("Category", "View")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> SearchCategories([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new { message = "Search term is required" });
                }

                var categories = await _categoryService.SearchCategoriesAsync(searchTerm);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching categories with term: {SearchTerm}", searchTerm);
                return StatusCode(500, new { message = "Error searching categories" });
            }
        }

        /// <summary>
        /// Create new category
        /// </summary>
        [HttpPost]
        [RequirePermission("Category", "Create")]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var category = await _categoryService.CreateCategoryAsync(request, User?.Identity?.Name);
                return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
            {
                _logger.LogWarning(ex, "Category name conflict when creating category");
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, new { message = "Error creating category" });
            }
        }

        /// <summary>
        /// Update category
        /// </summary>
        [HttpPut("{id}")]
        [RequirePermission("Category", "Update")]
        public async Task<ActionResult<CategoryDto>> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var category = await _categoryService.UpdateCategoryAsync(id, request, User?.Identity?.Name);
                return Ok(category);
            }
            catch (ArgumentException ex) when (ex.Message.Contains("not found"))
            {
                _logger.LogWarning(ex, "Category not found when updating category with ID: {Id}", id);
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists"))
            {
                _logger.LogWarning(ex, "Category name conflict when updating category with ID: {Id}", id);
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category with ID: {Id}", id);
                return StatusCode(500, new { message = "Error updating category" });
            }
        }

        /// <summary>
        /// Delete category
        /// </summary>
        [HttpDelete("{id}")]
        [RequirePermission("Category", "Delete")]
        public async Task<ActionResult> DeleteCategory(Guid id)
        {
            try
            {
                var result = await _categoryService.DeleteCategoryAsync(id);
                
                if (!result)
                {
                    return NotFound(new { message = "Category not found" });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("used in existing transactions"))
            {
                _logger.LogWarning(ex, "Cannot delete category in use with ID: {Id}", id);
                return UnprocessableEntity(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category with ID: {Id}", id);
                return StatusCode(500, new { message = "Error deleting category" });
            }
        }

        /// <summary>
        /// Toggle category active status
        /// </summary>
        [HttpPatch("{id}/toggle-status")]
        [RequirePermission("Category", "Update")]
        public async Task<ActionResult<CategoryDto>> ToggleActiveStatus(Guid id)
        {
            try
            {
                var category = await _categoryService.ToggleActiveStatusAsync(id, User?.Identity?.Name);
                return Ok(category);
            }
            catch (ArgumentException ex) when (ex.Message.Contains("not found"))
            {
                _logger.LogWarning(ex, "Category not found when toggling status for ID: {Id}", id);
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("used in existing transactions"))
            {
                _logger.LogWarning(ex, "Cannot deactivate category in use with ID: {Id}", id);
                return UnprocessableEntity(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error toggling active status for category with ID: {Id}", id);
                return StatusCode(500, new { message = "Error toggling category status" });
            }
        }
    }
}