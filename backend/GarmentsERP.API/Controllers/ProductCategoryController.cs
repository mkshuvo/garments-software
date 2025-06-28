using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.DTOs.Products;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductCategoryController : ControllerBase
    {
        private readonly IProductCategoryService _productCategoryService;
        private readonly ILogger<ProductCategoryController> _logger;

        public ProductCategoryController(
            IProductCategoryService productCategoryService,
            ILogger<ProductCategoryController> logger)
        {
            _productCategoryService = productCategoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all product categories
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductCategoryResponseDto>>> GetProductCategories()
        {
            try
            {
                var categories = await _productCategoryService.GetAllAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product categories");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get product category by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductCategoryResponseDto>> GetProductCategory(Guid id)
        {
            try
            {
                var category = await _productCategoryService.GetByIdAsync(id);
                if (category == null)
                {
                    return NotFound($"Product category with ID {id} not found");
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving product category with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new product category
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ProductCategoryResponseDto>> CreateProductCategory(CreateProductCategoryDto createDto)
        {
            try
            {
                var category = await _productCategoryService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetProductCategory), new { id = category.Id }, category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product category");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update an existing product category
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ProductCategoryResponseDto>> UpdateProductCategory(Guid id, UpdateProductCategoryDto updateDto)
        {
            try
            {
                var category = await _productCategoryService.UpdateAsync(id, updateDto);
                if (category == null)
                {
                    return NotFound($"Product category with ID {id} not found");
                }
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product category with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a product category
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProductCategory(Guid id)
        {
            try
            {
                var result = await _productCategoryService.DeleteAsync(id);
                if (!result)
                {
                    return NotFound($"Product category with ID {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting product category with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get active product categories
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ProductCategoryResponseDto>>> GetActiveProductCategories()
        {
            try
            {
                var categories = await _productCategoryService.GetAllAsync();
                return Ok(categories.Where(c => c.IsActive));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active product categories");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
