using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Interfaces;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CashBookEntryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEnhancedCashBookService _enhancedCashBookService;
        private readonly ILogger<CashBookEntryController> _logger;

        public CashBookEntryController(
            ApplicationDbContext context, 
            IEnhancedCashBookService enhancedCashBookService,
            ILogger<CashBookEntryController> logger)
        {
            _context = context;
            _enhancedCashBookService = enhancedCashBookService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new cash book entry (enhanced version)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateCashBookEntry([FromBody] CreateCashBookEntryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _enhancedCashBookService.CreateCashBookEntryAsync(request);
                
                if (!result.Success)
                {
                    return BadRequest(new { Success = false, Message = result.Message, Errors = result.Errors });
                }

                return CreatedAtAction(nameof(GetCashBookEntry), new { id = result.Entry!.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cash book entry");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Save cash book entry as draft
        /// </summary>
        [HttpPost("draft")]
        public async Task<IActionResult> SaveDraft([FromBody] CreateCashBookEntryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                request.SaveAsDraft = true;
                var result = await _enhancedCashBookService.SaveDraftAsync(request);
                
                if (!result.Success)
                {
                    return BadRequest(new { Success = false, Message = result.Message, Errors = result.Errors });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving cash book entry draft");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get cash book entries with filtering and pagination
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCashBookEntries([FromQuery] CashBookFilterRequest filter)
        {
            try
            {
                var result = await _enhancedCashBookService.GetCashBookEntriesAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cash book entries");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Get cash book entry by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCashBookEntry(Guid id)
        {
            try
            {
                var entry = await _enhancedCashBookService.GetCashBookEntryByIdAsync(id);
                
                if (entry == null)
                {
                    return NotFound(new { Success = false, Message = "Cash book entry not found" });
                }

                return Ok(entry);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cash book entry with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Update cash book entry
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCashBookEntry(Guid id, [FromBody] UpdateCashBookEntryRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _enhancedCashBookService.UpdateCashBookEntryAsync(id, request);
                
                if (!result.Success)
                {
                    return BadRequest(new { Success = false, Message = result.Message, Errors = result.Errors });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cash book entry with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Complete cash book entry (lock for editing)
        /// </summary>
        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> CompleteEntry(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _enhancedCashBookService.CompleteEntryAsync(id, userId);
                
                if (!result.Success)
                {
                    return BadRequest(new { Success = false, Message = result.Message, Errors = result.Errors });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing cash book entry with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Approve cash book entry
        /// </summary>
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> ApproveEntry(Guid id, [FromBody] ApprovalRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _enhancedCashBookService.ApproveEntryAsync(id, userId, request.Notes);
                
                if (!result.Success)
                {
                    return BadRequest(new { Success = false, Message = result.Message, Errors = result.Errors });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error approving cash book entry with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Reject cash book entry
        /// </summary>
        [HttpPatch("{id}/reject")]
        public async Task<IActionResult> RejectEntry(Guid id, [FromBody] RejectionRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Reason))
                {
                    return BadRequest(new { Success = false, Message = "Rejection reason is required" });
                }

                var userId = GetCurrentUserId();
                var result = await _enhancedCashBookService.RejectEntryAsync(id, userId, request.Reason);
                
                if (!result.Success)
                {
                    return BadRequest(new { Success = false, Message = result.Message, Errors = result.Errors });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rejecting cash book entry with ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Create reversing entry for completed transaction
        /// </summary>
        [HttpPost("{id}/reverse")]
        public async Task<IActionResult> ReverseEntry(Guid id, [FromBody] ReversalRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Reason))
                {
                    return BadRequest(new { Success = false, Message = "Reversal reason is required" });
                }

                var userId = GetCurrentUserId();
                var result = await _enhancedCashBookService.CreateReversingEntryAsync(id, userId, request.Reason);
                
                if (!result.Success)
                {
                    return BadRequest(new { Success = false, Message = result.Message, Errors = result.Errors });
                }

                return CreatedAtAction(nameof(GetCashBookEntry), new { id = result.Entry!.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating reversing entry for ID: {Id}", id);
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        /// <summary>
        /// Search cash book entries (autocomplete)
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchEntries([FromQuery] string? query, [FromQuery] int limit = 10)
        {
            try
            {
                var filter = new CashBookFilterRequest
                {
                    Description = query,
                    ReferenceNumber = query,
                    PageSize = limit,
                    Page = 1
                };

                var result = await _enhancedCashBookService.GetCashBookEntriesAsync(filter);
                
                var searchResults = result.Items.Select(e => new
                {
                    e.Id,
                    e.JournalNumber,
                    e.ReferenceNumber,
                    e.Description,
                    e.TransactionDate,
                    e.TotalDebit,
                    e.TotalCredit,
                    e.Status,
                    e.TransactionStatus
                }).ToList();

                return Ok(searchResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching cash book entries");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        [HttpPost("credit-transaction")]
        public async Task<IActionResult> SaveCreditTransaction([FromBody] CreditTransactionDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await ProcessSingleCreditTransaction(request);
                
                return Ok(new
                {
                    Success = true,
                    Message = "Credit transaction saved successfully",
                    TransactionId = result.TransactionId,
                    JournalEntryId = result.JournalEntryId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving credit transaction");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        [HttpPost("debit-transaction")]
        public async Task<IActionResult> SaveDebitTransaction([FromBody] DebitTransactionDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await ProcessSingleDebitTransaction(request);
                
                return Ok(new
                {
                    Success = true,
                    Message = "Debit transaction saved successfully",
                    TransactionId = result.TransactionId,
                    JournalEntryId = result.JournalEntryId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving debit transaction");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        [HttpPost("create-entry")]
        public async Task<IActionResult> CreateCashBookEntryLegacy([FromBody] CashBookEntryDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await ProcessCashBookEntry(request);
                
                return Ok(new
                {
                    Success = true,
                    Message = "Cash book entry created successfully",
                    JournalEntryId = result.JournalEntryId,
                    AccountsCreated = result.AccountsCreated,
                    ContactsCreated = result.ContactsCreated,
                    TransactionsProcessed = result.TransactionsProcessed
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cash book entry");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
                var categories = await _context.Categories
                    .Where(c => c.IsActive)
                    .Select(c => new CategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        AccountCode = "", // Categories don't have account codes
                        AccountType = c.Type.ToString() // Credit or Debit
                    })
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching categories");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        [HttpGet("contacts")]
        public async Task<IActionResult> GetContacts()
        {
            try
            {
                var contacts = await _context.Contacts
                    .Where(c => c.IsActive)
                    .Select(c => new ContactDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        CompanyName = c.CompanyName,
                        ContactType = c.ContactType.ToString()
                    })
                    .OrderBy(c => c.Name)
                    .ToListAsync();

                return Ok(contacts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching contacts");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        [HttpGet("recent-transactions")]
        public async Task<IActionResult> GetRecentTransactions([FromQuery] int limit = 50)
        {
            try
            {
                var recentJournalEntries = await _context.JournalEntries
                    .Include(je => je.JournalEntryLines)
                    .ThenInclude(jel => jel.Account)
                    .Where(je => je.Description != null && (je.Description.Contains("Credit:") || je.Description.Contains("Debit:")))
                    .OrderByDescending(je => je.TransactionDate)
                    .Take(limit)
                    .ToListAsync();

                var transactions = new List<object>();

                foreach (var entry in recentJournalEntries)
                {
                    var line = entry.JournalEntryLines.FirstOrDefault();
                    if (line != null)
                    {
                        var isCredit = entry.Description?.StartsWith("Credit:") ?? false;
                        transactions.Add(new
                        {
                            Id = entry.Id.ToString(),
                            Date = entry.TransactionDate,
                            Type = isCredit ? "Credit" : "Debit",
                            CategoryName = line.Account?.AccountName ?? "Unknown",
                            Particulars = entry.Description?.Replace("Credit: ", "").Replace("Debit: ", "") ?? "",
                            Amount = isCredit ? line.Credit : line.Debit,
                            ReferenceNumber = entry.ReferenceNumber,
                            ContactName = line.Reference,
                            CreatedAt = entry.CreatedAt
                        });
                    }
                }

                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching recent transactions");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        [HttpGet("journal-entries")]
        public async Task<IActionResult> GetJournalEntries(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] string? type = null,
            [FromQuery] decimal? amountMin = null,
            [FromQuery] decimal? amountMax = null,
            [FromQuery] string? category = null,
            [FromQuery] string? referenceNumber = null,
            [FromQuery] string? contactName = null,
            [FromQuery] string? description = null)
        {
            try
            {
                var query = _context.JournalEntries
                    .Include(je => je.JournalEntryLines)
                    .ThenInclude(jel => jel.Account)
                    .Where(je => je.Description != null && (je.Description.Contains("Credit:") || je.Description.Contains("Debit:")))
                    .AsQueryable();

                // Apply filters
                if (dateFrom.HasValue)
                {
                    query = query.Where(je => je.TransactionDate >= dateFrom.Value);
                }

                if (dateTo.HasValue)
                {
                    query = query.Where(je => je.TransactionDate <= dateTo.Value);
                }

                if (!string.IsNullOrEmpty(type) && type != "All")
                {
                    if (type == "Credit")
                    {
                        query = query.Where(je => je.Description!.StartsWith("Credit:"));
                    }
                    else if (type == "Debit")
                    {
                        query = query.Where(je => je.Description!.StartsWith("Debit:"));
                    }
                }

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(je => je.JournalEntryLines.Any(jel => jel.Account!.AccountName.Contains(category)));
                }

                if (!string.IsNullOrEmpty(referenceNumber))
                {
                    query = query.Where(je => je.ReferenceNumber.Contains(referenceNumber));
                }

                if (!string.IsNullOrEmpty(contactName))
                {
                    query = query.Where(je => je.JournalEntryLines.Any(jel => jel.Reference != null && jel.Reference.Contains(contactName)));
                }

                if (!string.IsNullOrEmpty(description))
                {
                    query = query.Where(je => je.Description!.Contains(description));
                }

                if (amountMin.HasValue)
                {
                    query = query.Where(je => je.JournalEntryLines.Any(jel => jel.Credit >= amountMin.Value || jel.Debit >= amountMin.Value));
                }

                if (amountMax.HasValue)
                {
                    query = query.Where(je => je.JournalEntryLines.Any(jel => jel.Credit <= amountMax.Value || jel.Debit <= amountMax.Value));
                }

                // Get total count for pagination
                var totalEntries = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalEntries / limit);

                // Apply pagination and ordering
                var journalEntries = await query
                    .OrderByDescending(je => je.TransactionDate)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                var entries = new List<object>();

                foreach (var entry in journalEntries)
                {
                    var line = entry.JournalEntryLines.FirstOrDefault();
                    if (line != null)
                    {
                        var isCredit = entry.Description?.StartsWith("Credit:") ?? false;
                        entries.Add(new
                        {
                            Id = entry.Id.ToString(),
                            JournalNumber = entry.JournalNumber,
                            TransactionDate = entry.TransactionDate,
                            Type = isCredit ? "Credit" : "Debit",
                            CategoryName = line.Account?.AccountName ?? "Unknown",
                            Particulars = entry.Description?.Replace("Credit: ", "").Replace("Debit: ", "") ?? "",
                            Amount = isCredit ? line.Credit : line.Debit,
                            ReferenceNumber = entry.ReferenceNumber,
                            ContactName = line.Reference,
                            AccountName = line.Account?.AccountName ?? "Unknown",
                            CreatedAt = entry.CreatedAt
                        });
                    }
                }

                return Ok(new
                {
                    Entries = entries,
                    TotalEntries = totalEntries,
                    TotalPages = totalPages,
                    CurrentPage = page,
                    PageSize = limit
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching journal entries");
                return StatusCode(500, new { Success = false, Message = "Internal server error" });
            }
        }

        private async Task<CashBookProcessResult> ProcessCashBookEntry(CashBookEntryDto request)
        {
            var result = new CashBookProcessResult();
            var cashAccountId = await GetOrCreateCashAccount();

            // Create journal entry
            var journalEntry = new JournalEntry
            {
                JournalNumber = await GenerateJournalNumber(),
                TransactionDate = request.TransactionDate,
                JournalType = JournalType.General,
                ReferenceNumber = request.ReferenceNumber,
                Description = request.Description ?? "Cash Book Entry",
                Status = JournalStatus.Posted,
                CreatedByUserId = GetCurrentUserId()
            };

            var journalLines = new List<JournalEntryLine>();
            var lineOrder = 1;

            // Process credit transactions (Money In)
            foreach (var credit in request.CreditTransactions)
            {
                var accountId = await GetOrCreateAccount(credit.CategoryName, DetermineAccountType(credit.CategoryName));
                if (accountId != Guid.Empty)
                {
                    result.AccountsCreated++;
                }

                // Look up category by name (Credit type)
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == credit.CategoryName && c.Type == CategoryType.Credit && c.IsActive);

                // Credit the source account
                journalLines.Add(new JournalEntryLine
                {
                    JournalEntryId = journalEntry.Id,
                    AccountId = accountId,
                    // CategoryId = category?.Id, // Reference to new Category system - temporarily disabled
                    Credit = credit.Amount,
                    Debit = 0,
                    Description = credit.Particulars,
                    Reference = credit.ContactName,
                    LineOrder = lineOrder++
                });

                // Debit cash account
                journalLines.Add(new JournalEntryLine
                {
                    JournalEntryId = journalEntry.Id,
                    AccountId = cashAccountId,
                    // CategoryId = null, // Cash account doesn't need category reference - temporarily disabled
                    Debit = credit.Amount,
                    Credit = 0,
                    Description = $"Cash from {credit.CategoryName}",
                    Reference = credit.ContactName,
                    LineOrder = lineOrder++
                });

                // Create contact if provided
                if (!string.IsNullOrWhiteSpace(credit.ContactName))
                {
                    var contactCreated = await GetOrCreateContact(credit.ContactName, ContactType.Customer);
                    if (contactCreated) result.ContactsCreated++;
                }

                result.TransactionsProcessed++;
            }

            // Process debit transactions (Money Out)
            foreach (var debit in request.DebitTransactions)
            {
                var accountId = await GetOrCreateAccount(debit.CategoryName, DetermineAccountType(debit.CategoryName));
                if (accountId != Guid.Empty)
                {
                    result.AccountsCreated++;
                }

                // Look up category by name (Debit type)
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == debit.CategoryName && c.Type == CategoryType.Debit && c.IsActive);

                // Debit the expense/asset account
                journalLines.Add(new JournalEntryLine
                {
                    JournalEntryId = journalEntry.Id,
                    AccountId = accountId,
                    // CategoryId = category?.Id, // Reference to new Category system - temporarily disabled
                    Debit = debit.Amount,
                    Credit = 0,
                    Description = debit.Particulars,
                    Reference = debit.SupplierName ?? debit.BuyerName,
                    LineOrder = lineOrder++
                });

                // Credit cash account
                journalLines.Add(new JournalEntryLine
                {
                    JournalEntryId = journalEntry.Id,
                    AccountId = cashAccountId,
                    // CategoryId = null, // Cash account doesn't need category reference - temporarily disabled
                    Credit = debit.Amount,
                    Debit = 0,
                    Description = $"Cash paid for {debit.CategoryName}",
                    Reference = debit.SupplierName ?? debit.BuyerName,
                    LineOrder = lineOrder++
                });

                // Create contacts if provided
                if (!string.IsNullOrWhiteSpace(debit.SupplierName))
                {
                    var contactCreated = await GetOrCreateContact(debit.SupplierName, ContactType.Supplier);
                    if (contactCreated) result.ContactsCreated++;
                }
                if (!string.IsNullOrWhiteSpace(debit.BuyerName))
                {
                    var contactCreated = await GetOrCreateContact(debit.BuyerName, ContactType.Customer);
                    if (contactCreated) result.ContactsCreated++;
                }

                result.TransactionsProcessed++;
            }

            // Calculate totals
            journalEntry.TotalDebit = journalLines.Sum(l => l.Debit);
            journalEntry.TotalCredit = journalLines.Sum(l => l.Credit);

            // Validate balance
            if (Math.Abs(journalEntry.TotalDebit - journalEntry.TotalCredit) > 0.01m)
            {
                throw new InvalidOperationException("Journal entry is not balanced");
            }

            // Save to database
            _context.JournalEntries.Add(journalEntry);
            _context.JournalEntryLines.AddRange(journalLines);
            await _context.SaveChangesAsync();

            result.JournalEntryId = journalEntry.Id;
            return result;
        }

        private async Task<Guid> GetOrCreateCashAccount()
        {
            var cashAccount = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.AccountCode == "1100" && a.AccountName == "Cash on Hand");

            if (cashAccount == null)
            {
                cashAccount = new ChartOfAccount
                {
                    AccountCode = "1100",
                    AccountName = "Cash on Hand",
                    AccountType = AccountType.Asset,
                    Description = "Default cash account for cash book transactions",
                    IsActive = true
                };
                _context.ChartOfAccounts.Add(cashAccount);
                await _context.SaveChangesAsync();
            }

            return cashAccount.Id;
        }

        private async Task<Guid> GetOrCreateAccount(string categoryName, AccountType accountType)
        {
            var account = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.AccountName == categoryName);

            if (account != null)
                return account.Id;

            var accountCode = await GenerateAccountCode(accountType);
            account = new ChartOfAccount
            {
                AccountCode = accountCode,
                AccountName = categoryName,
                AccountType = accountType,
                Description = $"Auto-created from cash book entry",
                IsActive = true
            };

            _context.ChartOfAccounts.Add(account);
            await _context.SaveChangesAsync();
            return account.Id;
        }

        private async Task<bool> GetOrCreateContact(string contactName, ContactType contactType)
        {
            var existingContact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.Name == contactName || c.CompanyName == contactName);

            if (existingContact != null)
                return false;

            var contact = new Contact
            {
                Name = contactName,
                CompanyName = contactName,
                ContactType = contactType,
                Email = $"{contactName.ToLower().Replace(" ", "")}@{contactType.ToString().ToLower()}.com",
                IsActive = true
            };

            _context.Contacts.Add(contact);
            await _context.SaveChangesAsync();
            return true;
        }

        private AccountType DetermineAccountType(string categoryName)
        {
            var lowerCategory = categoryName.ToLower();

            // Liability patterns
            if (lowerCategory.Contains("loan") || lowerCategory.Contains("payable") || 
                lowerCategory.Contains("due") || lowerCategory.Contains("outstanding"))
                return AccountType.Liability;

            // Revenue patterns
            if (lowerCategory.Contains("received") || lowerCategory.Contains("sale") ||
                lowerCategory.Contains("income") || lowerCategory.Contains("revenue"))
                return AccountType.Revenue;

            // Asset patterns
            if (lowerCategory.Contains("machine") || lowerCategory.Contains("equipment") ||
                lowerCategory.Contains("building") || lowerCategory.Contains("vehicle") ||
                lowerCategory.Contains("furniture") || lowerCategory.Contains("cash"))
                return AccountType.Asset;

            // Default to expense for operational categories
            return AccountType.Expense;
        }

        private async Task<string> GenerateAccountCode(AccountType accountType)
        {
            var prefix = accountType switch
            {
                AccountType.Asset => "1",
                AccountType.Liability => "2", 
                AccountType.Equity => "3",
                AccountType.Revenue => "4",
                AccountType.Expense => "5",
                _ => "9"
            };

            var lastAccount = await _context.ChartOfAccounts
                .Where(a => a.AccountCode.StartsWith(prefix))
                .OrderByDescending(a => a.AccountCode)
                .FirstOrDefaultAsync();

            if (lastAccount == null)
                return $"{prefix}001";

            if (int.TryParse(lastAccount.AccountCode, out int lastCode))
            {
                return (lastCode + 1).ToString();
            }

            var sequence = await _context.ChartOfAccounts
                .Where(a => a.AccountCode.StartsWith(prefix))
                .CountAsync() + 1;

            return $"{prefix}{sequence:D3}";
        }

        private async Task<string> GenerateJournalNumber()
        {
            var today = DateTime.Today;
            var year = today.Year;
            var month = today.Month;

            var lastJournal = await _context.JournalEntries
                .Where(j => j.JournalNumber.StartsWith($"CB-{year}-{month:D2}"))
                .OrderByDescending(j => j.JournalNumber)
                .FirstOrDefaultAsync();

            if (lastJournal == null)
                return $"CB-{year}-{month:D2}-0001";

            var parts = lastJournal.JournalNumber.Split('-');
            if (parts.Length == 4 && int.TryParse(parts[3], out int lastNumber))
            {
                return $"CB-{year}-{month:D2}-{(lastNumber + 1):D4}";
            }

            var count = await _context.JournalEntries
                .Where(j => j.JournalNumber.StartsWith($"CB-{year}-{month:D2}"))
                .CountAsync() + 1;

            return $"CB-{year}-{month:D2}-{count:D4}";
        }

        private async Task<SingleTransactionResult> ProcessSingleCreditTransaction(CreditTransactionDto request)
        {
            var result = new SingleTransactionResult();
            var cashAccountId = await GetOrCreateCashAccount();

            // Create journal entry for this single credit transaction
            var journalEntry = new JournalEntry
            {
                JournalNumber = await GenerateJournalNumber(),
                TransactionDate = request.Date,
                JournalType = JournalType.General,
                ReferenceNumber = $"CR-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..8]}",
                Description = $"Credit: {request.Particulars}",
                Status = JournalStatus.Posted,
                CreatedByUserId = GetCurrentUserId()
            };

            var journalLines = new List<JournalEntryLine>();

            // Get or create account for the category
            var accountId = await GetOrCreateAccount(request.CategoryName, DetermineAccountType(request.CategoryName));

            // Credit the source account (money coming in from this source)
            journalLines.Add(new JournalEntryLine
            {
                JournalEntryId = journalEntry.Id,
                AccountId = accountId,
                Credit = request.Amount,
                Debit = 0,
                Description = request.Particulars,
                Reference = request.ContactName,
                LineOrder = 1
            });

            // Debit cash account (cash increases)
            journalLines.Add(new JournalEntryLine
            {
                JournalEntryId = journalEntry.Id,
                AccountId = cashAccountId,
                Debit = request.Amount,
                Credit = 0,
                Description = $"Cash from {request.CategoryName}",
                Reference = request.ContactName,
                LineOrder = 2
            });

            // Create contact if provided
            if (!string.IsNullOrWhiteSpace(request.ContactName))
            {
                await GetOrCreateContact(request.ContactName, ContactType.Customer);
            }

            // Set totals
            journalEntry.TotalDebit = request.Amount;
            journalEntry.TotalCredit = request.Amount;

            // Save to database
            _context.JournalEntries.Add(journalEntry);
            _context.JournalEntryLines.AddRange(journalLines);
            await _context.SaveChangesAsync();

            result.JournalEntryId = journalEntry.Id;
            result.TransactionId = journalEntry.Id; // Using journal entry ID as transaction ID
            return result;
        }

        private async Task<SingleTransactionResult> ProcessSingleDebitTransaction(DebitTransactionDto request)
        {
            var result = new SingleTransactionResult();
            var cashAccountId = await GetOrCreateCashAccount();

            // Create journal entry for this single debit transaction
            var journalEntry = new JournalEntry
            {
                JournalNumber = await GenerateJournalNumber(),
                TransactionDate = request.Date,
                JournalType = JournalType.General,
                ReferenceNumber = $"DR-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..8]}",
                Description = $"Debit: {request.Particulars}",
                Status = JournalStatus.Posted,
                CreatedByUserId = GetCurrentUserId()
            };

            var journalLines = new List<JournalEntryLine>();

            // Get or create account for the category
            var accountId = await GetOrCreateAccount(request.CategoryName, DetermineAccountType(request.CategoryName));

            // Debit the expense/asset account (money going out for this purpose)
            journalLines.Add(new JournalEntryLine
            {
                JournalEntryId = journalEntry.Id,
                AccountId = accountId,
                Debit = request.Amount,
                Credit = 0,
                Description = request.Particulars,
                Reference = request.SupplierName ?? request.BuyerName,
                LineOrder = 1
            });

            // Credit cash account (cash decreases)
            journalLines.Add(new JournalEntryLine
            {
                JournalEntryId = journalEntry.Id,
                AccountId = cashAccountId,
                Credit = request.Amount,
                Debit = 0,
                Description = $"Cash paid for {request.CategoryName}",
                Reference = request.SupplierName ?? request.BuyerName,
                LineOrder = 2
            });

            // Create contacts if provided
            if (!string.IsNullOrWhiteSpace(request.SupplierName))
            {
                await GetOrCreateContact(request.SupplierName, ContactType.Supplier);
            }
            if (!string.IsNullOrWhiteSpace(request.BuyerName))
            {
                await GetOrCreateContact(request.BuyerName, ContactType.Customer);
            }

            // Set totals
            journalEntry.TotalDebit = request.Amount;
            journalEntry.TotalCredit = request.Amount;

            // Save to database
            _context.JournalEntries.Add(journalEntry);
            _context.JournalEntryLines.AddRange(journalLines);
            await _context.SaveChangesAsync();

            result.JournalEntryId = journalEntry.Id;
            result.TransactionId = journalEntry.Id; // Using journal entry ID as transaction ID
            return result;
        }

        private Guid GetCurrentUserId()
        {
            // TODO: Get from JWT token or authentication context
            return Guid.Parse("00000000-0000-0000-0000-000000000001");
        }
    }

    // DTOs
    public class CashBookEntryDto
    {
        [Required]
        public DateTime TransactionDate { get; set; }

        [Required]
        [StringLength(50)]
        public string ReferenceNumber { get; set; } = string.Empty;

        public string? Description { get; set; }

        public List<CreditTransactionDto> CreditTransactions { get; set; } = new();
        public List<DebitTransactionDto> DebitTransactions { get; set; } = new();
    }

    public class CreditTransactionDto
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(200)]
        public string CategoryName { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Particulars { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public string? ContactName { get; set; }
    }

    public class DebitTransactionDto
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [StringLength(200)]
        public string CategoryName { get; set; } = string.Empty;

        public string? SupplierName { get; set; }
        public string? BuyerName { get; set; }

        [Required]
        [StringLength(500)]
        public string Particulars { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
    }

    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string AccountCode { get; set; } = string.Empty;
        public string AccountType { get; set; } = string.Empty;
    }

    public class ContactDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string ContactType { get; set; } = string.Empty;
    }

    public class CashBookProcessResult
    {
        public Guid JournalEntryId { get; set; }
        public int AccountsCreated { get; set; }
        public int ContactsCreated { get; set; }
        public int TransactionsProcessed { get; set; }
    }

    public class SingleTransactionResult
    {
        public Guid JournalEntryId { get; set; }
        public Guid TransactionId { get; set; }
    }

    // Additional DTOs for lifecycle management
    public class ApprovalRequest
    {
        public string? Notes { get; set; }
    }

    public class RejectionRequest
    {
        [Required]
        public string Reason { get; set; } = string.Empty;
    }

    public class ReversalRequest
    {
        [Required]
        public string Reason { get; set; } = string.Empty;
    }
}
