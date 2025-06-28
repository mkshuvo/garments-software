using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GarmentsERP.API.DTOs.Reports;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Reports;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportTemplateController : ControllerBase
    {
        private readonly IReportTemplateService _reportTemplateService;
        private readonly ILogger<ReportTemplateController> _logger;

        public ReportTemplateController(
            IReportTemplateService reportTemplateService,
            ILogger<ReportTemplateController> logger)
        {
            _reportTemplateService = reportTemplateService;
            _logger = logger;
        }

        /// <summary>
        /// Get all report templates
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReportTemplateDto>>> GetReportTemplates()
        {
            try
            {
                var templates = await _reportTemplateService.GetAllReportTemplatesAsync();
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report templates");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get report template by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ReportTemplateDto>> GetReportTemplate(Guid id)
        {
            try
            {
                var template = await _reportTemplateService.GetReportTemplateByIdAsync(id);
                if (template == null)
                {
                    return NotFound($"Report template with ID {id} not found");
                }
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report template with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new report template
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ReportTemplateDto>> CreateReportTemplate(CreateReportTemplateDto createDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return BadRequest("Invalid user ID");
                }

                var template = await _reportTemplateService.CreateReportTemplateAsync(createDto, userId);
                return CreatedAtAction(nameof(GetReportTemplate), new { id = template.Id }, template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating report template");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update an existing report template
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ReportTemplateDto>> UpdateReportTemplate(Guid id, UpdateReportTemplateDto updateDto)
        {
            try
            {
                var template = await _reportTemplateService.UpdateReportTemplateAsync(id, updateDto);
                if (template == null)
                {
                    return NotFound($"Report template with ID {id} not found");
                }
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating report template with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete a report template
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteReportTemplate(Guid id)
        {
            try
            {
                var result = await _reportTemplateService.DeleteReportTemplateAsync(id);
                if (!result)
                {
                    return NotFound($"Report template with ID {id} not found");
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting report template with ID: {Id}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get active report templates
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<ReportTemplateDto>>> GetActiveReportTemplates()
        {
            try
            {
                var templates = await _reportTemplateService.GetActiveReportTemplatesAsync();
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active report templates");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get report templates by type
        /// </summary>
        [HttpGet("by-type/{reportType}")]
        public async Task<ActionResult<IEnumerable<ReportTemplateDto>>> GetReportTemplatesByType(ReportType reportType)
        {
            try
            {
                var templates = await _reportTemplateService.GetReportTemplatesByTypeAsync(reportType);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report templates for type: {ReportType}", reportType);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get report templates by user
        /// </summary>
        [HttpGet("by-user/{userId}")]
        public async Task<ActionResult<IEnumerable<ReportTemplateDto>>> GetReportTemplatesByUser(Guid userId)
        {
            try
            {
                var templates = await _reportTemplateService.GetReportTemplatesByUserAsync(userId);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving report templates for user ID: {UserId}", userId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get current user's report templates
        /// </summary>
        [HttpGet("my-templates")]
        public async Task<ActionResult<IEnumerable<ReportTemplateDto>>> GetMyReportTemplates()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                {
                    return BadRequest("Invalid user ID");
                }

                var templates = await _reportTemplateService.GetReportTemplatesByUserAsync(userId);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user's report templates");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
