using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Contacts;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CashBookEntryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CashBookEntryController> _logger;

        public CashBookEntryController(ApplicationDbContext context, ILogger<CashBookEntryController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("create-entry")]
        public async Task<IActionResult> CreateCashBookEntry([FromBody] CashBookEntryDto request)
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
                var categories = await _context.ChartOfAccounts
                    .Where(c => c.IsActive)
                    .Select(c => new CategoryDto
                    {
                        Id = c.Id,
                        Name = c.AccountName,
                        AccountCode = c.AccountCode,
                        AccountType = c.AccountType.ToString()
                    })
                    .OrderBy(c => c.AccountCode)
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

                // Credit the source account
                journalLines.Add(new JournalEntryLine
                {
                    JournalEntryId = journalEntry.Id,
                    AccountId = accountId,
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

                // Debit the expense/asset account
                journalLines.Add(new JournalEntryLine
                {
                    JournalEntryId = journalEntry.Id,
                    AccountId = accountId,
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
}
