using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategorySeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CategorySeedController> _logger;

        public CategorySeedController(ApplicationDbContext context, ILogger<CategorySeedController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Manually trigger category seeding (for development/testing purposes)
        /// </summary>
        [HttpPost("seed")]
        public async Task<IActionResult> SeedCategories()
        {
            try
            {
                await CategorySeeder.SeedCategoriesAsync(_context);
                _logger.LogInformation("Categories seeded successfully via API endpoint");
                
                var categoryCount = await _context.Categories.CountAsync();
                return Ok(new { message = "Categories seeded successfully", totalCategories = categoryCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding categories via API endpoint");
                return StatusCode(500, new { message = "Error seeding categories", error = ex.Message });
            }
        }

        /// <summary>
        /// Get seeded category statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetCategoryStats()
        {
            try
            {
                var totalCategories = await _context.Categories.CountAsync();
                var creditCategories = await _context.Categories.CountAsync(c => c.Type == CategoryType.Credit);
                var debitCategories = await _context.Categories.CountAsync(c => c.Type == CategoryType.Debit);
                var activeCategories = await _context.Categories.CountAsync(c => c.IsActive);

                return Ok(new
                {
                    totalCategories,
                    creditCategories,
                    debitCategories,
                    activeCategories,
                    inactiveCategories = totalCategories - activeCategories
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting category statistics");
                return StatusCode(500, new { message = "Error getting category statistics", error = ex.Message });
            }
        }

        /// <summary>
        /// Verify seeded categories by listing some examples
        /// </summary>
        [HttpGet("verify")]
        public async Task<IActionResult> VerifySeededCategories()
        {
            try
            {
                var creditSamples = await _context.Categories
                    .Where(c => c.Type == CategoryType.Credit)
                    .Take(5)
                    .Select(c => new { c.Name, c.Description, c.Type })
                    .ToListAsync();

                var debitSamples = await _context.Categories
                    .Where(c => c.Type == CategoryType.Debit)
                    .Take(10)
                    .Select(c => new { c.Name, c.Description, c.Type })
                    .ToListAsync();

                return Ok(new
                {
                    message = "Category verification complete",
                    creditSamples,
                    debitSamples
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying seeded categories");
                return StatusCode(500, new { message = "Error verifying categories", error = ex.Message });
            }
        }
    }
}