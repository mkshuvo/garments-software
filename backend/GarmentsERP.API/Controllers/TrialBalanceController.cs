using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    /// <summary>
    /// Trial Balance Reporting API - Provides comprehensive financial reporting capabilities
    /// </summary>
    [ApiController]
    [Route("api/trial-balance")]
    [Authorize(Roles = "Admin,Manager")]
    [Produces("application/json")]
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
        /// Generate trial balance report for the specified date range
        /// </summary>
        /// <param name="request">Trial balance request parameters including date range and filtering options</param>
        /// <returns>Trial balance report with categorized account data and final calculation</returns>
        /// <response code="200">Returns the trial balance report with categorized account data</response>
        /// <response code="400">Invalid request parameters or date range validation failed</response>
        /// <response code="401">Unauthorized - Authentication required</response>
        /// <response code="403">Forbidden - Admin or Manager role required</response>
        /// <response code="500">Internal server error occurred during report generation</response>
        /// <example>
        /// GET /api/trial-balance?startDate=2024-01-01&amp;endDate=2024-01-31&amp;groupByCategory=true&amp;includeZeroBalances=false
        /// </example>
        [HttpGet]
        [ProducesResponseType(typeof(TrialBalanceResponseDto), 200)]
        [ProducesResponseType(typeof(ValidationErrorResponse), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> GetTrialBalance([FromQuery] TrialBalanceRequestDto request)
        {
            try
            {
                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                        );

                    return BadRequest(new ValidationErrorResponse
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = errors
                    });
                }

                // Validate date range
                if (!request.IsValid())
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Invalid date range. Start date must not be later than end date.",
                        ErrorCode = "INVALID_DATE_RANGE"
                    });
                }

                // Additional business rule validations
                if (request.StartDate == default || request.EndDate == default)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Start date and end date are required.",
                        ErrorCode = "MISSING_REQUIRED_DATES"
                    });
                }

                // Validate date range is not too large (performance consideration)
                var daysDifference = (request.EndDate - request.StartDate).Days;
                if (daysDifference > 365)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Date range cannot exceed 365 days for performance reasons.",
                        ErrorCode = "DATE_RANGE_TOO_LARGE"
                    });
                }

                _logger.LogInformation("Generating trial balance for date range {StartDate} to {EndDate}", 
                    request.StartDate, request.EndDate);

                var result = await _trialBalanceService.GenerateTrialBalanceAsync(request);

                _logger.LogInformation("Trial balance generated successfully with {TransactionCount} transactions", 
                    result.TotalTransactions);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument provided for trial balance generation");
                return BadRequest(new ErrorResponse
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = "INVALID_ARGUMENT"
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during trial balance generation");
                return BadRequest(new ErrorResponse
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = "INVALID_OPERATION"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating trial balance for date range {StartDate} to {EndDate}", 
                    request.StartDate, request.EndDate);
                
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Message = "An internal server error occurred while generating the trial balance report.",
                    ErrorCode = "INTERNAL_SERVER_ERROR"
                });
            }
        }

        /// <summary>
        /// Get account transaction details for drill-down functionality
        /// </summary>
        /// <param name="accountId">The unique identifier of the account</param>
        /// <param name="startDate">Start date for transaction filtering</param>
        /// <param name="endDate">End date for transaction filtering</param>
        /// <returns>List of account transactions with details for the specified date range</returns>
        /// <response code="200">Returns the list of account transactions</response>
        /// <response code="400">Invalid request parameters or date range validation failed</response>
        /// <response code="401">Unauthorized - Authentication required</response>
        /// <response code="403">Forbidden - Admin or Manager role required</response>
        /// <response code="404">Account not found</response>
        /// <response code="500">Internal server error occurred during transaction retrieval</response>
        [HttpGet("account/{accountId}/transactions")]
        [ProducesResponseType(typeof(List<AccountTransactionDto>), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> GetAccountTransactions(
            [FromRoute] Guid accountId, 
            [FromQuery, Required] DateTime startDate, 
            [FromQuery, Required] DateTime endDate)
        {
            try
            {
                // Validate account ID
                if (accountId == Guid.Empty)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Valid account ID is required.",
                        ErrorCode = "INVALID_ACCOUNT_ID"
                    });
                }

                // Validate date range
                if (startDate > endDate)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Start date must not be later than end date.",
                        ErrorCode = "INVALID_DATE_RANGE"
                    });
                }

                if (startDate == default || endDate == default)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Start date and end date are required.",
                        ErrorCode = "MISSING_REQUIRED_DATES"
                    });
                }

                _logger.LogInformation("Retrieving transactions for account {AccountId} from {StartDate} to {EndDate}",
                    accountId, startDate, endDate);

                var transactions = await _trialBalanceService.GetAccountTransactionsAsync(accountId, startDate, endDate);

                _logger.LogInformation("Retrieved {TransactionCount} transactions for account {AccountId}",
                    transactions.Count, accountId);

                return Ok(transactions);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument provided for account transactions retrieval");
                return BadRequest(new ErrorResponse
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = "INVALID_ARGUMENT"
                });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Account {AccountId} not found", accountId);
                return NotFound(new ErrorResponse
                {
                    Success = false,
                    Message = $"Account with ID {accountId} not found.",
                    ErrorCode = "ACCOUNT_NOT_FOUND"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving account transactions for account {AccountId}", accountId);
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Message = "An internal server error occurred while retrieving account transactions.",
                    ErrorCode = "INTERNAL_SERVER_ERROR"
                });
            }
        }

        /// <summary>
        /// Compare trial balances across different periods (Admin only)
        /// </summary>
        /// <param name="request">Comparison request containing two periods to compare</param>
        /// <returns>Trial balance comparison with variance analysis</returns>
        /// <response code="200">Returns the trial balance comparison with variance analysis</response>
        /// <response code="400">Invalid request parameters or date range validation failed</response>
        /// <response code="401">Unauthorized - Authentication required</response>
        /// <response code="403">Forbidden - Admin role required</response>
        /// <response code="500">Internal server error occurred during comparison</response>
        [HttpPost("compare")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(TrialBalanceComparisonDto), 200)]
        [ProducesResponseType(typeof(ValidationErrorResponse), 400)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> CompareTrialBalances([FromBody] CompareTrialBalancesRequest request)
        {
            try
            {
                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                        );

                    return BadRequest(new ValidationErrorResponse
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = errors
                    });
                }

                // Validate both periods
                if (!request.Period1.IsValid() || !request.Period2.IsValid())
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Invalid date ranges. Start date must not be later than end date for both periods.",
                        ErrorCode = "INVALID_DATE_RANGES"
                    });
                }

                // Validate periods don't overlap (business rule)
                if (request.Period1.EndDate >= request.Period2.StartDate && request.Period2.EndDate >= request.Period1.StartDate)
                {
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Comparison periods should not overlap for meaningful analysis.",
                        ErrorCode = "OVERLAPPING_PERIODS"
                    });
                }

                _logger.LogInformation("Comparing trial balances for periods {Period1Start}-{Period1End} and {Period2Start}-{Period2End}",
                    request.Period1.StartDate, request.Period1.EndDate, request.Period2.StartDate, request.Period2.EndDate);

                var comparison = await _trialBalanceService.CompareTrialBalancesAsync(request.Period1, request.Period2);

                _logger.LogInformation("Trial balance comparison completed with {VarianceCount} variances",
                    comparison.Variances.Count);

                return Ok(comparison);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument provided for trial balance comparison");
                return BadRequest(new ErrorResponse
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = "INVALID_ARGUMENT"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing trial balances");
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Message = "An internal server error occurred while comparing trial balances.",
                    ErrorCode = "INTERNAL_SERVER_ERROR"
                });
            }
        }

    }

    // Request DTOs for the new implementation
    public class CompareTrialBalancesRequest
    {
        [Required]
        public TrialBalanceRequestDto Period1 { get; set; } = new();

        [Required]
        public TrialBalanceRequestDto Period2 { get; set; } = new();
    }

    // Error response DTOs for API documentation
    public class ErrorResponse
    {
        public bool Success { get; set; } = false;
        public string Message { get; set; } = string.Empty;
        public string ErrorCode { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ValidationErrorResponse : ErrorResponse
    {
        public Dictionary<string, string[]> Errors { get; set; } = new();
    }
}