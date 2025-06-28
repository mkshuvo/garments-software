using GarmentsERP.API.DTOs.Currency;
using GarmentsERP.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CurrencyController : ControllerBase
    {
        private readonly ICurrencyService _currencyService;
        private readonly ILogger<CurrencyController> _logger;

        public CurrencyController(ICurrencyService currencyService, ILogger<CurrencyController> logger)
        {
            _currencyService = currencyService;
            _logger = logger;
        }

        /// <summary>
        /// Get all currencies
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CurrencyResponseDto>>> GetAll()
        {
            try
            {
                var currencies = await _currencyService.GetAllAsync();
                return Ok(currencies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting all currencies");
                return StatusCode(500, new { message = "An error occurred while retrieving currencies." });
            }
        }

        /// <summary>
        /// Get currency by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CurrencyResponseDto>> GetById(Guid id)
        {
            try
            {
                var currency = await _currencyService.GetByIdAsync(id);
                if (currency == null)
                    return NotFound(new { message = "Currency not found." });

                return Ok(currency);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while getting currency with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while retrieving the currency." });
            }
        }

        /// <summary>
        /// Create a new currency
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CurrencyResponseDto>> Create(CreateCurrencyDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Check if currency code already exists
                if (await _currencyService.CodeExistsAsync(createDto.Code))
                    return Conflict(new { message = "Currency code already exists." });

                var currency = await _currencyService.CreateAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = currency.Id }, currency);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating currency");
                return StatusCode(500, new { message = "An error occurred while creating the currency." });
            }
        }

        /// <summary>
        /// Update an existing currency
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CurrencyResponseDto>> Update(Guid id, UpdateCurrencyDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Check if currency code already exists (excluding current currency)
                if (await _currencyService.CodeExistsAsync(updateDto.Code, id))
                    return Conflict(new { message = "Currency code already exists." });

                var currency = await _currencyService.UpdateAsync(id, updateDto);
                if (currency == null)
                    return NotFound(new { message = "Currency not found." });

                return Ok(currency);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating currency with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while updating the currency." });
            }
        }

        /// <summary>
        /// Delete a currency
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var deleted = await _currencyService.DeleteAsync(id);
                if (!deleted)
                    return NotFound(new { message = "Currency not found." });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting currency with ID {Id}", id);
                return StatusCode(500, new { message = "An error occurred while deleting the currency." });
            }
        }

        /// <summary>
        /// Check if currency exists
        /// </summary>
        [HttpHead("{id}")]
        public async Task<ActionResult> Exists(Guid id)
        {
            try
            {
                var exists = await _currencyService.ExistsAsync(id);
                return exists ? Ok() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking if currency exists with ID {Id}", id);
                return StatusCode(500);
            }
        }
    }
}
