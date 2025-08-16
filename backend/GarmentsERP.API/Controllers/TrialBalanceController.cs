using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

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
        private readonly ITrialBalanceAuditService _auditService;
        private readonly IInputSanitizationService _sanitizationService;
        private readonly IDataEncryptionService _encryptionService;
        private readonly ILogger<TrialBalanceController> _logger;

        public TrialBalanceController(
            ITrialBalanceService trialBalanceService,
            ITrialBalanceAuditService auditService,
            IInputSanitizationService sanitizationService,
            IDataEncryptionService encryptionService,
            ILogger<TrialBalanceController> logger)
        {
            _trialBalanceService = trialBalanceService;
            _auditService = auditService;
            _sanitizationService = sanitizationService;
            _encryptionService = encryptionService;
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
            var requestId = Guid.NewGuid().ToString("N")[..8];
            var startTime = DateTime.UtcNow;
            var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value ?? "unknown";
            var userName = User?.FindFirst("name")?.Value ?? User?.FindFirst("username")?.Value ?? "unknown";
            var userRole = User?.FindFirst("role")?.Value ?? "unknown";
            var ipAddress = GetClientIpAddress();
            var userAgent = _sanitizationService.SanitizeString(Request.Headers["User-Agent"].ToString(), 500);
            
            try
            {
                _logger.LogInformation("Starting trial balance generation {RequestId} for user {UserId} ({UserName}) with role {UserRole} from IP {IpAddress}", 
                    requestId, _encryptionService.MaskSensitiveData(userId), userName, userRole, ipAddress);

                // Enhanced model state validation
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .ToDictionary(
                            kvp => kvp.Key,
                            kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                        );

                    _logger.LogWarning("Model validation failed for request {RequestId}: {Errors}", 
                        requestId, JsonSerializer.Serialize(errors));

                    return BadRequest(new ValidationErrorResponse
                    {
                        Success = false,
                        Message = "Validation failed. Please check your input parameters.",
                        Errors = errors,
                        RequestId = requestId
                    });
                }

                // Enhanced business rule validation
                var validationErrors = request.GetValidationErrors();
                if (validationErrors.Any())
                {
                    _logger.LogWarning("Business rule validation failed for request {RequestId}: {Errors}", 
                        requestId, JsonSerializer.Serialize(validationErrors));

                    return BadRequest(new ValidationErrorResponse
                    {
                        Success = false,
                        Message = "Request validation failed.",
                        Errors = validationErrors.ToDictionary(e => "request", e => new[] { e }),
                        RequestId = requestId
                    });
                }

                // Additional security validations
                if (request.StartDate < DateTime.Now.AddYears(-10))
                {
                    _logger.LogWarning("Request {RequestId} attempted to access data older than 10 years", requestId);
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Cannot generate reports for dates older than 10 years.",
                        ErrorCode = "DATE_TOO_OLD",
                        RequestId = requestId
                    });
                }

                if (request.EndDate > DateTime.Now.AddDays(1))
                {
                    _logger.LogWarning("Request {RequestId} attempted to access future dates", requestId);
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Cannot generate reports for future dates.",
                        ErrorCode = "FUTURE_DATE_NOT_ALLOWED",
                        RequestId = requestId
                    });
                }

                // Performance validation - warn for large date ranges
                var daysDifference = (request.EndDate - request.StartDate).Days;
                if (daysDifference > 90)
                {
                    _logger.LogInformation("Large date range requested {RequestId}: {Days} days", 
                        requestId, daysDifference);
                }

                var result = await _trialBalanceService.GenerateTrialBalanceAsync(request);
                var executionTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

                _logger.LogInformation("Trial balance generated successfully {RequestId} with {TransactionCount} transactions in {ExecutionTime}ms", 
                    requestId, result.TotalTransactions, executionTime);

                // Log successful audit
                await _auditService.LogTrialBalanceGenerationAsync(
                    userId, userName, userRole, request.StartDate, request.EndDate,
                    requestId, ipAddress, userAgent, result.TotalTransactions, result.FinalBalance,
                    null, null, true, executionTime);

                // Add request ID to response for tracking
                Response.Headers["X-Request-ID"] = requestId;

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                var executionTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
                var sanitizedMessage = _sanitizationService.SanitizeString(ex.Message, 500);
                
                _logger.LogWarning(ex, "Invalid argument provided for trial balance generation {RequestId}", requestId);
                
                // Log failed audit
                await _auditService.LogTrialBalanceGenerationAsync(
                    userId, userName, userRole, request.StartDate, request.EndDate,
                    requestId, ipAddress, userAgent, null, null, null, sanitizedMessage, false, executionTime);
                
                return BadRequest(new ErrorResponse
                {
                    Success = false,
                    Message = "Invalid request parameters provided.",
                    ErrorCode = "INVALID_ARGUMENT",
                    RequestId = requestId
                });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during trial balance generation {RequestId}", requestId);
                return BadRequest(new ErrorResponse
                {
                    Success = false,
                    Message = ex.Message,
                    ErrorCode = "INVALID_OPERATION",
                    RequestId = requestId
                });
            }
            catch (TimeoutException ex)
            {
                _logger.LogError(ex, "Timeout occurred during trial balance generation {RequestId}", requestId);
                return StatusCode(408, new ErrorResponse
                {
                    Success = false,
                    Message = "The request timed out. Please try with a smaller date range or try again later.",
                    ErrorCode = "REQUEST_TIMEOUT",
                    RequestId = requestId
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for trial balance {RequestId}", requestId);
                return StatusCode(403, new ErrorResponse
                {
                    Success = false,
                    Message = "You do not have permission to access this data.",
                    ErrorCode = "ACCESS_DENIED",
                    RequestId = requestId
                });
            }
            catch (Exception ex)
            {
                var executionTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
                var sanitizedMessage = _sanitizationService.SanitizeString(ex.Message, 500);
                
                _logger.LogError(ex, "Unexpected error generating trial balance {RequestId} for user {UserId}", 
                    requestId, _encryptionService.MaskSensitiveData(userId));
                
                // Log failed audit without exposing sensitive error details
                await _auditService.LogTrialBalanceGenerationAsync(
                    userId, userName, userRole, request.StartDate, request.EndDate,
                    requestId, ipAddress, userAgent, null, null, null, "Internal server error", false, executionTime);
                
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Message = "An internal server error occurred while generating the trial balance report. Please try again later.",
                    ErrorCode = "INTERNAL_SERVER_ERROR",
                    RequestId = requestId
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
            var requestId = Guid.NewGuid().ToString("N")[..8];
            var startTime = DateTime.UtcNow;
            var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value ?? "unknown";
            var userName = User?.FindFirst("name")?.Value ?? User?.FindFirst("username")?.Value ?? "unknown";
            var userRole = User?.FindFirst("role")?.Value ?? "unknown";
            var ipAddress = GetClientIpAddress();
            var userAgent = _sanitizationService.SanitizeString(Request.Headers["User-Agent"].ToString(), 500);
            
            try
            {
                // Validate account ID
                if (accountId == Guid.Empty)
                {
                    await _auditService.LogAccountDrillDownAsync(
                        userId, userName, userRole, accountId, startDate, endDate,
                        requestId, ipAddress, userAgent, null, "Invalid account ID", false, 0);
                    
                    return BadRequest(new ErrorResponse
                    {
                        Success = false,
                        Message = "Valid account ID is required.",
                        ErrorCode = "INVALID_ACCOUNT_ID",
                        RequestId = requestId
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

                _logger.LogInformation("Retrieving transactions for account {AccountId} from {StartDate} to {EndDate} for user {UserId}",
                    accountId, startDate, endDate, _encryptionService.MaskSensitiveData(userId));

                var transactions = await _trialBalanceService.GetAccountTransactionsAsync(accountId, startDate, endDate);
                var executionTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

                _logger.LogInformation("Retrieved {TransactionCount} transactions for account {AccountId} in {ExecutionTime}ms",
                    transactions.Count, accountId, executionTime);

                // Log successful audit
                await _auditService.LogAccountDrillDownAsync(
                    userId, userName, userRole, accountId, startDate, endDate,
                    requestId, ipAddress, userAgent, transactions.Count, null, true, executionTime);

                Response.Headers["X-Request-ID"] = requestId;
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
                var executionTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
                
                _logger.LogError(ex, "Error retrieving account transactions for account {AccountId} for user {UserId}", 
                    accountId, _encryptionService.MaskSensitiveData(userId));
                
                // Log failed audit
                await _auditService.LogAccountDrillDownAsync(
                    userId, userName, userRole, accountId, startDate, endDate,
                    requestId, ipAddress, userAgent, null, "Internal server error", false, executionTime);
                
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Message = "An internal server error occurred while retrieving account transactions.",
                    ErrorCode = "INTERNAL_SERVER_ERROR",
                    RequestId = requestId
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
            var requestId = Guid.NewGuid().ToString("N")[..8];
            var startTime = DateTime.UtcNow;
            var userId = User?.FindFirst("sub")?.Value ?? User?.FindFirst("id")?.Value ?? "unknown";
            var userName = User?.FindFirst("name")?.Value ?? User?.FindFirst("username")?.Value ?? "unknown";
            var userRole = User?.FindFirst("role")?.Value ?? "unknown";
            var ipAddress = GetClientIpAddress();
            var userAgent = _sanitizationService.SanitizeString(Request.Headers["User-Agent"].ToString(), 500);
            
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

                _logger.LogInformation("Comparing trial balances for periods {Period1Start}-{Period1End} and {Period2Start}-{Period2End} for user {UserId}",
                    request.Period1.StartDate, request.Period1.EndDate, request.Period2.StartDate, request.Period2.EndDate, 
                    _encryptionService.MaskSensitiveData(userId));

                var comparison = await _trialBalanceService.CompareTrialBalancesAsync(request.Period1, request.Period2);
                var executionTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

                _logger.LogInformation("Trial balance comparison completed with {VarianceCount} variances in {ExecutionTime}ms",
                    comparison.Variances.Count, executionTime);

                // Log successful audit
                await _auditService.LogTrialBalanceComparisonAsync(
                    userId, userName, userRole, request.Period1.StartDate, request.Period1.EndDate,
                    request.Period2.StartDate, request.Period2.EndDate, requestId, ipAddress, userAgent,
                    $"Variances: {comparison.Variances.Count}", null, true, executionTime);

                Response.Headers["X-Request-ID"] = requestId;
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
                var executionTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;
                
                _logger.LogError(ex, "Error comparing trial balances for user {UserId}", 
                    _encryptionService.MaskSensitiveData(userId));
                
                // Log failed audit
                await _auditService.LogTrialBalanceComparisonAsync(
                    userId, userName, userRole, request.Period1.StartDate, request.Period1.EndDate,
                    request.Period2.StartDate, request.Period2.EndDate, requestId, ipAddress, userAgent,
                    null, "Internal server error", false, executionTime);
                
                return StatusCode(500, new ErrorResponse
                {
                    Success = false,
                    Message = "An internal server error occurred while comparing trial balances.",
                    ErrorCode = "INTERNAL_SERVER_ERROR",
                    RequestId = requestId
                });
            }
        }

        /// <summary>
        /// Get client IP address from request headers or connection
        /// </summary>
        private string GetClientIpAddress()
        {
            // Check for forwarded IP addresses (common in load balancer scenarios)
            var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                var ips = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries);
                if (ips.Length > 0)
                {
                    return _sanitizationService.SanitizeString(ips[0].Trim(), 45);
                }
            }

            var realIp = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp))
            {
                return _sanitizationService.SanitizeString(realIp, 45);
            }

            var connectionIp = HttpContext.Connection.RemoteIpAddress?.ToString();
            return _sanitizationService.SanitizeString(connectionIp ?? "unknown", 45);
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

    // Enhanced error response DTOs for API documentation
    public class ErrorResponse
    {
        public bool Success { get; set; } = false;
        public string Message { get; set; } = string.Empty;
        public string ErrorCode { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? RequestId { get; set; }
        public Dictionary<string, object>? Details { get; set; }
    }

    public class ValidationErrorResponse : ErrorResponse
    {
        public Dictionary<string, string[]> Errors { get; set; } = new();
        public string[]? Warnings { get; set; }
    }
}