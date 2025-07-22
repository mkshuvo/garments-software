using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TrialBalanceController : ControllerBase
    {
        private readonly ITrialBalanceService _trialBalanceService;
        private readonly ILogger<TrialBalanceController> _logger;

        public TrialBalanceController(
            ITrialBalanceService trialBalanceService,
            ILogger<TrialBalanceController> logger)
        {
            _trialBalanceService = trialBalanceService;
            _logger = logger;
        }

        /// <summary>
        /// Generate a new trial balance for the specified period
        /// </summary>
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateTrialBalance([FromBody] GenerateTrialBalanceRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _trialBalanceService.GenerateTrialBalanceAsync(
                    request.Year, 
                    request.Month, 
                    request.CompanyName, 
                    request.CompanyAddress);

                if (!result.Success)
                {
                    return BadRequest(new { 
                        Success = false, 
                        Message = result.Message, 
                        Errors = result.Errors 
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating trial balance for {Year}/{Month}", request.Year, request.Month);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get trial balance history with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetTrialBalanceHistory([FromQuery] TrialBalanceFilterRequest filter)
        {
            try
            {
                var result = await _trialBalanceService.GetTrialBalanceHistoryAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trial balance history");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get a specific trial balance by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTrialBalance(Guid id)
        {
            try
            {
                var trialBalance = await _trialBalanceService.GetTrialBalanceByIdAsync(id);

                if (trialBalance == null)
                {
                    return NotFound(new { Success = false, Message = "Trial balance not found" });
                }

                return Ok(trialBalance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trial balance with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Compare two trial balances
        /// </summary>
        [HttpPost("compare")]
        public async Task<IActionResult> CompareTrialBalances([FromBody] CompareTrialBalancesRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _trialBalanceService.CompareTrialBalancesAsync(
                    request.TrialBalance1Id, 
                    request.TrialBalance2Id);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing trial balances");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Approve a trial balance
        /// </summary>
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> ApproveTrialBalance(Guid id, [FromBody] ApproveTrialBalanceRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _trialBalanceService.ApproveTrialBalanceAsync(id, userId, request.Notes);

                if (!result.Success)
                {
                    return BadRequest(new { 
                        Success = false, 
                        Message = result.Message, 
                        Errors = result.Errors 
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving trial balance with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update trial balance notes
        /// </summary>
        [HttpPatch("{id}/notes")]
        public async Task<IActionResult> UpdateNotes(Guid id, [FromBody] UpdateNotesRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Notes))
                {
                    return BadRequest(new { Success = false, Message = "Notes cannot be empty" });
                }

                var result = await _trialBalanceService.UpdateNotesAsync(id, request.Notes);

                if (!result.Success)
                {
                    return BadRequest(new { 
                        Success = false, 
                        Message = result.Message, 
                        Errors = result.Errors 
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating trial balance notes for ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Delete a trial balance (only drafts can be deleted)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrialBalance(Guid id)
        {
            try
            {
                var success = await _trialBalanceService.DeleteTrialBalanceAsync(id);

                if (!success)
                {
                    return NotFound(new { Success = false, Message = "Trial balance not found" });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Success = false, Message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting trial balance with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Validate a trial balance
        /// </summary>
        [HttpPost("{id}/validate")]
        public async Task<IActionResult> ValidateTrialBalance(Guid id)
        {
            try
            {
                var result = await _trialBalanceService.ValidateTrialBalanceAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating trial balance with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Export trial balance as PDF
        /// </summary>
        [HttpGet("{id}/export/pdf")]
        public async Task<IActionResult> ExportToPdf(Guid id)
        {
            try
            {
                var trialBalance = await _trialBalanceService.GetTrialBalanceByIdAsync(id);

                if (trialBalance == null)
                {
                    return NotFound(new { Success = false, Message = "Trial balance not found" });
                }

                // TODO: Implement PDF generation
                // For now, return a placeholder response
                return Ok(new { 
                    Success = true, 
                    Message = "PDF export functionality will be implemented in Task 7.1",
                    DownloadUrl = $"/api/TrialBalance/{id}/export/pdf"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting trial balance to PDF for ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Export trial balance as Excel
        /// </summary>
        [HttpGet("{id}/export/excel")]
        public async Task<IActionResult> ExportToExcel(Guid id)
        {
            try
            {
                var trialBalance = await _trialBalanceService.GetTrialBalanceByIdAsync(id);

                if (trialBalance == null)
                {
                    return NotFound(new { Success = false, Message = "Trial balance not found" });
                }

                // TODO: Implement Excel generation
                // For now, return a placeholder response
                return Ok(new { 
                    Success = true, 
                    Message = "Excel export functionality will be implemented in Task 7.1",
                    DownloadUrl = $"/api/TrialBalance/{id}/export/excel"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting trial balance to Excel for ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get trial balance summary statistics
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics([FromQuery] int? year = null)
        {
            try
            {
                var currentYear = year ?? DateTime.Now.Year;
                
                var filter = new TrialBalanceFilterRequest
                {
                    Year = currentYear,
                    PageSize = 12, // Get all months
                    Page = 1
                };

                var result = await _trialBalanceService.GetTrialBalanceHistoryAsync(filter);

                var statistics = new
                {
                    Year = currentYear,
                    TotalTrialBalances = result.TotalCount,
                    ApprovedCount = result.Items.Count(tb => tb.Status == Models.Accounting.TrialBalanceStatus.Approved),
                    DraftCount = result.Items.Count(tb => tb.Status == Models.Accounting.TrialBalanceStatus.Draft),
                    GeneratedCount = result.Items.Count(tb => tb.Status == Models.Accounting.TrialBalanceStatus.Generated),
                    MonthlyBreakdown = result.Items
                        .GroupBy(tb => tb.Month)
                        .Select(g => new
                        {
                            Month = g.Key,
                            Count = g.Count(),
                            IsBalanced = g.All(tb => tb.IsBalanced),
                            TotalDebits = g.Sum(tb => tb.TotalDebits),
                            TotalCredits = g.Sum(tb => tb.TotalCredits)
                        })
                        .OrderBy(x => x.Month)
                        .ToList()
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trial balance statistics");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get available periods for trial balance generation
        /// </summary>
        [HttpGet("available-periods")]
        public async Task<IActionResult> GetAvailablePeriods()
        {
            try
            {
                var currentYear = DateTime.Now.Year;
                var currentMonth = DateTime.Now.Month;

                // Get existing trial balances to determine available periods
                var filter = new TrialBalanceFilterRequest
                {
                    PageSize = 100,
                    Page = 1
                };

                var existingTrialBalances = await _trialBalanceService.GetTrialBalanceHistoryAsync(filter);
                var existingPeriods = existingTrialBalances.Items
                    .Select(tb => new { tb.Year, tb.Month })
                    .ToHashSet();

                var availablePeriods = new List<object>();

                // Generate available periods for current and previous years
                for (int year = currentYear; year >= currentYear - 2; year--)
                {
                    var maxMonth = (year == currentYear) ? currentMonth : 12;
                    
                    for (int month = 1; month <= maxMonth; month++)
                    {
                        var isGenerated = existingPeriods.Contains(new { Year = year, Month = month });
                        
                        availablePeriods.Add(new
                        {
                            Year = year,
                            Month = month,
                            MonthName = new DateTime(year, month, 1).ToString("MMMM"),
                            IsGenerated = isGenerated,
                            CanGenerate = !isGenerated
                        });
                    }
                }

                return Ok(availablePeriods.OrderByDescending(p => ((dynamic)p).Year)
                                        .ThenByDescending(p => ((dynamic)p).Month));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available periods");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        private Guid GetCurrentUserId()
        {
            // TODO: Get from JWT token or authentication context
            return Guid.Parse("00000000-0000-0000-0000-000000000001");
        }
    }

    // Request DTOs
    public class GenerateTrialBalanceRequest
    {
        [Required]
        [Range(2020, 2030)]
        public int Year { get; set; }

        [Required]
        [Range(1, 12)]
        public int Month { get; set; }

        [Required]
        [StringLength(200)]
        public string CompanyName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? CompanyAddress { get; set; }
    }

    public class CompareTrialBalancesRequest
    {
        [Required]
        public Guid TrialBalance1Id { get; set; }

        [Required]
        public Guid TrialBalance2Id { get; set; }
    }

    public class ApproveTrialBalanceRequest
    {
        [StringLength(1000)]
        public string? Notes { get; set; }
    }

    public class UpdateNotesRequest
    {
        [Required]
        [StringLength(1000)]
        public string Notes { get; set; } = string.Empty;
    }
}