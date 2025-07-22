using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Accounting;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace GarmentsERP.API.Services
{
    public class BalanceService : IBalanceService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<BalanceService> _logger;
        private readonly IDatabase _database;

        // Cache keys
        private const string BANK_BALANCE_KEY = "balance:bank";
        private const string CASH_BALANCE_KEY = "balance:cash";
        private const string ACCOUNT_BALANCE_PREFIX = "balance:account:";
        private const string BALANCE_SUMMARY_KEY = "balance:summary";
        
        // Cache expiration times
        private readonly TimeSpan _shortCacheExpiry = TimeSpan.FromMinutes(5);
        private readonly TimeSpan _longCacheExpiry = TimeSpan.FromMinutes(30);

        public BalanceService(
            ApplicationDbContext context,
            IConnectionMultiplexer redis,
            ILogger<BalanceService> logger)
        {
            _context = context;
            _redis = redis;
            _logger = logger;
            _database = redis.GetDatabase();
        }

        public async Task<decimal> GetBankBalanceAsync()
        {
            try
            {
                // Try to get from cache first
                var cachedBalance = await _database.StringGetAsync(BANK_BALANCE_KEY);
                if (cachedBalance.HasValue)
                {
                    _logger.LogDebug("Bank balance retrieved from cache: {Balance}", cachedBalance);
                    return (decimal)cachedBalance;
                }

                // Get from database
                var bankBalance = await CalculateBankBalanceFromDatabase();
                
                // Cache the result
                await _database.StringSetAsync(BANK_BALANCE_KEY, bankBalance.ToString(), _shortCacheExpiry);
                
                _logger.LogDebug("Bank balance calculated from database and cached: {Balance}", bankBalance);
                return bankBalance;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bank balance");
                // Fallback to database if Redis fails
                return await CalculateBankBalanceFromDatabase();
            }
        }

        public async Task<decimal> GetCashOnHandBalanceAsync()
        {
            try
            {
                // Try to get from cache first
                var cachedBalance = await _database.StringGetAsync(CASH_BALANCE_KEY);
                if (cachedBalance.HasValue)
                {
                    _logger.LogDebug("Cash balance retrieved from cache: {Balance}", cachedBalance);
                    return (decimal)cachedBalance;
                }

                // Get from database
                var cashBalance = await CalculateCashBalanceFromDatabase();
                
                // Cache the result
                await _database.StringSetAsync(CASH_BALANCE_KEY, cashBalance.ToString(), _shortCacheExpiry);
                
                _logger.LogDebug("Cash balance calculated from database and cached: {Balance}", cashBalance);
                return cashBalance;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cash balance");
                // Fallback to database if Redis fails
                return await CalculateCashBalanceFromDatabase();
            }
        }

        public async Task<BalanceSummaryDto> GetBalanceSummaryAsync()
        {
            try
            {
                // Try to get from cache first
                var cachedSummary = await _database.StringGetAsync(BALANCE_SUMMARY_KEY);
                if (cachedSummary.HasValue)
                {
                    var summary = JsonSerializer.Deserialize<BalanceSummaryDto>(cachedSummary!);
                    if (summary != null)
                    {
                        summary.IsFromCache = true;
                        _logger.LogDebug("Balance summary retrieved from cache");
                        return summary;
                    }
                }

                // Calculate from database
                var balanceSummary = await CalculateBalanceSummaryFromDatabase();
                
                // Cache the result
                var serializedSummary = JsonSerializer.Serialize(balanceSummary);
                await _database.StringSetAsync(BALANCE_SUMMARY_KEY, serializedSummary, _longCacheExpiry);
                
                _logger.LogDebug("Balance summary calculated from database and cached");
                return balanceSummary;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting balance summary");
                // Fallback to database if Redis fails
                return await CalculateBalanceSummaryFromDatabase();
            }
        }

        public async Task<decimal> GetAccountBalanceAsync(Guid accountId)
        {
            try
            {
                var cacheKey = $"{ACCOUNT_BALANCE_PREFIX}{accountId}";
                
                // Try to get from cache first
                var cachedBalance = await _database.StringGetAsync(cacheKey);
                if (cachedBalance.HasValue)
                {
                    _logger.LogDebug("Account balance retrieved from cache for {AccountId}: {Balance}", accountId, cachedBalance);
                    return (decimal)cachedBalance;
                }

                // Get from database
                var balance = await CalculateAccountBalanceFromDatabase(accountId);
                
                // Cache the result
                await _database.StringSetAsync(cacheKey, balance.ToString(), _shortCacheExpiry);
                
                _logger.LogDebug("Account balance calculated from database and cached for {AccountId}: {Balance}", accountId, balance);
                return balance;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting account balance for {AccountId}", accountId);
                // Fallback to database if Redis fails
                return await CalculateAccountBalanceFromDatabase(accountId);
            }
        }

        public async Task<decimal> GetAccountBalanceAsOfDateAsync(Guid accountId, DateTime asOfDate)
        {
            // For historical balances, we don't cache as they don't change
            return await CalculateAccountBalanceFromDatabase(accountId, asOfDate);
        }

        public async Task<decimal> GetRealTimeAccountBalanceAsync(Guid accountId)
        {
            // For real-time validation, always get fresh data from database
            return await CalculateAccountBalanceFromDatabase(accountId);
        }

        public async Task UpdateBalanceCacheAsync(Guid accountId, decimal amount, bool isDebit)
        {
            try
            {
                var cacheKey = $"{ACCOUNT_BALANCE_PREFIX}{accountId}";
                
                // Get current cached balance
                var currentBalance = await _database.StringGetAsync(cacheKey);
                if (currentBalance.HasValue)
                {
                    // Update the cached balance
                    decimal newBalance = (decimal)currentBalance;
                    if (isDebit)
                        newBalance += amount;
                    else
                        newBalance -= amount;
                    
                    await _database.StringSetAsync(cacheKey, newBalance.ToString(), _shortCacheExpiry);
                    _logger.LogDebug("Updated cached balance for account {AccountId}: {NewBalance}", accountId, newBalance);
                }

                // Clear summary cache as it's now stale
                await _database.KeyDeleteAsync(BALANCE_SUMMARY_KEY);
                
                // Update bank/cash cache if applicable
                await UpdateSpecialAccountCaches(accountId, amount, isDebit);
                
                _logger.LogDebug("Balance cache updated for account {AccountId}", accountId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating balance cache for account {AccountId}", accountId);
            }
        }

        public async Task RefreshBalanceCacheAsync()
        {
            try
            {
                _logger.LogInformation("Refreshing all balance caches");

                // Clear all balance-related cache keys
                var server = _redis.GetServer(_redis.GetEndPoints().First());
                var keys = server.Keys(pattern: "balance:*");
                
                foreach (var key in keys)
                {
                    await _database.KeyDeleteAsync(key);
                }

                // Pre-populate key balances
                await GetBankBalanceAsync();
                await GetCashOnHandBalanceAsync();
                await GetBalanceSummaryAsync();

                _logger.LogInformation("Balance cache refresh completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing balance cache");
            }
        }

        public async Task ClearAccountBalanceCacheAsync(Guid accountId)
        {
            try
            {
                var cacheKey = $"{ACCOUNT_BALANCE_PREFIX}{accountId}";
                await _database.KeyDeleteAsync(cacheKey);
                
                // Also clear summary cache
                await _database.KeyDeleteAsync(BALANCE_SUMMARY_KEY);
                
                _logger.LogDebug("Cleared balance cache for account {AccountId}", accountId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing balance cache for account {AccountId}", accountId);
            }
        }

        #region Private Methods

        private async Task<decimal> CalculateBankBalanceFromDatabase()
        {
            // Find bank accounts (typically account codes starting with 1010-1019)
            var bankAccounts = await _context.ChartOfAccounts
                .Where(a => a.AccountType == AccountType.Asset && 
                           (a.AccountCode.StartsWith("1010") || 
                            a.AccountCode.StartsWith("1011") ||
                            a.AccountName.ToLower().Contains("bank")))
                .ToListAsync();

            decimal totalBankBalance = 0;
            foreach (var account in bankAccounts)
            {
                var balance = await CalculateAccountBalanceFromDatabase(account.Id);
                totalBankBalance += balance;
            }

            return totalBankBalance;
        }

        private async Task<decimal> CalculateCashBalanceFromDatabase()
        {
            // Find cash accounts (typically account codes starting with 1001-1009)
            var cashAccounts = await _context.ChartOfAccounts
                .Where(a => a.AccountType == AccountType.Asset && 
                           (a.AccountCode.StartsWith("1001") || 
                            a.AccountCode.StartsWith("1000") ||
                            a.AccountName.ToLower().Contains("cash")))
                .ToListAsync();

            decimal totalCashBalance = 0;
            foreach (var account in cashAccounts)
            {
                var balance = await CalculateAccountBalanceFromDatabase(account.Id);
                totalCashBalance += balance;
            }

            return totalCashBalance;
        }

        private async Task<decimal> CalculateAccountBalanceFromDatabase(Guid accountId, DateTime? asOfDate = null)
        {
            var query = _context.JournalEntryLines
                .Where(jel => jel.AccountId == accountId);

            if (asOfDate.HasValue)
            {
                query = query.Where(jel => jel.JournalEntry.TransactionDate <= asOfDate.Value);
            }

            var movements = await query
                .GroupBy(jel => jel.AccountId)
                .Select(g => new
                {
                    TotalDebits = g.Sum(jel => jel.Debit),
                    TotalCredits = g.Sum(jel => jel.Credit)
                })
                .FirstOrDefaultAsync();

            if (movements == null)
                return 0;

            // For asset and expense accounts, balance = debits - credits
            // For liability, equity, and revenue accounts, balance = credits - debits
            var account = await _context.ChartOfAccounts.FindAsync(accountId);
            if (account == null)
                return 0;

            if (account.AccountType == AccountType.Asset || account.AccountType == AccountType.Expense)
            {
                return movements.TotalDebits - movements.TotalCredits;
            }
            else
            {
                return movements.TotalCredits - movements.TotalDebits;
            }
        }

        private async Task<BalanceSummaryDto> CalculateBalanceSummaryFromDatabase()
        {
            var summary = new BalanceSummaryDto
            {
                LastUpdated = DateTime.UtcNow,
                IsFromCache = false
            };

            // Get key balances
            summary.BankBalance = await CalculateBankBalanceFromDatabase();
            summary.CashOnHand = await CalculateCashBalanceFromDatabase();

            // Calculate totals by account type
            var accountBalances = await _context.ChartOfAccounts
                .Where(a => a.IsActive)
                .Select(a => new { a.Id, a.AccountType, a.AccountCode, a.AccountName })
                .ToListAsync();

            foreach (var account in accountBalances)
            {
                var balance = await CalculateAccountBalanceFromDatabase(account.Id);
                
                switch (account.AccountType)
                {
                    case AccountType.Asset:
                        summary.TotalAssets += balance;
                        break;
                    case AccountType.Liability:
                        summary.TotalLiabilities += balance;
                        break;
                    case AccountType.Equity:
                        summary.TotalEquity += balance;
                        break;
                    case AccountType.Revenue:
                        summary.TotalRevenue += balance;
                        break;
                    case AccountType.Expense:
                        summary.TotalExpenses += balance;
                        break;
                }

                // Add to key accounts if significant balance
                if (Math.Abs(balance) > 0)
                {
                    summary.KeyAccounts.Add(new AccountBalanceDto
                    {
                        AccountId = account.Id,
                        AccountCode = account.AccountCode,
                        AccountName = account.AccountName,
                        AccountType = account.AccountType,
                        Balance = balance,
                        LastUpdated = DateTime.UtcNow,
                        IsFromCache = false
                    });
                }
            }

            summary.NetIncome = summary.TotalRevenue - summary.TotalExpenses;

            return summary;
        }

        private async Task UpdateSpecialAccountCaches(Guid accountId, decimal amount, bool isDebit)
        {
            var account = await _context.ChartOfAccounts.FindAsync(accountId);
            if (account == null) return;

            // Check if this is a bank account
            if (account.AccountType == AccountType.Asset && 
                (account.AccountCode.StartsWith("1010") || 
                 account.AccountCode.StartsWith("1011") ||
                 account.AccountName.ToLower().Contains("bank")))
            {
                await _database.KeyDeleteAsync(BANK_BALANCE_KEY);
            }

            // Check if this is a cash account
            if (account.AccountType == AccountType.Asset && 
                (account.AccountCode.StartsWith("1001") || 
                 account.AccountCode.StartsWith("1000") ||
                 account.AccountName.ToLower().Contains("cash")))
            {
                await _database.KeyDeleteAsync(CASH_BALANCE_KEY);
            }
        }

        #endregion
    }
}