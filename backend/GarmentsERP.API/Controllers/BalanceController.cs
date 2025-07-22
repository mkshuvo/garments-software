using GarmentsERP.API.DTOs;
using GarmentsERP.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BalanceController : ControllerBase
    {
        private readonly IBalanceService _balanceService;
        private readonly ILogger<BalanceController> _logger;

        public BalanceController(IBalanceService balanceService, ILogger<BalanceController> logger)
        {
            _balanceService = balanceService;
            _logger = logger;
        }

        /// <summary>
        /// Get current bank balance
        /// </summary>
        [HttpGet("bank")]
        public async Task<IActionResult> GetBankBalance()
        {
            try
            {
                var balance = await _balanceService.GetBankBalanceAsync();
                return Ok(new { balance, currency = "BDT", lastUpdated = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bank balance");
                return StatusCode(500, new { error = "Failed to retrieve bank balance" });
            }
        }

        /// <summary>
        /// Get current cash on hand balance
        /// </summary>
        [HttpGet("cash")]
        public async Task<IActionResult> GetCashBalance()
        {
            try
            {
                var balance = await _balanceService.GetCashOnHandBalanceAsync();
                return Ok(new { balance, currency = "BDT", lastUpdated = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cash balance");
                return StatusCode(500, new { error = "Failed to retrieve cash balance" });
            }
        }

        /// <summary>
        /// Get comprehensive balance summary
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetBalanceSummary()
        {
            try
            {
                var summary = await _balanceService.GetBalanceSummaryAsync();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting balance summary");
                return StatusCode(500, new { error = "Failed to retrieve balance summary" });
            }
        }

        /// <summary>
        /// Get balance for specific account
        /// </summary>
        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetAccountBalance(Guid accountId)
        {
            try
            {
                var balance = await _balanceService.GetAccountBalanceAsync(accountId);
                return Ok(new { accountId, balance, currency = "BDT", lastUpdated = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting account balance for {AccountId}", accountId);
                return StatusCode(500, new { error = "Failed to retrieve account balance" });
            }
        }

        /// <summary>
        /// Get account balance as of specific date
        /// </summary>
        [HttpGet("account/{accountId}/as-of/{date}")]
        public async Task<IActionResult> GetAccountBalanceAsOfDate(Guid accountId, DateTime date)
        {
            try
            {
                var balance = await _balanceService.GetAccountBalanceAsOfDateAsync(accountId, date);
                return Ok(new { accountId, balance, asOfDate = date, currency = "BDT" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting account balance as of date for {AccountId}", accountId);
                return StatusCode(500, new { error = "Failed to retrieve historical account balance" });
            }
        }

        /// <summary>
        /// Get real-time account balance (no cache)
        /// </summary>
        [HttpGet("account/{accountId}/realtime")]
        public async Task<IActionResult> GetRealTimeAccountBalance(Guid accountId)
        {
            try
            {
                var balance = await _balanceService.GetRealTimeAccountBalanceAsync(accountId);
                return Ok(new { accountId, balance, currency = "BDT", lastUpdated = DateTime.UtcNow, isRealTime = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time account balance for {AccountId}", accountId);
                return StatusCode(500, new { error = "Failed to retrieve real-time account balance" });
            }
        }

        /// <summary>
        /// Refresh all balance caches (Admin only)
        /// </summary>
        [HttpPost("refresh-cache")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RefreshBalanceCache()
        {
            try
            {
                await _balanceService.RefreshBalanceCacheAsync();
                return Ok(new { message = "Balance cache refreshed successfully", timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing balance cache");
                return StatusCode(500, new { error = "Failed to refresh balance cache" });
            }
        }

        /// <summary>
        /// Clear cache for specific account (Admin only)
        /// </summary>
        [HttpDelete("cache/account/{accountId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ClearAccountBalanceCache(Guid accountId)
        {
            try
            {
                await _balanceService.ClearAccountBalanceCacheAsync(accountId);
                return Ok(new { message = "Account balance cache cleared successfully", accountId, timestamp = DateTime.UtcNow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing account balance cache for {AccountId}", accountId);
                return StatusCode(500, new { error = "Failed to clear account balance cache" });
            }
        }

        /// <summary>
        /// Get quick balance overview for dashboard
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardBalances()
        {
            try
            {
                var bankBalance = await _balanceService.GetBankBalanceAsync();
                var cashBalance = await _balanceService.GetCashOnHandBalanceAsync();
                
                return Ok(new
                {
                    bankBalance,
                    cashOnHand = cashBalance,
                    totalLiquidAssets = bankBalance + cashBalance,
                    currency = "BDT",
                    lastUpdated = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard balances");
                return StatusCode(500, new { error = "Failed to retrieve dashboard balances" });
            }
        }
    }
}