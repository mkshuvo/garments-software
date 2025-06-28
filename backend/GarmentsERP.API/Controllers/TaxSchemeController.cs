using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.DTOs.Tax;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Attributes;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaxSchemeController : ControllerBase
    {
        private readonly ITaxSchemeService _taxSchemeService;
        private readonly ILogger<TaxSchemeController> _logger;

        public TaxSchemeController(
            ITaxSchemeService taxSchemeService,
            ILogger<TaxSchemeController> logger)
        {
            _taxSchemeService = taxSchemeService;
            _logger = logger;
        }

        /// <summary>
        /// Get all tax schemes
        /// </summary>
        [HttpGet]
        [RequirePermission("TaxScheme", "Read")]
        public async Task<ActionResult<IEnumerable<TaxSchemeDto>>> GetTaxSchemes()
        {
            try
            {
                var taxSchemes = await _taxSchemeService.GetAllTaxSchemesAsync();
                return Ok(taxSchemes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tax schemes");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get tax scheme by ID
        /// </summary>
        [HttpGet("{id}")]
        [RequirePermission("TaxScheme", "Read")]
        public async Task<ActionResult<TaxSchemeDto>> GetTaxScheme(Guid id)
        {
            try
            {
                var taxScheme = await _taxSchemeService.GetTaxSchemeByIdAsync(id);
                if (taxScheme == null)
                {
                    return NotFound($"Tax scheme with ID {id} not found");
                }
                return Ok(taxScheme);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tax scheme with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new tax scheme
        /// </summary>
        [HttpPost]
        [RequirePermission("TaxScheme", "Create")]
        public async Task<ActionResult<TaxSchemeDto>> CreateTaxScheme(CreateTaxSchemeDto createDto)
        {
            try
            {
                var taxScheme = await _taxSchemeService.CreateTaxSchemeAsync(createDto);
                return CreatedAtAction(nameof(GetTaxScheme), new { id = taxScheme.Id }, taxScheme);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tax scheme");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update an existing tax scheme
        /// </summary>
        [HttpPut("{id}")]
        [RequirePermission("TaxScheme", "Update")]
        public async Task<ActionResult<TaxSchemeDto>> UpdateTaxScheme(Guid id, UpdateTaxSchemeDto updateDto)
        {
            try
            {
                var taxScheme = await _taxSchemeService.UpdateTaxSchemeAsync(id, updateDto);
                if (taxScheme == null)
                {
                    return NotFound($"Tax scheme with ID {id} not found");
                }
                return Ok(taxScheme);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tax scheme with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a tax scheme
        /// </summary>
        [HttpDelete("{id}")]
        [RequirePermission("TaxScheme", "Delete")]
        public async Task<ActionResult> DeleteTaxScheme(Guid id)
        {
            try
            {
                var result = await _taxSchemeService.DeleteTaxSchemeAsync(id);
                if (!result)
                {
                    return NotFound($"Tax scheme with ID {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting tax scheme with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get active tax schemes
        /// </summary>
        [HttpGet("active")]
        [RequirePermission("TaxScheme", "Read")]
        public async Task<ActionResult<IEnumerable<TaxSchemeDto>>> GetActiveTaxSchemes()
        {
            try
            {
                var taxSchemes = await _taxSchemeService.GetActiveTaxSchemesAsync();
                return Ok(taxSchemes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active tax schemes");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get tax schemes by tax rate
        /// </summary>
        [HttpGet("by-tax-rate/{taxRateId}")]
        [RequirePermission("TaxScheme", "Read")]
        public async Task<ActionResult<IEnumerable<TaxSchemeDto>>> GetTaxSchemesByTaxRate(Guid taxRateId)
        {
            try
            {
                var taxSchemes = await _taxSchemeService.GetTaxSchemesByTaxRateAsync(taxRateId);
                return Ok(taxSchemes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tax schemes for tax rate ID: {TaxRateId}", taxRateId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
