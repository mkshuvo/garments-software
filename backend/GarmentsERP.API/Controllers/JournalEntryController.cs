using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Attributes;

namespace GarmentsERP.API.Controllers
{
    /// <summary>
    /// Controller for journal entry management operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JournalEntryController : ControllerBase
    {
        private readonly IJournalEntryService _journalEntryService;
        private readonly ILogger<JournalEntryController> _logger;

        public JournalEntryController(
            IJournalEntryService journalEntryService,
            ILogger<JournalEntryController> logger)
        {
            _journalEntryService = journalEntryService;
            _logger = logger;
        }

        /// <summary>
        /// Get journal entries with advanced filtering, pagination, and optimization
        /// </summary>
        /// <param name="request">Filter and pagination parameters</param>
        /// <returns>Paginated journal entries with summary information</returns>
        [HttpGet]
        [RequirePermission("JournalEntry", "Read")]
        public async Task<IActionResult> GetJournalEntries([FromQuery] GetJournalEntriesRequest request)
        {
            try
            {
                var result = await _journalEntryService.GetJournalEntriesAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entries");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get detailed journal entry by ID
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <returns>Detailed journal entry information</returns>
        [HttpGet("{id:guid}")]
        [RequirePermission("JournalEntry", "Read")]
        public async Task<IActionResult> GetJournalEntryById(Guid id)
        {
            try
            {
                var result = await _journalEntryService.GetJournalEntryByIdAsync(id);
                
                if (result == null)
                {
                    return NotFound(new { Success = false, Message = "Journal entry not found" });
                }

                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entry by ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get journal entry statistics
        /// </summary>
        /// <param name="request">Statistics request parameters</param>
        /// <returns>Journal entry statistics</returns>
        [HttpGet("statistics")]
        [RequirePermission("JournalEntry", "Read")]
        public async Task<IActionResult> GetStatistics([FromQuery] JournalEntryStatisticsRequest request)
        {
            try
            {
                var result = await _journalEntryService.GetStatisticsAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting journal entry statistics");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Export journal entries to various formats
        /// </summary>
        /// <param name="request">Export request parameters</param>
        /// <returns>Export response with download information</returns>
        [HttpPost("export")]
        [RequirePermission("JournalEntry", "Export")]
        public async Task<IActionResult> ExportJournalEntries([FromBody] ExportJournalEntriesRequest request)
        {
            try
            {
                var result = await _journalEntryService.ExportJournalEntriesAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting journal entries");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Create a new journal entry
        /// </summary>
        /// <param name="request">Journal entry creation request</param>
        /// <returns>Created journal entry details</returns>
        [HttpPost]
        [RequirePermission("JournalEntry", "Create")]
        public async Task<IActionResult> CreateJournalEntry([FromBody] CreateJournalEntryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _journalEntryService.CreateJournalEntryAsync(request);
                return CreatedAtAction(nameof(GetJournalEntryById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating journal entry");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update an existing journal entry
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <param name="request">Update request</param>
        /// <returns>Updated journal entry details</returns>
        [HttpPut("{id:guid}")]
        [RequirePermission("JournalEntry", "Update")]
        public async Task<IActionResult> UpdateJournalEntry(Guid id, [FromBody] UpdateJournalEntryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _journalEntryService.UpdateJournalEntryAsync(id, request);
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating journal entry: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete a journal entry (soft delete)
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id:guid}")]
        [RequirePermission("JournalEntry", "Delete")]
        public async Task<IActionResult> DeleteJournalEntry(Guid id)
        {
            try
            {
                var result = await _journalEntryService.DeleteJournalEntryAsync(id);
                
                if (!result)
                {
                    return NotFound(new { Success = false, Message = "Journal entry not found" });
                }

                return Ok(new { Success = true, Message = "Journal entry deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting journal entry: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Approve a journal entry
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <param name="request">Approval request</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/approve")]
        [RequirePermission("JournalEntry", "Approve")]
        public async Task<IActionResult> ApproveJournalEntry(Guid id, [FromBody] ApprovalRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _journalEntryService.ApproveJournalEntryAsync(id, userId, request.Notes);
                
                if (!result)
                {
                    return NotFound(new { Success = false, Message = "Journal entry not found" });
                }

                return Ok(new { Success = true, Message = "Journal entry approved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving journal entry: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Reverse a journal entry
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <param name="request">Reversal request</param>
        /// <returns>Success status</returns>
        [HttpPatch("{id:guid}/reverse")]
        [RequirePermission("JournalEntry", "Reverse")]
        public async Task<IActionResult> ReverseJournalEntry(Guid id, [FromBody] ReversalRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Reason))
                {
                    return BadRequest(new { Success = false, Message = "Reversal reason is required" });
                }

                var userId = GetCurrentUserId();
                var result = await _journalEntryService.ReverseJournalEntryAsync(id, userId, request.Reason);
                
                if (!result)
                {
                    return NotFound(new { Success = false, Message = "Journal entry not found" });
                }

                return Ok(new { Success = true, Message = "Journal entry reversed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reversing journal entry: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get journal entry audit trail
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <returns>Audit trail entries</returns>
        [HttpGet("{id:guid}/audit-trail")]
        [RequirePermission("JournalEntry", "Read")]
        public async Task<IActionResult> GetAuditTrail(Guid id)
        {
            try
            {
                var result = await _journalEntryService.GetAuditTrailAsync(id);
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting audit trail for journal entry: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Validate journal entry balance
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <returns>Validation result</returns>
        [HttpGet("{id:guid}/validate")]
        [RequirePermission("JournalEntry", "Read")]
        public async Task<IActionResult> ValidateJournalEntry(Guid id)
        {
            try
            {
                var result = await _journalEntryService.ValidateJournalEntryAsync(id);
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating journal entry: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get journal entry categories for filtering
        /// </summary>
        /// <returns>List of available categories</returns>
        [HttpGet("categories")]
        [RequirePermission("JournalEntry", "Read")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var result = await _journalEntryService.GetCategoriesAsync();
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting categories");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get journal entry statuses for filtering
        /// </summary>
        /// <returns>List of available statuses</returns>
        [HttpGet("statuses")]
        [RequirePermission("JournalEntry", "Read")]
        public async Task<IActionResult> GetStatuses()
        {
            try
            {
                var result = await _journalEntryService.GetStatusesAsync();
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting statuses");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get journal entry types for filtering
        /// </summary>
        /// <returns>List of available types</returns>
        [HttpGet("types")]
        [RequirePermission("JournalEntry", "Read")]
        public async Task<IActionResult> GetTypes()
        {
            try
            {
                var result = await _journalEntryService.GetTypesAsync();
                return Ok(new { Success = true, Data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting types");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        #region Private Helper Methods

        private Guid GetCurrentUserId()
        {
            // TODO: Get from JWT token or authentication context
            // For now, return a default user ID
            return Guid.Parse("00000000-0000-0000-0000-000000000001");
        }

        #endregion
    }

    /// <summary>
    /// Approval request model
    /// </summary>
    public class ApprovalRequest
    {
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Reversal request model
    /// </summary>
    public class ReversalRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}

