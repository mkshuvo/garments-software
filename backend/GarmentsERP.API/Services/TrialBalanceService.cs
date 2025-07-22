using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Accounting;
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

        public async Task<TrialBalanceResult> GenerateTrialBalanceAsync(int year, int month, string companyName, string? companyAddress = null)
        {
            try
            {
                // Check if trial balance already exists for this period
                var existingTrialBalance = await _context.TrialBalances
                    .FirstOrDefaultAsync(tb => tb.Year == year && tb.Month == month);

                if (existingTrialBalance != null)
                {
                    return new TrialBalanceResult
                    {
                        Success = false,
                        Message = $"Trial balance already exists for {month}/{year}",
                        Errors = new List<string> { "TRIAL_BALANCE_EXISTS" }
                    };
                }

                // Calculate period dates
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                // Get all active accounts
                var accounts = await _context.ChartOfAccounts
                    .Where(a => a.IsActive)
                    .OrderBy(a => a.AccountCode)
                    .ToListAsync();

                var trialBalanceEntries = new List<TrialBalanceEntry>();
                decimal totalDebits = 0;
                decimal totalCredits = 0;

                foreach (var account in accounts)
                {
                    // Calculate opening balance (transactions before start date)
                    var openingBalance = await CalculateAccountBalance(account.Id, null, startDate.AddDays(-1));

                    // Calculate movements during the period
                    var movements = await (from line in _context.JournalEntryLines
                                          join journal in _context.JournalEntries on line.JournalEntryId equals journal.Id
                                          where line.AccountId == account.Id && 
                                                journal.TransactionDate >= startDate && 
                                                journal.TransactionDate <= endDate &&
                                                journal.Status == JournalStatus.Posted
                                          group line by line.AccountId into g
                                          select new
                                          {
                                              TotalDebits = g.Sum(l => l.Debit),
                                              TotalCredits = g.Sum(l => l.Credit)
                                          }).FirstOrDefaultAsync();

                    var debitMovements = movements?.TotalDebits ?? 0;
                    var creditMovements = movements?.TotalCredits ?? 0;

                    // Calculate closing balance
                    var closingBalance = openingBalance + debitMovements - creditMovements;

                    // Only include accounts with activity or non-zero balances
                    if (openingBalance != 0 || debitMovements != 0 || creditMovements != 0 || closingBalance != 0)
                    {
                        var entry = new TrialBalanceEntry
                        {
                            AccountId = account.Id,
                            AccountCode = account.AccountCode,
                            AccountName = account.AccountName,
                            AccountType = account.AccountType,
                            OpeningBalance = openingBalance,
                            DebitMovements = debitMovements,
                            CreditMovements = creditMovements,
                            ClosingBalance = closingBalance,
                            SortOrder = int.TryParse(account.AccountCode, out int code) ? code : 9999
                        };

                        trialBalanceEntries.Add(entry);

                        // Add to totals based on normal balance
                        if (closingBalance >= 0)
                        {
                            if (account.AccountType == AccountType.Asset || account.AccountType == AccountType.Expense)
                            {
                                totalDebits += Math.Abs(closingBalance);
                            }
                            else
                            {
                                totalCredits += Math.Abs(closingBalance);
                            }
                        }
                        else
                        {
                            if (account.AccountType == AccountType.Asset || account.AccountType == AccountType.Expense)
                            {
                                totalCredits += Math.Abs(closingBalance);
                            }
                            else
                            {
                                totalDebits += Math.Abs(closingBalance);
                            }
                        }
                    }
                }

                // Create trial balance
                var trialBalance = new TrialBalance
                {
                    Year = year,
                    Month = month,
                    CompanyName = companyName,
                    CompanyAddress = companyAddress,
                    TotalDebits = totalDebits,
                    TotalCredits = totalCredits,
                    Status = TrialBalanceStatus.Generated,
                    GeneratedByUserId = GetCurrentUserId(),
                    GeneratedDate = DateTime.UtcNow
                };

                // Set trial balance ID for entries
                foreach (var entry in trialBalanceEntries)
                {
                    entry.TrialBalanceId = trialBalance.Id;
                }

                // Save to database
                _context.TrialBalances.Add(trialBalance);
                _context.TrialBalanceEntries.AddRange(trialBalanceEntries);
                await _context.SaveChangesAsync();

                // Convert to DTO
                var trialBalanceDto = await MapToDto(trialBalance);

                return new TrialBalanceResult
                {
                    Success = true,
                    Message = $"Trial balance generated successfully for {month}/{year}",
                    TrialBalance = trialBalanceDto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating trial balance for {Year}/{Month}", year, month);
                return new TrialBalanceResult
                {
                    Success = false,
                    Message = "Error generating trial balance",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<PagedResult<TrialBalanceDto>> GetTrialBalanceHistoryAsync(TrialBalanceFilterRequest filter)
        {
            try
            {
                var query = _context.TrialBalances.AsQueryable();

                // Apply filters
                if (filter.Year.HasValue)
                    query = query.Where(tb => tb.Year == filter.Year.Value);

                if (filter.Month.HasValue)
                    query = query.Where(tb => tb.Month == filter.Month.Value);

                if (filter.Status.HasValue)
                    query = query.Where(tb => tb.Status == filter.Status.Value);

                if (filter.FromDate.HasValue)
                    query = query.Where(tb => tb.GeneratedDate >= filter.FromDate.Value);

                if (filter.ToDate.HasValue)
                    query = query.Where(tb => tb.GeneratedDate <= filter.ToDate.Value);

                // Apply sorting
                query = filter.SortBy.ToLower() switch
                {
                    "year" => filter.SortDescending ? query.OrderByDescending(tb => tb.Year) : query.OrderBy(tb => tb.Year),
                    "month" => filter.SortDescending ? query.OrderByDescending(tb => tb.Month) : query.OrderBy(tb => tb.Month),
                    "status" => filter.SortDescending ? query.OrderByDescending(tb => tb.Status) : query.OrderBy(tb => tb.Status),
                    _ => filter.SortDescending ? query.OrderByDescending(tb => tb.GeneratedDate) : query.OrderBy(tb => tb.GeneratedDate)
                };

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply pagination
                var trialBalances = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                // Convert to DTOs
                var trialBalanceDtos = new List<TrialBalanceDto>();
                foreach (var tb in trialBalances)
                {
                    var dto = await MapToDto(tb);
                    trialBalanceDtos.Add(dto);
                }

                return new PagedResult<TrialBalanceDto>
                {
                    Items = trialBalanceDtos,
                    TotalCount = totalCount,
                    Page = filter.Page,
                    PageSize = filter.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trial balance history");
                return new PagedResult<TrialBalanceDto>
                {
                    Items = new List<TrialBalanceDto>(),
                    TotalCount = 0,
                    Page = filter.Page,
                    PageSize = filter.PageSize
                };
            }
        }

        public async Task<TrialBalanceComparisonResult> CompareTrialBalancesAsync(Guid trialBalance1Id, Guid trialBalance2Id)
        {
            try
            {
                var tb1 = await GetTrialBalanceByIdAsync(trialBalance1Id);
                var tb2 = await GetTrialBalanceByIdAsync(trialBalance2Id);

                if (tb1 == null || tb2 == null)
                {
                    throw new ArgumentException("One or both trial balances not found");
                }

                var differences = new List<TrialBalanceComparisonEntry>();

                // Create lookup for easier comparison
                var tb1Entries = tb1.Entries.ToDictionary(e => e.AccountCode, e => e);
                var tb2Entries = tb2.Entries.ToDictionary(e => e.AccountCode, e => e);

                // Find all unique account codes
                var allAccountCodes = tb1Entries.Keys.Union(tb2Entries.Keys).OrderBy(code => code);

                foreach (var accountCode in allAccountCodes)
                {
                    var hasEntry1 = tb1Entries.TryGetValue(accountCode, out var entry1);
                    var hasEntry2 = tb2Entries.TryGetValue(accountCode, out var entry2);

                    var balance1 = entry1?.ClosingBalance ?? 0;
                    var balance2 = entry2?.ClosingBalance ?? 0;
                    var difference = balance2 - balance1;

                    if (difference != 0 || !hasEntry1 || !hasEntry2)
                    {
                        var changeType = (!hasEntry1) ? "New" : (!hasEntry2) ? "Removed" : "Changed";

                        differences.Add(new TrialBalanceComparisonEntry
                        {
                            AccountCode = accountCode,
                            AccountName = entry1?.AccountName ?? entry2?.AccountName ?? "",
                            Balance1 = balance1,
                            Balance2 = balance2,
                            Difference = difference,
                            ChangeType = changeType
                        });
                    }
                }

                return new TrialBalanceComparisonResult
                {
                    TrialBalance1 = tb1,
                    TrialBalance2 = tb2,
                    Differences = differences,
                    TotalDifference = differences.Sum(d => Math.Abs(d.Difference))
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing trial balances");
                throw;
            }
        }

        public async Task<TrialBalanceDto?> GetTrialBalanceByIdAsync(Guid id)
        {
            try
            {
                var trialBalance = await _context.TrialBalances
                    .FirstOrDefaultAsync(tb => tb.Id == id);

                if (trialBalance == null)
                    return null;

                return await MapToDto(trialBalance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving trial balance with ID: {Id}", id);
                return null;
            }
        }

        public async Task<TrialBalanceResult> ApproveTrialBalanceAsync(Guid id, Guid userId, string? notes = null)
        {
            try
            {
                var trialBalance = await _context.TrialBalances.FindAsync(id);

                if (trialBalance == null)
                {
                    return new TrialBalanceResult
                    {
                        Success = false,
                        Message = "Trial balance not found",
                        Errors = new List<string> { "NOT_FOUND" }
                    };
                }

                if (trialBalance.Status == TrialBalanceStatus.Approved)
                {
                    return new TrialBalanceResult
                    {
                        Success = false,
                        Message = "Trial balance is already approved",
                        Errors = new List<string> { "ALREADY_APPROVED" }
                    };
                }

                trialBalance.Status = TrialBalanceStatus.Approved;
                trialBalance.ApprovedByUserId = userId;
                trialBalance.ApprovedAt = DateTime.UtcNow;
                trialBalance.UpdatedAt = DateTime.UtcNow;

                if (!string.IsNullOrWhiteSpace(notes))
                {
                    trialBalance.Notes = notes;
                }

                await _context.SaveChangesAsync();

                var dto = await MapToDto(trialBalance);

                return new TrialBalanceResult
                {
                    Success = true,
                    Message = "Trial balance approved successfully",
                    TrialBalance = dto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving trial balance with ID: {Id}", id);
                return new TrialBalanceResult
                {
                    Success = false,
                    Message = "Error approving trial balance",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<TrialBalanceResult> UpdateNotesAsync(Guid id, string notes)
        {
            try
            {
                var trialBalance = await _context.TrialBalances.FindAsync(id);

                if (trialBalance == null)
                {
                    return new TrialBalanceResult
                    {
                        Success = false,
                        Message = "Trial balance not found",
                        Errors = new List<string> { "NOT_FOUND" }
                    };
                }

                trialBalance.Notes = notes;
                trialBalance.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var dto = await MapToDto(trialBalance);

                return new TrialBalanceResult
                {
                    Success = true,
                    Message = "Notes updated successfully",
                    TrialBalance = dto
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating trial balance notes for ID: {Id}", id);
                return new TrialBalanceResult
                {
                    Success = false,
                    Message = "Error updating notes",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<bool> DeleteTrialBalanceAsync(Guid id)
        {
            try
            {
                var trialBalance = await _context.TrialBalances.FindAsync(id);

                if (trialBalance == null)
                    return false;

                if (trialBalance.Status == TrialBalanceStatus.Approved)
                {
                    throw new InvalidOperationException("Cannot delete approved trial balance");
                }

                // Delete entries first
                var entries = await _context.TrialBalanceEntries
                    .Where(e => e.TrialBalanceId == id)
                    .ToListAsync();

                _context.TrialBalanceEntries.RemoveRange(entries);
                _context.TrialBalances.Remove(trialBalance);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting trial balance with ID: {Id}", id);
                throw;
            }
        }

        public async Task<TrialBalanceValidationResult> ValidateTrialBalanceAsync(Guid id)
        {
            try
            {
                var trialBalance = await _context.TrialBalances.FindAsync(id);

                if (trialBalance == null)
                {
                    return new TrialBalanceValidationResult
                    {
                        IsValid = false,
                        Errors = new List<string> { "Trial balance not found" }
                    };
                }

                var result = new TrialBalanceValidationResult
                {
                    TotalDebits = trialBalance.TotalDebits,
                    TotalCredits = trialBalance.TotalCredits,
                    Variance = Math.Abs(trialBalance.TotalDebits - trialBalance.TotalCredits),
                    IsBalanced = trialBalance.IsBalanced
                };

                result.IsValid = result.IsBalanced;

                if (!result.IsBalanced)
                {
                    result.Errors.Add($"Trial balance is not balanced. Variance: {result.Variance:C}");
                }

                if (result.Variance > 0.01m && result.Variance <= 1.00m)
                {
                    result.Warnings.Add("Small variance detected. Please review for rounding differences.");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating trial balance with ID: {Id}", id);
                return new TrialBalanceValidationResult
                {
                    IsValid = false,
                    Errors = new List<string> { "Error validating trial balance" }
                };
            }
        }

        // Private helper methods
        private async Task<decimal> CalculateAccountBalance(Guid accountId, DateTime? fromDate = null, DateTime? toDate = null)
        {
            var query = from line in _context.JournalEntryLines
                       join journal in _context.JournalEntries on line.JournalEntryId equals journal.Id
                       where line.AccountId == accountId && journal.Status == JournalStatus.Posted
                       select new { line, journal };

            if (fromDate.HasValue)
                query = query.Where(x => x.journal.TransactionDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(x => x.journal.TransactionDate <= toDate.Value);

            var totals = await query
                .GroupBy(x => x.line.AccountId)
                .Select(g => new
                {
                    TotalDebits = g.Sum(x => x.line.Debit),
                    TotalCredits = g.Sum(x => x.line.Credit)
                })
                .FirstOrDefaultAsync();

            return (totals?.TotalDebits ?? 0) - (totals?.TotalCredits ?? 0);
        }

        private async Task<TrialBalanceDto> MapToDto(TrialBalance trialBalance)
        {
            var entries = await _context.TrialBalanceEntries
                .Where(e => e.TrialBalanceId == trialBalance.Id)
                .OrderBy(e => e.SortOrder)
                .ThenBy(e => e.AccountCode)
                .Select(e => new TrialBalanceEntryDto
                {
                    Id = e.Id,
                    AccountId = e.AccountId,
                    AccountCode = e.AccountCode,
                    AccountName = e.AccountName,
                    AccountType = e.AccountType,
                    OpeningBalance = e.OpeningBalance,
                    DebitMovements = e.DebitMovements,
                    CreditMovements = e.CreditMovements,
                    ClosingBalance = e.ClosingBalance,
                    SortOrder = e.SortOrder
                })
                .ToListAsync();

            return new TrialBalanceDto
            {
                Id = trialBalance.Id,
                Year = trialBalance.Year,
                Month = trialBalance.Month,
                CompanyName = trialBalance.CompanyName,
                CompanyAddress = trialBalance.CompanyAddress,
                TotalDebits = trialBalance.TotalDebits,
                TotalCredits = trialBalance.TotalCredits,
                IsBalanced = trialBalance.IsBalanced,
                Status = trialBalance.Status,
                Notes = trialBalance.Notes,
                GeneratedDate = trialBalance.GeneratedDate,
                GeneratedByUserId = trialBalance.GeneratedByUserId,
                ApprovedByUserId = trialBalance.ApprovedByUserId,
                ApprovedAt = trialBalance.ApprovedAt,
                Entries = entries
            };
        }

        private Guid GetCurrentUserId()
        {
            // TODO: Get from JWT token or authentication context
            return Guid.Parse("00000000-0000-0000-0000-000000000001");
        }
    }
}