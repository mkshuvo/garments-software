using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GarmentsERP.API.DTOs.Settings;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Settings;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BusinessSettingController : ControllerBase
    {
        private readonly IBusinessSettingService _businessSettingService;
        private readonly ILogger<BusinessSettingController> _logger;

        public BusinessSettingController(
            IBusinessSettingService businessSettingService,
            ILogger<BusinessSettingController> logger)
        {
            _businessSettingService = businessSettingService;
            _logger = logger;
        }

        /// <summary>
        /// Get all business settings
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BusinessSettingDto>>> GetBusinessSettings()
        {
            try
            {
                var settings = await _businessSettingService.GetAllBusinessSettingsAsync();
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving business settings");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get business setting by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<BusinessSettingDto>> GetBusinessSetting(Guid id)
        {
            try
            {
                var setting = await _businessSettingService.GetBusinessSettingByIdAsync(id);
                if (setting == null)
                {
                    return NotFound($"Business setting with ID {id} not found");
                }
                return Ok(setting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving business setting with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get business setting by key
        /// </summary>
        [HttpGet("by-key/{key}")]
        public async Task<ActionResult<BusinessSettingDto>> GetBusinessSettingByKey(string key)
        {
            try
            {
                var setting = await _businessSettingService.GetBusinessSettingByKeyAsync(key);
                if (setting == null)
                {
                    return NotFound($"Business setting with key '{key}' not found");
                }
                return Ok(setting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving business setting with key: {Key}", key);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new business setting
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<BusinessSettingDto>> CreateBusinessSetting(CreateBusinessSettingDto createDto)
        {
            try
            {
                var setting = await _businessSettingService.CreateBusinessSettingAsync(createDto);
                return CreatedAtAction(nameof(GetBusinessSetting), new { id = setting.Id }, setting);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating business setting");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update an existing business setting
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<BusinessSettingDto>> UpdateBusinessSetting(Guid id, UpdateBusinessSettingDto updateDto)
        {
            try
            {
                var setting = await _businessSettingService.UpdateBusinessSettingAsync(id, updateDto);
                if (setting == null)
                {
                    return NotFound($"Business setting with ID {id} not found");
                }
                return Ok(setting);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating business setting with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a business setting
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteBusinessSetting(Guid id)
        {
            try
            {
                var result = await _businessSettingService.DeleteBusinessSettingAsync(id);
                if (!result)
                {
                    return NotFound($"Business setting with ID {id} not found");
                }
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting business setting with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get business settings by category
        /// </summary>
        [HttpGet("by-category/{category}")]
        public async Task<ActionResult<IEnumerable<BusinessSettingDto>>> GetBusinessSettingsByCategory(SettingCategory category)
        {
            try
            {
                var settings = await _businessSettingService.GetBusinessSettingsByCategoryAsync(category);
                return Ok(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving business settings for category: {Category}", category);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get setting value by key
        /// </summary>
        [HttpGet("value/{key}")]
        public async Task<ActionResult<string>> GetSettingValue(string key)
        {
            try
            {
                var value = await _businessSettingService.GetSettingValueAsync(key);
                if (value == null)
                {
                    return NotFound($"Setting with key '{key}' not found");
                }
                return Ok(value);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving setting value for key: {Key}", key);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update setting value by key
        /// </summary>
        [HttpPut("value/{key}")]
        public async Task<ActionResult> UpdateSettingValue(string key, [FromBody] string value)
        {
            try
            {
                var result = await _businessSettingService.UpdateSettingValueAsync(key, value);
                if (!result)
                {
                    return NotFound($"Setting with key '{key}' not found");
                }
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating setting value for key: {Key}", key);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
