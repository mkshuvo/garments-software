using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Accounting;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    public class EnhancedCashBookService : IEnhancedCashBookService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITransactionValidator _transactionValidator;
        private readonly IBalanceService _balanceService;
        private readonly ILogger<EnhancedCashBookService> _logger;

        public EnhancedCashBookService(
            ApplicationDbContext context,
            ITransactionValidator transactionValidator,
            IBalanceService balanceService,
            ILogger<EnhancedCashBookService> logger)
        {
            _context = context;
            _transactionValidator = transactionValidator;
            _balanceService = balanceService;
            _logger = logger;
        }

        public async Task<CashBookEntryResult> CreateCashBookEntryAsync(CreateCashBookEntryRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Validate the request
                var validationResult = await _transactionValidator.ValidateBusinessRulesAsync(
                    new CreateTransactionRequest
                    {
                        TransactionDate = request.TransactionDate,
                        ReferenceNumber = request.ReferenceNumber,
                        Description = request.Description,
                        Lines = request.Lines.Select(l => new TransactionLineDto
                        {
                            AccountId = l.AccountId,
                            Debit = l.Debit,
                            Credit = l.Credit,
                            Description = l.Description,
                            Reference = l.Reference,
                            ContactId = l.ContactId
                        }).ToList()
                    });

                if (!validationResult.IsValid)
                {
                    return new CashBookEntryResult
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = validationResult.Errors.Select(e => e.Message).ToList(),
                        Warnings = validationResult.Warnings.Select(w => w.Message).ToList()
                    };
                }

                // Create journal entry
                var journalEntry = new JournalEntry
                {
                    Id = Guid.NewGuid(),
                    TransactionDate = request.TransactionDate,
                    ReferenceNumber = request.ReferenceNumber,
                    Description = request.Description,
                    TransactionStatus = TransactionStatus.Draft,
                    Status = JournalStatus.Draft,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = Guid.NewGuid() // TODO: Get from current user context
                };

                _context.JournalEntries.Add(journalEntry);

                // Create journal entry lines
                var journalLines = new List<JournalEntryLine>();
                foreach (var line in request.Lines)
                {
                    var journalLine = new JournalEntryLine
                    {
                        Id = Guid.NewGuid(),
                        JournalEntryId = journalEntry.Id,
                        AccountId = line.AccountId,
                        ContactId = line.ContactId,
                        Debit = line.Debit,
                        Credit = line.Credit,
                        Description = line.Description,
                        Reference = line.Reference
                    };

                    journalLines.Add(journalLine);
                    _context.JournalEntryLines.Add(journalLine);
                }

                await _context.SaveChangesAsync();

                // Update balance cache for affected accounts
                foreach (var line in request.Lines)
                {
                    if (line.Debit > 0)
                    {
                        await _balanceService.UpdateBalanceCacheAsync(line.AccountId, line.Debit, true);
                    }
                    if (line.Credit > 0)
                    {
                        await _balanceService.UpdateBalanceCacheAsync(line.AccountId, line.Credit, false);
                    }
                }

                await transaction.CommitAsync();

                var result = await MapToDto(journalEntry, journalLines);
                
                _logger.LogInformation("Cash book entry created successfully: {EntryId}", journalEntry.Id);

                return new CashBookEntryResult
                {
                    Success = true,
                    Message = "Cash book entry created successfully",
                    Entry = result,
                    Warnings = validationResult.Warnings.Select(w => w.Message).ToList()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating cash book entry");
                return new CashBookEntryResult
                {
                    Success = false,
                    Message = "Failed to create cash book entry",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<CashBookEntryResult> CompleteEntryAsync(Guid entryId, Guid userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var journalEntry = await _context.JournalEntries
                    .Include(j => j.JournalEntryLines)
                    .FirstOrDefaultAsync(j => j.Id == entryId);

                if (journalEntry == null)
                {
                    return new CashBookEntryResult
                    {
                        Success = false,
                        Message = "Journal entry not found",
                        Errors = new List<string> { "Entry does not exist" }
                    };
                }

                // Validate immutability
                var immutabilityResult = await _transactionValidator.ValidateImmutabilityAsync(entryId);
                if (!immutabilityResult.IsValid)
                {
                    return new CashBookEntryResult
                    {
                        Success = false,
                        Message = "Cannot complete entry",
                        Errors = immutabilityResult.Errors.Select(e => e.Message).ToList()
                    };
                }

                // Validate complete transaction
                var validationResult = await _transactionValidator.ValidateCompleteTransactionAsync(
                    journalEntry, journalEntry.JournalEntryLines.ToList());

                if (!validationResult.IsValid)
                {
                    return new CashBookEntryResult
                    {
                        Success = false,
                        Message = "Validation failed for completion",
                        Errors = validationResult.Errors.Select(e => e.Message).ToList(),
                        Warnings = validationResult.Warnings.Select(w => w.Message).ToList()
                    };
                }

                // Update status to completed
                journalEntry.TransactionStatus = TransactionStatus.Completed;
                journalEntry.Status = JournalStatus.Approved;
                journalEntry.ApprovedAt = DateTime.UtcNow;
                journalEntry.ApprovedByUserId = userId;

                await _context.SaveChangesAsync();

                // Refresh balance cache to ensure accuracy
                var affectedAccounts = journalEntry.JournalEntryLines.Select(l => l.AccountId).Distinct();
                foreach (var accountId in affectedAccounts)
                {
                    await _balanceService.ClearAccountBalanceCacheAsync(accountId);
                }

                await transaction.CommitAsync();

                var result = await MapToDto(journalEntry, journalEntry.JournalEntryLines.ToList());

                _logger.LogInformation("Cash book entry completed: {EntryId} by user {UserId}", entryId, userId);

                return new CashBookEntryResult
                {
                    Success = true,
                    Message = "Entry completed successfully",
                    Entry = result,
                    Warnings = validationResult.Warnings.Select(w => w.Message).ToList()
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error completing cash book entry: {EntryId}", entryId);
                return new CashBookEntryResult
                {
                    Success = false,
                    Message = "Failed to complete entry",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<CashBookEntryResult> SaveDraftAsync(CreateCashBookEntryRequest request)
        {
            // For draft, we skip some validations but still create the entry
            var result = await CreateCashBookEntryAsync(request);
            
            if (result.Success && result.Entry != null)
            {
                result.Message = "Draft saved successfully";
            }
            
            return result;
        }

        public async Task<CashBookEntryDto?> GetCashBookEntryByIdAsync(Guid entryId)
        {
            try
            {
                var journalEntry = await _context.JournalEntries
                    .Include(j => j.JournalEntryLines)
                    .FirstOrDefaultAsync(j => j.Id == entryId);

                if (journalEntry == null)
                    return null;

                return await MapToDto(journalEntry, journalEntry.JournalEntryLines.ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cash book entry: {EntryId}", entryId);
                return null;
            }
        }

        public async Task<PagedResult<CashBookEntryDto>> GetCashBookEntriesAsync(CashBookFilterRequest filter)
        {
            try
            {
                var query = _context.JournalEntries
                    .Include(j => j.JournalEntryLines)
                    .AsQueryable();

                // Apply filters
                if (filter.FromDate.HasValue)
                    query = query.Where(j => j.TransactionDate >= filter.FromDate.Value);

                if (filter.ToDate.HasValue)
                    query = query.Where(j => j.TransactionDate <= filter.ToDate.Value);

                if (!string.IsNullOrEmpty(filter.ReferenceNumber))
                    query = query.Where(j => j.ReferenceNumber.Contains(filter.ReferenceNumber));

                if (filter.Status.HasValue)
                    query = query.Where(j => j.Status == filter.Status.Value);

                if (filter.TransactionStatus.HasValue)
                    query = query.Where(j => j.TransactionStatus == filter.TransactionStatus.Value);

                // Get total count
                var totalCount = await query.CountAsync();

                // Apply pagination
                var entries = await query
                    .OrderByDescending(j => j.TransactionDate)
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                var dtos = new List<CashBookEntryDto>();
                foreach (var entry in entries)
                {
                    var dto = await MapToDto(entry, entry.JournalEntryLines.ToList());
                    dtos.Add(dto);
                }

                return new PagedResult<CashBookEntryDto>
                {
                    Items = dtos,
                    TotalCount = totalCount,
                    Page = filter.Page,
                    PageSize = filter.PageSize
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cash book entries");
                return new PagedResult<CashBookEntryDto>
                {
                    Items = new List<CashBookEntryDto>(),
                    TotalCount = 0,
                    Page = filter.Page,
                    PageSize = filter.PageSize
                };
            }
        }

        public Task<bool> ValidateDoubleEntryAsync(List<CashBookLineDto> lines)
        {
            var totalDebits = lines.Sum(l => l.Debit);
            var totalCredits = lines.Sum(l => l.Credit);
            
            return Task.FromResult(Math.Abs(totalDebits - totalCredits) < 0.01m);
        }

        public Task<decimal> CalculateBalanceAsync(List<CashBookLineDto> lines)
        {
            var totalDebits = lines.Sum(l => l.Debit);
            var totalCredits = lines.Sum(l => l.Credit);
            
            return Task.FromResult(totalDebits - totalCredits);
        }

        #region Independent Transaction Methods

        public async Task<DTOs.SingleTransactionResult> SaveCreditTransactionAsync(DTOs.CreditTransactionDto request)
        {
            Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
            var useTransaction = !_context.Database.IsInMemory();
            if (useTransaction)
            {
                transaction = await _context.Database.BeginTransactionAsync();
            }
            try
            {
                // Get or create category and corresponding account
                var category = await GetOrCreateCategoryAsync(request.CategoryName, Models.Accounting.CategoryType.Credit);
                
                // Find the corresponding ChartOfAccount for this category
                var account = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(a => a.AccountName == category.Name && a.AccountType == AccountType.Revenue);
                
                if (account == null)
                {
                    throw new InvalidOperationException($"No ChartOfAccount found for category: {category.Name}");
                }
                
                // Get or create contact if provided
                var contactId = (Guid?)null;
                if (!string.IsNullOrWhiteSpace(request.ContactName))
                {
                    var contact = await GetOrCreateContactAsync(request.ContactName, Models.Contacts.ContactType.Customer);
                    contactId = contact.Id;
                }

                // Create journal entry
                var journalEntry = new JournalEntry
                {
                    Id = Guid.NewGuid(),
                    JournalNumber = await GenerateJournalNumberAsync(),
                    TransactionDate = request.Date.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(request.Date, DateTimeKind.Utc) : request.Date.ToUniversalTime(),
                    JournalType = JournalType.CashReceipt,
                    ReferenceNumber = $"CB-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..8]}",
                    Description = request.Particulars,
                    Status = JournalStatus.Posted,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = Guid.NewGuid() // TODO: Get from current user context
                };

                _context.JournalEntries.Add(journalEntry);

                // Create single journal entry line (credit only)
                var journalLine = new JournalEntryLine
                {
                    Id = Guid.NewGuid(),
                    JournalEntryId = journalEntry.Id,
                    AccountId = account.Id,
                    ContactId = contactId,
                    Debit = 0,
                    Credit = request.Amount,
                    Description = request.Particulars,
                    Reference = request.ContactName,
                    LineOrder = 1
                };

                _context.JournalEntryLines.Add(journalLine);

                await _context.SaveChangesAsync();
                if (useTransaction && transaction != null)
                {
                    await transaction.CommitAsync();
                }

                return DTOs.SingleTransactionResult.SuccessResult(
                    journalEntry.Id,
                    journalEntry.ReferenceNumber,
                    "Credit transaction saved successfully"
                );
            }
            catch (Exception ex)
            {
                if (useTransaction && transaction != null)
                {
                    await transaction.RollbackAsync();
                }
                _logger.LogError(ex, "Error saving credit transaction");
                return DTOs.SingleTransactionResult.FailedResult("Failed to save credit transaction", new List<string> { ex.Message });
            }
        }

        public async Task<DTOs.SingleTransactionResult> SaveDebitTransactionAsync(DTOs.DebitTransactionDto request)
        {
            Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction? transaction = null;
            var useTransaction = !_context.Database.IsInMemory();
            if (useTransaction)
            {
                transaction = await _context.Database.BeginTransactionAsync();
            }
            try
            {
                // Get or create category and corresponding account
                var category = await GetOrCreateCategoryAsync(request.CategoryName, Models.Accounting.CategoryType.Debit);
                
                // Find the corresponding ChartOfAccount for this category
                var account = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(a => a.AccountName == category.Name && a.AccountType == AccountType.Expense);
                
                if (account == null)
                {
                    throw new InvalidOperationException($"No ChartOfAccount found for category: {category.Name}");
                }
                
                // Get or create contact if provided
                var contactId = (Guid?)null;
                if (!string.IsNullOrWhiteSpace(request.SupplierName))
                {
                    var contact = await GetOrCreateContactAsync(request.SupplierName, Models.Contacts.ContactType.Supplier);
                    contactId = contact.Id;
                }
                else if (!string.IsNullOrWhiteSpace(request.BuyerName))
                {
                    var contact = await GetOrCreateContactAsync(request.BuyerName, Models.Contacts.ContactType.Customer);
                    contactId = contact.Id;
                }

                // Create journal entry
                var journalEntry = new JournalEntry
                {
                    Id = Guid.NewGuid(),
                    JournalNumber = await GenerateJournalNumberAsync(),
                    TransactionDate = request.Date.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(request.Date, DateTimeKind.Utc) : request.Date.ToUniversalTime(),
                    JournalType = JournalType.CashPayment,
                    ReferenceNumber = $"CB-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..8]}",
                    Description = request.Particulars,
                    Status = JournalStatus.Posted,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUserId = Guid.NewGuid() // TODO: Get from current user context
                };

                _context.JournalEntries.Add(journalEntry);

                // Create single journal entry line (debit only)
                var journalLine = new JournalEntryLine
                {
                    Id = Guid.NewGuid(),
                    JournalEntryId = journalEntry.Id,
                    AccountId = account.Id,
                    ContactId = contactId,
                    Debit = request.Amount,
                    Credit = 0,
                    Description = request.Particulars,
                    Reference = request.SupplierName ?? request.BuyerName,
                    LineOrder = 1
                };

                _context.JournalEntryLines.Add(journalLine);

                await _context.SaveChangesAsync();
                if (useTransaction && transaction != null)
                {
                    await transaction.CommitAsync();
                }

                return DTOs.SingleTransactionResult.SuccessResult(
                    journalEntry.Id,
                    journalEntry.ReferenceNumber,
                    "Debit transaction saved successfully"
                );
            }
            catch (Exception ex)
            {
                if (useTransaction && transaction != null)
                {
                    await transaction.RollbackAsync();
                }
                _logger.LogError(ex, "Error saving debit transaction");
                return DTOs.SingleTransactionResult.FailedResult("Failed to save debit transaction", new List<string> { ex.Message });
            }
        }

        public async Task<DTOs.RecentTransactionsResponse> GetRecentTransactionsAsync(int limit = 20)
        {
            try
            {
                var recentEntries = await _context.JournalEntries
                    .Include(je => je.JournalEntryLines)
                    .ThenInclude(jel => jel.Account)
                    .Where(je => je.JournalType == JournalType.CashReceipt || je.JournalType == JournalType.CashPayment)
                    .OrderByDescending(je => je.TransactionDate)
                    .Take(limit)
                    .ToListAsync();

                var transactions = new List<DTOs.SavedTransactionDto>();
                decimal totalCredits = 0;
                decimal totalDebits = 0;

                foreach (var entry in recentEntries)
                {
                    var line = entry.JournalEntryLines.FirstOrDefault();
                    if (line != null)
                    {
                                            var isCredit = entry.JournalType == JournalType.CashReceipt;
                    if (isCredit)
                        totalCredits += line.Credit;
                    else
                        totalDebits += line.Debit;

                    transactions.Add(new DTOs.SavedTransactionDto
                    {
                        Id = entry.Id,
                        Type = isCredit ? "Credit" : "Debit",
                        Date = entry.TransactionDate,
                        CategoryName = line.Account?.AccountName ?? "Unknown",
                        Particulars = entry.Description ?? "",
                        Amount = isCredit ? line.Credit : line.Debit,
                        ReferenceNumber = entry.ReferenceNumber,
                        ContactName = null, // TODO: Get contact name from ContactId if needed
                        SupplierName = !isCredit ? line.Reference : null,
                        BuyerName = isCredit ? line.Reference : null,
                        CreatedAt = entry.CreatedAt
                    });
                    }
                }

                return new DTOs.RecentTransactionsResponse
                {
                    Success = true,
                    Message = "Recent transactions retrieved successfully",
                    Transactions = transactions,
                    TotalCount = transactions.Count,
                    TotalCredits = totalCredits,
                    TotalDebits = totalDebits
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving recent transactions");
                return new DTOs.RecentTransactionsResponse
                {
                    Success = false,
                    Message = "Failed to retrieve recent transactions",
                    Transactions = new List<DTOs.SavedTransactionDto>(),
                    TotalCount = 0,
                    TotalCredits = 0,
                    TotalDebits = 0
                };
            }
        }

        #endregion

        #region Not Yet Implemented Methods

        public Task<CashBookEntryResult> UpdateCashBookEntryAsync(Guid entryId, UpdateCashBookEntryRequest request)
        {
            throw new NotImplementedException("Update functionality will be implemented in next iteration");
        }

        public Task<CashBookEntryResult> ApproveEntryAsync(Guid entryId, Guid userId, string? notes = null)
        {
            throw new NotImplementedException("Approval workflow will be implemented in next iteration");
        }

        public Task<CashBookEntryResult> RejectEntryAsync(Guid entryId, Guid userId, string reason)
        {
            throw new NotImplementedException("Rejection workflow will be implemented in next iteration");
        }

        public Task<CashBookEntryResult> CreateReversingEntryAsync(Guid originalEntryId, Guid userId, string reason)
        {
            throw new NotImplementedException("Reversing entries will be implemented in next iteration");
        }

        #endregion

        #region Private Methods

        private async Task<Models.Accounting.Category> GetOrCreateCategoryAsync(string categoryName, Models.Accounting.CategoryType type)
        {
            var existingCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name.ToLower() == categoryName.ToLower() && c.Type == type);

            if (existingCategory != null)
                return existingCategory;

            var newCategory = new Models.Accounting.Category
            {
                Id = Guid.NewGuid(),
                Name = categoryName,
                Type = type,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(newCategory);

            // Also create a corresponding ChartOfAccount
            var accountType = type == Models.Accounting.CategoryType.Credit ? AccountType.Revenue : AccountType.Expense;
            var accountCode = type == Models.Accounting.CategoryType.Credit ? "4" : "5"; // Revenue accounts start with 4, Expense with 5
            
            var newAccount = new ChartOfAccount
            {
                Id = Guid.NewGuid(),
                AccountCode = $"{accountCode}{DateTime.UtcNow:MMdd}{new Random().Next(100, 999)}",
                AccountName = categoryName,
                AccountType = accountType,
                Description = $"Auto-created account for category: {categoryName}",
                IsActive = true,
                IsDynamic = true,
                AllowTransactions = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChartOfAccounts.Add(newAccount);
            await _context.SaveChangesAsync();

            return newCategory;
        }

        private async Task<Models.Contacts.Contact> GetOrCreateContactAsync(string contactName, Models.Contacts.ContactType type)
        {
            var existingContact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.Name.ToLower() == contactName.ToLower() && c.ContactType == type);

            if (existingContact != null)
                return existingContact;

            var newContact = new Models.Contacts.Contact
            {
                Id = Guid.NewGuid(),
                Name = contactName,
                ContactType = type,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Contacts.Add(newContact);
            await _context.SaveChangesAsync();

            return newContact;
        }

        private async Task<string> GenerateJournalNumberAsync()
        {
            var today = DateTime.UtcNow.Date;
            var count = await _context.JournalEntries
                .Where(je => je.TransactionDate.Date == today)
                .CountAsync();

            return $"CB-{today:yyyyMMdd}-{(count + 1):D3}";
        }

        private async Task<CashBookEntryDto> MapToDto(JournalEntry journalEntry, List<JournalEntryLine> lines)
        {
            var dto = new CashBookEntryDto
            {
                Id = journalEntry.Id,
                TransactionDate = journalEntry.TransactionDate,
                ReferenceNumber = journalEntry.ReferenceNumber,
                Description = journalEntry.Description,
                Status = journalEntry.Status,
                TransactionStatus = journalEntry.TransactionStatus,
                TotalDebit = lines.Sum(l => l.Debit),
                TotalCredit = lines.Sum(l => l.Credit),
                CreatedAt = journalEntry.CreatedAt,
                Lines = new List<CashBookLineDto>()
            };

            foreach (var line in lines)
            {
                var account = await _context.ChartOfAccounts.FindAsync(line.AccountId);
                var contact = line.ContactId.HasValue ? await _context.Contacts.FindAsync(line.ContactId.Value) : null;

                dto.Lines.Add(new CashBookLineDto
                {
                    Id = line.Id,
                    AccountId = line.AccountId,
                    AccountCode = account?.AccountCode ?? "",
                    AccountName = account?.AccountName ?? "",
                    ContactId = line.ContactId,
                    ContactName = contact?.Name ?? "",
                    Debit = line.Debit,
                    Credit = line.Credit,
                    Description = line.Description,
                    Reference = line.Reference
                });
            }

            return dto;
        }

        #endregion
    }
}
