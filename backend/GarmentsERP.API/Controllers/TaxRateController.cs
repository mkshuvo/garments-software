using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.DTOs.Tax;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaxRateController : ControllerBase
    {
        private readonly ITaxRateService _taxRateService;
        private readonly ILogger<TaxRateController> _logger;

        public TaxRateController(
            ITaxRateService taxRateService,
            ILogger<TaxRateController> logger)
        {
            _taxRateService = taxRateService;
            _logger = logger;
        }

        /// <summary>
        /// Get all tax rates
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaxRateResponseDto>>> GetTaxRates()
        {
            try
            {
                var taxRates = await _taxRateService.GetAllTaxRatesAsync();
                return Ok(taxRates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tax rates");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get tax rate by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TaxRateResponseDto>> GetTaxRate(Guid id)
        {
            try
            {
                var taxRate = await _taxRateService.GetTaxRateByIdAsync(id);
                if (taxRate == null)
                {
                    return NotFound($"Tax rate with ID {id} not found");
                }
                return Ok(taxRate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving tax rate with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new tax rate
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TaxRateResponseDto>> CreateTaxRate(CreateTaxRateDto createDto)
        {
            try
            {
                var taxRate = await _taxRateService.CreateTaxRateAsync(createDto);
                return CreatedAtAction(nameof(GetTaxRate), new { id = taxRate.Id }, taxRate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tax rate");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update an existing tax rate
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<TaxRateResponseDto>> UpdateTaxRate(Guid id, UpdateTaxRateDto updateDto)
        {
            try
            {
                var taxRate = await _taxRateService.UpdateTaxRateAsync(id, updateDto);
                if (taxRate == null)
                {
                    return NotFound($"Tax rate with ID {id} not found");
                }
                return Ok(taxRate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tax rate with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a tax rate
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTaxRate(Guid id)
        {
            try
            {
                var result = await _taxRateService.DeleteTaxRateAsync(id);
                if (!result)
                {
                    return NotFound($"Tax rate with ID {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting tax rate with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get active tax rates
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<TaxRateResponseDto>>> GetActiveTaxRates()
        {
            try
            {
                var taxRates = await _taxRateService.GetActiveTaxRatesAsync();
                return Ok(taxRates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active tax rates");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
