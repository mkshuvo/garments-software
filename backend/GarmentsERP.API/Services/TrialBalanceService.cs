using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    public class TrialBalanceService : ITrialBalanceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TrialBalanceService> _logger;

        public TrialBalanceService(ApplicationDbContext context, ILogger<TrialBalanceService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<TrialBalanceResponseDto> GenerateTrialBalanceAsync(TrialBalanceRequestDto request)
        {
            try
            {
                _logger.LogInformation("Generating trial balance for date range {StartDate} to {EndDate}", 
                    request.StartDate, request.EndDate);

                // Get all active accounts
                var accounts = await _context.ChartOfAccounts
                    .Where(a => a.IsActive)
                    .OrderBy(a => a.AccountCode)
                    .ToListAsync();

                var categories = new List<AccountCategoryDto>();
                var allTransactions = new List<decimal>(); // For calculation expression
                decimal totalDebits = 0;
                decimal totalCredits = 0;

                // Group accounts by category
                var accountsByCategory = accounts.GroupBy(a => GetCategoryName(a.AccountType));

                foreach (var categoryGroup in accountsByCategory)
                {
                    var categoryDto = new AccountCategoryDto
                    {
                        Name = categoryGroup.Key,
                        Accounts = new List<TrialBalanceAccountDto>()
                    };

                    foreach (var account in categoryGroup)
                    {
                        var accountBalance = await CalculateAccountBalance(account, request.StartDate, request.EndDate);
                        
                        // Only include accounts with activity or non-zero balances if requested
                        if (!request.IncludeZeroBalances && accountBalance.NetBalance == 0 && accountBalance.TransactionCount == 0)
                            continue;

                        categoryDto.Accounts.Add(accountBalance);

                        // Add to calculation expression (debits as negative, credits as positive)
                        if (accountBalance.DebitAmount != 0)
                        {
                            allTransactions.Add(accountBalance.DebitAmount); // Already negative
                            totalDebits += Math.Abs(accountBalance.DebitAmount);
                        }
                        if (accountBalance.CreditAmount != 0)
                        {
                            allTransactions.Add(accountBalance.CreditAmount); // Already positive
                            totalCredits += Math.Abs(accountBalance.CreditAmount);
                        }
                    }

                    categoryDto.Subtotal = categoryDto.Accounts.Sum(a => a.NetBalance);
                    
                    if (categoryDto.Accounts.Any() || request.IncludeZeroBalances)
                    {
                        categories.Add(categoryDto);
                    }
                }

                // Calculate final balance and create expression
                var finalBalance = allTransactions.Sum();
                var calculationExpression = CreateCalculationExpression(allTransactions, finalBalance);

                var response = new TrialBalanceResponseDto
                {
                    DateRange = new DateRangeDto
                    {
                        StartDate = request.StartDate,
                        EndDate = request.EndDate
                    },
                    Categories = categories,
                    TotalDebits = totalDebits,
                    TotalCredits = totalCredits,
                    FinalBalance = finalBalance,
                    CalculationExpression = calculationExpression,
                    GeneratedAt = DateTime.UtcNow,
                    TotalTransactions = allTransactions.Count
                };

                _logger.LogInformation("Trial balance generated successfully with {TransactionCount} transactions", 
                    response.TotalTransactions);

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating trial balance for date range {StartDate} to {EndDate}", 
                    request.StartDate, request.EndDate);
                throw;
            }
        }

        public async Task<TrialBalanceComparisonDto> CompareTrialBalancesAsync(TrialBalanceRequestDto period1, TrialBalanceRequestDto period2)
        {
            try
            {
                _logger.LogInformation("Comparing trial balances for periods {Period1Start}-{Period1End} and {Period2Start}-{Period2End}",
                    period1.StartDate, period1.EndDate, period2.StartDate, period2.EndDate);

                var trialBalance1 = await GenerateTrialBalanceAsync(period1);
                var trialBalance2 = await GenerateTrialBalanceAsync(period2);

                var variances = new List<AccountVarianceDto>();

                // Create lookup dictionaries for easier comparison
                var period1Accounts = trialBalance1.Categories
                    .SelectMany(c => c.Accounts)
                    .ToDictionary(a => a.AccountId, a => a);

                var period2Accounts = trialBalance2.Categories
                    .SelectMany(c => c.Accounts)
                    .ToDictionary(a => a.AccountId, a => a);

                // Find all unique account IDs
                var allAccountIds = period1Accounts.Keys.Union(period2Accounts.Keys);

                foreach (var accountId in allAccountIds)
                {
                    var hasAccount1 = period1Accounts.TryGetValue(accountId, out var account1);
                    var hasAccount2 = period2Accounts.TryGetValue(accountId, out var account2);

                    var balance1 = account1?.NetBalance ?? 0;
                    var balance2 = account2?.NetBalance ?? 0;
                    var absoluteChange = balance2 - balance1;
                    var percentageChange = balance1 != 0 ? (absoluteChange / Math.Abs(balance1)) * 100 : 0;

                    if (absoluteChange != 0 || !hasAccount1 || !hasAccount2)
                    {
                        var changeType = (!hasAccount1) ? "New" : (!hasAccount2) ? "Removed" : 
                                        (absoluteChange > 0) ? "Increased" : "Decreased";

                        variances.Add(new AccountVarianceDto
                        {
                            AccountId = accountId,
                            AccountName = account1?.AccountName ?? account2?.AccountName ?? "",
                            CategoryName = account1?.CategoryName ?? account2?.CategoryName ?? "",
                            Period1Balance = balance1,
                            Period2Balance = balance2,
                            AbsoluteChange = absoluteChange,
                            PercentageChange = percentageChange,
                            ChangeType = changeType
                        });
                    }
                }

                var comparison = new TrialBalanceComparisonDto
                {
                    Period1 = trialBalance1,
                    Period2 = trialBalance2,
                    Variances = variances.OrderByDescending(v => Math.Abs(v.AbsoluteChange)).ToList(),
                    TotalVariance = variances.Sum(v => Math.Abs(v.AbsoluteChange)),
                    ComparisonGeneratedAt = DateTime.UtcNow
                };

                _logger.LogInformation("Trial balance comparison completed with {VarianceCount} variances", 
                    variances.Count);

                return comparison;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing trial balances");
                throw;
            }
        }

        public async Task<List<AccountTransactionDto>> GetAccountTransactionsAsync(Guid accountId, DateTime startDate, DateTime endDate)
        {
            try
            {
                _logger.LogInformation("Retrieving transactions for account {AccountId} from {StartDate} to {EndDate}",
                    accountId, startDate, endDate);

                // Enhanced query with better performance and proper indexing usage
                var transactions = await (from line in _context.JournalEntryLines
                                         join journal in _context.JournalEntries on line.JournalEntryId equals journal.Id
                                         join account in _context.ChartOfAccounts on line.AccountId equals account.Id
                                         where line.AccountId == accountId &&
                                               journal.TransactionDate >= startDate &&
                                               journal.TransactionDate <= endDate &&
                                               journal.Status == JournalStatus.Posted
                                         orderby journal.TransactionDate, journal.CreatedAt
                                         select new
                                         {
                                             TransactionId = journal.Id,
                                             TransactionDate = journal.TransactionDate,
                                             CategoryDescription = GetEnhancedCategoryDescription(account.AccountType, journal.JournalType),
                                             Particulars = journal.Description ?? "",
                                             ReferenceNumber = journal.ReferenceNumber ?? "",
                                             DebitAmount = line.Debit,
                                             CreditAmount = line.Credit,
                                             JournalType = journal.JournalType,
                                             AccountType = account.AccountType
                                         }).ToListAsync();

                var result = new List<AccountTransactionDto>();
                decimal runningBalance = 0;

                // Get account information for enhanced categorization
                var accountInfo = await _context.ChartOfAccounts.FindAsync(accountId);
                
                foreach (var transaction in transactions)
                {
                    // Calculate running balance (debits as negative, credits as positive)
                    var netAmount = -transaction.DebitAmount + transaction.CreditAmount;
                    runningBalance += netAmount;

                    // Enhanced category description based on account type and transaction type
                    var enhancedCategoryDescription = accountInfo != null 
                        ? GetAccountCategoryDescription(accountInfo, new List<JournalType> { transaction.JournalType })
                        : transaction.CategoryDescription;

                    result.Add(new AccountTransactionDto
                    {
                        TransactionId = transaction.TransactionId,
                        TransactionDate = transaction.TransactionDate,
                        CategoryDescription = enhancedCategoryDescription,
                        Particulars = transaction.Particulars,
                        ReferenceNumber = transaction.ReferenceNumber,
                        DebitAmount = -transaction.DebitAmount, // Negative for debits
                        CreditAmount = transaction.CreditAmount, // Positive for credits
                        RunningBalance = runningBalance
                    });
                }

                _logger.LogInformation("Retrieved {TransactionCount} transactions for account {AccountId}",
                    result.Count, accountId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving account transactions for account {AccountId}", accountId);
                throw;
            }
        }

        // Private helper methods
        private async Task<TrialBalanceAccountDto> CalculateAccountBalance(ChartOfAccount account, DateTime startDate, DateTime endDate)
        {
            // Enhanced query with better performance considerations and proper indexing usage
            var transactions = await (from line in _context.JournalEntryLines
                                     join journal in _context.JournalEntries on line.JournalEntryId equals journal.Id
                                     where line.AccountId == account.Id &&
                                           journal.TransactionDate >= startDate &&
                                           journal.TransactionDate <= endDate &&
                                           journal.Status == JournalStatus.Posted
                                     orderby journal.TransactionDate // Utilize index on TransactionDate
                                     select new
                                     {
                                         Debit = line.Debit,
                                         Credit = line.Credit,
                                         CategoryDescription = GetEnhancedCategoryDescription(account.AccountType, journal.JournalType),
                                         Particulars = journal.Description ?? "",
                                         TransactionDate = journal.TransactionDate,
                                         JournalType = journal.JournalType
                                     }).ToListAsync();

            var totalDebits = transactions.Sum(t => t.Debit);
            var totalCredits = transactions.Sum(t => t.Credit);

            // Enhanced category description logic based on account type and transaction patterns
            var categoryDescription = GetAccountCategoryDescription(account, transactions.Select(t => t.JournalType).ToList());
            
            // Get the most relevant particulars based on transaction frequency and recency
            var mostRelevantParticulars = GetMostRelevantParticulars(transactions.Select(t => (t.Particulars, t.TransactionDate)).ToList());

            return new TrialBalanceAccountDto
            {
                AccountId = account.Id,
                AccountName = account.AccountName,
                CategoryName = GetCategoryName(account.AccountType),
                CategoryDescription = categoryDescription,
                Particulars = mostRelevantParticulars,
                DebitAmount = -totalDebits, // Negative for debits
                CreditAmount = totalCredits, // Positive for credits
                NetBalance = -totalDebits + totalCredits, // Net balance
                TransactionCount = transactions.Count
            };
        }

        /// <summary>
        /// Enhanced method to fetch transactions within date range with optimized database queries
        /// Utilizes proper indexing for performance with large datasets
        /// </summary>
        private async Task<List<TransactionSummaryDto>> FetchTransactionsWithinDateRange(DateTime startDate, DateTime endDate, List<Guid>? accountIds = null)
        {
            var query = from line in _context.JournalEntryLines
                       join journal in _context.JournalEntries on line.JournalEntryId equals journal.Id
                       join account in _context.ChartOfAccounts on line.AccountId equals account.Id
                       where journal.TransactionDate >= startDate &&
                             journal.TransactionDate <= endDate &&
                             journal.Status == JournalStatus.Posted &&
                             account.IsActive
                       select new TransactionSummaryDto
                       {
                           AccountId = line.AccountId,
                           AccountName = account.AccountName,
                           AccountType = account.AccountType,
                           TransactionDate = journal.TransactionDate,
                           JournalType = journal.JournalType,
                           DebitAmount = line.Debit,
                           CreditAmount = line.Credit,
                           Description = journal.Description ?? "",
                           ReferenceNumber = journal.ReferenceNumber
                       };

            // Apply account filter if provided
            if (accountIds != null && accountIds.Any())
            {
                query = query.Where(t => accountIds.Contains(t.AccountId));
            }

            // Order by transaction date and account for consistent results
            return await query
                .OrderBy(t => t.TransactionDate)
                .ThenBy(t => t.AccountName)
                .ToListAsync();
        }

        /// <summary>
        /// Enhanced account categorization logic with detailed business rules
        /// Categorizes accounts into Assets, Liabilities, Equity, Income, Expenses with sub-categories
        /// </summary>
        private string GetAccountCategoryDescription(ChartOfAccount account, List<JournalType> transactionTypes)
        {
            var primaryCategory = GetCategoryName(account.AccountType);
            
            // Enhanced categorization based on account type and transaction patterns
            return account.AccountType switch
            {
                AccountType.Asset => GetAssetCategoryDescription(account, transactionTypes),
                AccountType.Liability => GetLiabilityCategoryDescription(account, transactionTypes),
                AccountType.Equity => GetEquityCategoryDescription(account, transactionTypes),
                AccountType.Revenue => GetRevenueCategoryDescription(account, transactionTypes),
                AccountType.Expense => GetExpenseCategoryDescription(account, transactionTypes),
                _ => "Uncategorized"
            };
        }

        private string GetAssetCategoryDescription(ChartOfAccount account, List<JournalType> transactionTypes)
        {
            // Determine asset sub-category based on account name patterns and transaction types
            var accountNameLower = account.AccountName.ToLower();
            
            if (accountNameLower.Contains("cash") || accountNameLower.Contains("bank"))
                return "Current Assets - Cash & Bank";
            if (accountNameLower.Contains("inventory") || accountNameLower.Contains("stock"))
                return "Current Assets - Inventory";
            if (accountNameLower.Contains("receivable") || accountNameLower.Contains("debtor"))
                return "Current Assets - Accounts Receivable";
            if (accountNameLower.Contains("equipment") || accountNameLower.Contains("machinery"))
                return "Fixed Assets - Equipment";
            if (accountNameLower.Contains("building") || accountNameLower.Contains("property"))
                return "Fixed Assets - Property";
            
            return "Assets - General";
        }

        private string GetLiabilityCategoryDescription(ChartOfAccount account, List<JournalType> transactionTypes)
        {
            var accountNameLower = account.AccountName.ToLower();
            
            if (accountNameLower.Contains("payable") || accountNameLower.Contains("creditor"))
                return "Current Liabilities - Accounts Payable";
            if (accountNameLower.Contains("loan") || accountNameLower.Contains("debt"))
                return "Long-term Liabilities - Loans";
            if (accountNameLower.Contains("tax") || accountNameLower.Contains("vat"))
                return "Current Liabilities - Tax Payable";
            
            return "Liabilities - General";
        }

        private string GetEquityCategoryDescription(ChartOfAccount account, List<JournalType> transactionTypes)
        {
            var accountNameLower = account.AccountName.ToLower();
            
            if (accountNameLower.Contains("capital") || accountNameLower.Contains("owner"))
                return "Equity - Owner's Capital";
            if (accountNameLower.Contains("retained") || accountNameLower.Contains("earning"))
                return "Equity - Retained Earnings";
            
            return "Equity - General";
        }

        private string GetRevenueCategoryDescription(ChartOfAccount account, List<JournalType> transactionTypes)
        {
            var accountNameLower = account.AccountName.ToLower();
            var hasSalesTransactions = transactionTypes.Contains(JournalType.Sales);
            
            if (accountNameLower.Contains("sales") || hasSalesTransactions)
                return "Revenue - Sales";
            if (accountNameLower.Contains("service") || accountNameLower.Contains("fee"))
                return "Revenue - Service Income";
            if (accountNameLower.Contains("interest") || accountNameLower.Contains("investment"))
                return "Revenue - Other Income";
            
            return "Revenue - General";
        }

        private string GetExpenseCategoryDescription(ChartOfAccount account, List<JournalType> transactionTypes)
        {
            var accountNameLower = account.AccountName.ToLower();
            var hasPurchaseTransactions = transactionTypes.Contains(JournalType.Purchase);
            
            if (accountNameLower.Contains("cost") || accountNameLower.Contains("cogs") || hasPurchaseTransactions)
                return "Expenses - Cost of Goods Sold";
            if (accountNameLower.Contains("salary") || accountNameLower.Contains("wage"))
                return "Expenses - Payroll";
            if (accountNameLower.Contains("rent") || accountNameLower.Contains("utilities"))
                return "Expenses - Operating";
            if (accountNameLower.Contains("marketing") || accountNameLower.Contains("advertising"))
                return "Expenses - Marketing";
            
            return "Expenses - General";
        }

        private string GetEnhancedCategoryDescription(AccountType accountType, JournalType journalType)
        {
            return $"{GetCategoryName(accountType)} - {journalType}";
        }

        private string GetMostRelevantParticulars(List<(string Particulars, DateTime TransactionDate)> transactionData)
        {
            if (!transactionData.Any()) return "";
            
            // Get the most recent non-empty particulars, or the most common one
            var recentParticulars = transactionData
                .Where(t => !string.IsNullOrWhiteSpace(t.Particulars))
                .OrderByDescending(t => t.TransactionDate)
                .FirstOrDefault().Particulars;
                
            if (!string.IsNullOrWhiteSpace(recentParticulars))
                return recentParticulars;
                
            // Fallback to most common particulars
            return transactionData
                .Where(t => !string.IsNullOrWhiteSpace(t.Particulars))
                .GroupBy(t => t.Particulars)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault()?.Key ?? "";
        }

        private string GetCategoryName(AccountType accountType)
        {
            return accountType switch
            {
                AccountType.Asset => "Assets",
                AccountType.Liability => "Liabilities",
                AccountType.Equity => "Equity",
                AccountType.Revenue => "Income",
                AccountType.Expense => "Expenses",
                _ => "Other"
            };
        }

        private string CreateCalculationExpression(List<decimal> transactions, decimal finalBalance)
        {
            if (!transactions.Any())
                return "0 = 0";

            // Limit to first 10 transactions for readability
            var displayTransactions = transactions.Take(10).ToList();
            var hasMore = transactions.Count > 10;

            var expression = string.Join(" + ", displayTransactions.Select(t => t.ToString("0")));
            
            if (hasMore)
            {
                expression += $" + ... ({transactions.Count - 10} more)";
            }

            expression += $" = {finalBalance:0}";

            return expression;
        }

        /// <summary>
        /// Method to group transactions by account and calculate net balances with enhanced performance
        /// Includes category descriptions and transaction particulars in the grouped data
        /// </summary>
        public async Task<Dictionary<Guid, AccountBalanceSummary>> GroupTransactionsByAccountAsync(DateTime startDate, DateTime endDate, List<Guid>? accountFilter = null)
        {
            try
            {
                _logger.LogInformation("Grouping transactions by account for date range {StartDate} to {EndDate}", startDate, endDate);

                // Use optimized query with proper indexing
                var query = from line in _context.JournalEntryLines
                           join journal in _context.JournalEntries on line.JournalEntryId equals journal.Id
                           join account in _context.ChartOfAccounts on line.AccountId equals account.Id
                           where journal.TransactionDate >= startDate &&
                                 journal.TransactionDate <= endDate &&
                                 journal.Status == JournalStatus.Posted &&
                                 account.IsActive
                           group new { line, journal, account } by new { line.AccountId, account.AccountName, account.AccountType } into g
                           select new
                           {
                               AccountId = g.Key.AccountId,
                               AccountName = g.Key.AccountName,
                               AccountType = g.Key.AccountType,
                               TotalDebits = g.Sum(x => x.line.Debit),
                               TotalCredits = g.Sum(x => x.line.Credit),
                               TransactionCount = g.Count(),
                               Transactions = g.Select(x => new { x.journal.JournalType, x.journal.Description, x.journal.TransactionDate }).ToList()
                           };

                // Apply account filter if provided
                if (accountFilter != null && accountFilter.Any())
                {
                    query = query.Where(x => accountFilter.Contains(x.AccountId));
                }

                var groupedData = await query.ToListAsync();
                var result = new Dictionary<Guid, AccountBalanceSummary>();

                foreach (var item in groupedData)
                {
                    var journalTypes = item.Transactions.Select(t => t.JournalType).Distinct().ToList();
                    var account = new ChartOfAccount 
                    { 
                        Id = item.AccountId, 
                        AccountName = item.AccountName, 
                        AccountType = item.AccountType 
                    };

                    result[item.AccountId] = new AccountBalanceSummary
                    {
                        AccountId = item.AccountId,
                        AccountName = item.AccountName,
                        AccountType = item.AccountType,
                        CategoryName = GetCategoryName(item.AccountType),
                        CategoryDescription = GetAccountCategoryDescription(account, journalTypes),
                        TotalDebits = item.TotalDebits,
                        TotalCredits = item.TotalCredits,
                        NetBalance = -item.TotalDebits + item.TotalCredits, // Debits negative, credits positive
                        TransactionCount = item.TransactionCount,
                        MostRecentParticulars = item.Transactions
                            .OrderByDescending(t => t.TransactionDate)
                            .FirstOrDefault(t => !string.IsNullOrWhiteSpace(t.Description))?.Description ?? ""
                    };
                }

                _logger.LogInformation("Grouped {AccountCount} accounts with transactions", result.Count);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error grouping transactions by account for date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        /// <summary>
        /// Create database queries with proper indexing for performance
        /// This method provides guidance for database index creation
        /// </summary>
        public List<string> GetRecommendedDatabaseIndexes()
        {
            return new List<string>
            {
                // Index for journal entries by transaction date and status (most common query)
                "CREATE INDEX IX_JournalEntries_TransactionDate_Status ON JournalEntries (TransactionDate, Status) INCLUDE (Id, JournalType, Description, ReferenceNumber)",
                
                // Index for journal entry lines by account ID (for account-specific queries)
                "CREATE INDEX IX_JournalEntryLines_AccountId_JournalEntryId ON JournalEntryLines (AccountId, JournalEntryId) INCLUDE (Debit, Credit, Description)",
                
                // Index for chart of accounts by account type and active status
                "CREATE INDEX IX_ChartOfAccounts_AccountType_IsActive ON ChartOfAccounts (AccountType, IsActive) INCLUDE (Id, AccountName, AccountCode)",
                
                // Composite index for trial balance queries
                "CREATE INDEX IX_TrialBalance_Composite ON JournalEntries (TransactionDate, Status) INCLUDE (Id, JournalType, Description, ReferenceNumber, TotalDebit, TotalCredit)"
            };
        }
    }

    /// <summary>
    /// Summary class for account balance calculations with enhanced categorization
    /// </summary>
    public class AccountBalanceSummary
    {
        public Guid AccountId { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string CategoryDescription { get; set; } = string.Empty;
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal NetBalance { get; set; }
        public int TransactionCount { get; set; }
        public string MostRecentParticulars { get; set; } = string.Empty;
    }
}