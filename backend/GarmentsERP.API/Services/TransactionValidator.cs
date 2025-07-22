using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Accounting;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    public class TransactionValidator : ITransactionValidator
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TransactionValidator> _logger;

        public TransactionValidator(ApplicationDbContext context, ILogger<TransactionValidator> logger)
        {
            _context = context;
            _logger = logger;
        }

        public Task<ValidationResult> ValidateDoubleEntryAsync(List<TransactionLineDto> lines)
        {
            try
            {
                if (lines == null || !lines.Any())
                {
                    return Task.FromResult(ValidationResult.Failure("Transaction must have at least one line"));
                }

                var totalDebits = lines.Sum(l => l.Debit);
                var totalCredits = lines.Sum(l => l.Credit);

                var result = new ValidationResult { IsValid = true };

                // Check if debits equal credits
                if (Math.Abs(totalDebits - totalCredits) > 0.01m)
                {
                    result.AddError("Lines", 
                        $"Transaction is not balanced. Total debits: {totalDebits:C}, Total credits: {totalCredits:C}",
                        "UNBALANCED_TRANSACTION");
                }

                // Check that each line has either debit or credit (not both, not neither)
                foreach (var line in lines.Select((value, index) => new { value, index }))
                {
                    var hasDebit = line.value.Debit > 0;
                    var hasCredit = line.value.Credit > 0;

                    if (hasDebit && hasCredit)
                    {
                        result.AddError($"Lines[{line.index}]", 
                            "A transaction line cannot have both debit and credit amounts",
                            "BOTH_DEBIT_CREDIT");
                    }
                    else if (!hasDebit && !hasCredit)
                    {
                        result.AddError($"Lines[{line.index}]", 
                            "A transaction line must have either a debit or credit amount",
                            "NO_AMOUNT");
                    }
                }

                // Check for duplicate accounts in the same transaction
                var duplicateAccounts = lines
                    .GroupBy(l => l.AccountId)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

                if (duplicateAccounts.Any())
                {
                    result.AddWarning("Lines", 
                        "Transaction contains duplicate accounts. Consider consolidating entries.",
                        "DUPLICATE_ACCOUNTS");
                }

                return Task.FromResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating double entry");
                return Task.FromResult(ValidationResult.Failure("Error validating transaction balance"));
            }
        }

        public async Task<ValidationResult> ValidateAccountTypeRulesAsync(List<TransactionLineDto> lines)
        {
            try
            {
                var result = new ValidationResult { IsValid = true };

                foreach (var line in lines.Select((value, index) => new { value, index }))
                {
                    var accountType = line.value.AccountType;
                    var hasDebit = line.value.Debit > 0;
                    var hasCredit = line.value.Credit > 0;

                    // Validate normal balance rules
                    switch (accountType)
                    {
                        case AccountType.Asset:
                        case AccountType.Expense:
                            // Assets and Expenses normally have debit balances
                            if (hasCredit && line.value.Credit > 1000) // Only warn for significant amounts
                            {
                                result.AddWarning($"Lines[{line.index}]", 
                                    $"{accountType} accounts normally have debit balances. Large credit amount detected.",
                                    "UNUSUAL_BALANCE");
                            }
                            break;

                        case AccountType.Liability:
                        case AccountType.Equity:
                        case AccountType.Revenue:
                            // Liabilities, Equity, and Revenue normally have credit balances
                            if (hasDebit && line.value.Debit > 1000) // Only warn for significant amounts
                            {
                                result.AddWarning($"Lines[{line.index}]", 
                                    $"{accountType} accounts normally have credit balances. Large debit amount detected.",
                                    "UNUSUAL_BALANCE");
                            }
                            break;
                    }

                    // Validate account exists and is active
                    var account = await _context.ChartOfAccounts
                        .FirstOrDefaultAsync(a => a.Id == line.value.AccountId);

                    if (account == null)
                    {
                        result.AddError($"Lines[{line.index}]", 
                            "Account does not exist",
                            "ACCOUNT_NOT_FOUND");
                    }
                    else if (!account.IsActive)
                    {
                        result.AddError($"Lines[{line.index}]", 
                            "Cannot use inactive account in transactions",
                            "INACTIVE_ACCOUNT");
                    }
                    else if (!account.AllowTransactions)
                    {
                        result.AddError($"Lines[{line.index}]", 
                            "This account does not allow direct transactions",
                            "TRANSACTIONS_NOT_ALLOWED");
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating account type rules");
                return ValidationResult.Failure("Error validating account rules");
            }
        }

        public Task<ValidationResult> ValidateTransactionDateAsync(DateTime transactionDate)
        {
            try
            {
                var result = new ValidationResult { IsValid = true };

                // Check if date is not in the future
                if (transactionDate.Date > DateTime.Today)
                {
                    result.AddError("TransactionDate", 
                        "Transaction date cannot be in the future",
                        "FUTURE_DATE");
                }

                // Check if date is not too far in the past (configurable business rule)
                var maxPastDays = 365; // Allow up to 1 year in the past
                if (transactionDate.Date < DateTime.Today.AddDays(-maxPastDays))
                {
                    result.AddWarning("TransactionDate", 
                        $"Transaction date is more than {maxPastDays} days in the past",
                        "OLD_DATE");
                }

                // Check if it's a weekend (business rule - might want to warn)
                if (transactionDate.DayOfWeek == DayOfWeek.Saturday || transactionDate.DayOfWeek == DayOfWeek.Sunday)
                {
                    result.AddWarning("TransactionDate", 
                        "Transaction date falls on a weekend",
                        "WEEKEND_DATE");
                }

                return Task.FromResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating transaction date");
                return Task.FromResult(ValidationResult.Failure("Error validating transaction date"));
            }
        }

        public async Task<ValidationResult> ValidateContactCategoryAssignmentAsync(Guid? contactId, Guid accountId)
        {
            try
            {
                var result = new ValidationResult { IsValid = true };

                if (!contactId.HasValue)
                {
                    return result; // No contact specified, validation passes
                }

                // Check if contact exists and is active
                var contact = await _context.Contacts
                    .FirstOrDefaultAsync(c => c.Id == contactId.Value);

                if (contact == null)
                {
                    result.AddError("ContactId", 
                        "Contact does not exist",
                        "CONTACT_NOT_FOUND");
                    return result;
                }

                if (!contact.IsActive)
                {
                    result.AddError("ContactId", 
                        "Cannot use inactive contact in transactions",
                        "INACTIVE_CONTACT");
                    return result;
                }

                // Check if contact is assigned to this category
                var categoryAssignment = await _context.CategoryContacts
                    .FirstOrDefaultAsync(cc => cc.ContactId == contactId.Value && 
                                              cc.CategoryId == accountId && 
                                              cc.IsActive);

                if (categoryAssignment == null)
                {
                    result.AddWarning("ContactId", 
                        "Contact is not assigned to this category. Consider assigning the contact to maintain data consistency.",
                        "CONTACT_NOT_ASSIGNED");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating contact-category assignment");
                return ValidationResult.Failure("Error validating contact assignment");
            }
        }

        public async Task<ValidationResult> ValidateImmutabilityAsync(Guid journalEntryId)
        {
            try
            {
                var journalEntry = await _context.JournalEntries
                    .FirstOrDefaultAsync(j => j.Id == journalEntryId);

                if (journalEntry == null)
                {
                    return ValidationResult.Failure("Journal entry not found", 
                        new List<ValidationError> 
                        { 
                            new ValidationError { Field = "JournalEntryId", Message = "Journal entry does not exist", Code = "NOT_FOUND" } 
                        });
                }

                var result = new ValidationResult { IsValid = true };

                // Check if transaction is in a state that allows modification
                switch (journalEntry.TransactionStatus)
                {
                    case TransactionStatus.Completed:
                        result.AddError("TransactionStatus", 
                            "Cannot modify completed transactions. Use reversal instead.",
                            "TRANSACTION_COMPLETED");
                        break;

                    case TransactionStatus.Locked:
                        result.AddError("TransactionStatus", 
                            "Cannot modify locked transactions",
                            "TRANSACTION_LOCKED");
                        break;

                    case TransactionStatus.Reversed:
                        result.AddError("TransactionStatus", 
                            "Cannot modify reversed transactions",
                            "TRANSACTION_REVERSED");
                        break;

                    case TransactionStatus.Draft:
                    case TransactionStatus.Pending:
                        // These states allow modification
                        break;
                }

                // Check if journal is approved
                if (journalEntry.Status == JournalStatus.Approved)
                {
                    result.AddError("Status", 
                        "Cannot modify approved journal entries",
                        "JOURNAL_APPROVED");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating immutability for journal entry: {JournalEntryId}", journalEntryId);
                return ValidationResult.Failure("Error validating transaction immutability");
            }
        }

        public async Task<ValidationResult> ValidateCompleteTransactionAsync(JournalEntry journalEntry, List<JournalEntryLine> lines)
        {
            try
            {
                var result = new ValidationResult { IsValid = true };

                // Convert to TransactionLineDto for validation
                var transactionLines = new List<TransactionLineDto>();
                
                foreach (var line in lines)
                {
                    var account = await _context.ChartOfAccounts
                        .FirstOrDefaultAsync(a => a.Id == line.AccountId);

                    if (account != null)
                    {
                        transactionLines.Add(new TransactionLineDto
                        {
                            AccountId = line.AccountId,
                            AccountCode = account.AccountCode,
                            AccountName = account.AccountName,
                            AccountType = account.AccountType,
                            Debit = line.Debit,
                            Credit = line.Credit,
                            Description = line.Description,
                            Reference = line.Reference
                        });
                    }
                }

                // Validate double entry
                var doubleEntryResult = await ValidateDoubleEntryAsync(transactionLines);
                if (!doubleEntryResult.IsValid)
                {
                    result.Errors.AddRange(doubleEntryResult.Errors);
                    result.IsValid = false;
                }

                // Validate account type rules
                var accountRulesResult = await ValidateAccountTypeRulesAsync(transactionLines);
                if (!accountRulesResult.IsValid)
                {
                    result.Errors.AddRange(accountRulesResult.Errors);
                    result.IsValid = false;
                }
                result.Warnings.AddRange(accountRulesResult.Warnings);

                // Validate transaction date
                var dateResult = await ValidateTransactionDateAsync(journalEntry.TransactionDate);
                if (!dateResult.IsValid)
                {
                    result.Errors.AddRange(dateResult.Errors);
                    result.IsValid = false;
                }
                result.Warnings.AddRange(dateResult.Warnings);

                // Check required fields
                if (string.IsNullOrWhiteSpace(journalEntry.ReferenceNumber))
                {
                    result.AddError("ReferenceNumber", 
                        "Reference number is required for completed transactions",
                        "MISSING_REFERENCE");
                }

                if (string.IsNullOrWhiteSpace(journalEntry.Description))
                {
                    result.AddWarning("Description", 
                        "Description is recommended for better transaction tracking",
                        "MISSING_DESCRIPTION");
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating complete transaction");
                return ValidationResult.Failure("Error validating transaction for completion");
            }
        }

        public async Task<ValidationResult> ValidateBusinessRulesAsync(CreateTransactionRequest request)
        {
            try
            {
                var result = new ValidationResult { IsValid = true };

                // Validate basic requirements
                if (request.Lines == null || !request.Lines.Any())
                {
                    result.AddError("Lines", "Transaction must have at least one line", "NO_LINES");
                    return result;
                }

                if (request.Lines.Count < 2)
                {
                    result.AddError("Lines", "Double-entry transactions must have at least two lines", "INSUFFICIENT_LINES");
                }

                // Validate all individual components
                var doubleEntryResult = await ValidateDoubleEntryAsync(request.Lines);
                var accountRulesResult = await ValidateAccountTypeRulesAsync(request.Lines);
                var dateResult = await ValidateTransactionDateAsync(request.TransactionDate);

                // Combine results
                if (!doubleEntryResult.IsValid)
                {
                    result.Errors.AddRange(doubleEntryResult.Errors);
                    result.IsValid = false;
                }

                if (!accountRulesResult.IsValid)
                {
                    result.Errors.AddRange(accountRulesResult.Errors);
                    result.IsValid = false;
                }

                if (!dateResult.IsValid)
                {
                    result.Errors.AddRange(dateResult.Errors);
                    result.IsValid = false;
                }

                // Combine warnings
                result.Warnings.AddRange(doubleEntryResult.Warnings);
                result.Warnings.AddRange(accountRulesResult.Warnings);
                result.Warnings.AddRange(dateResult.Warnings);

                // Business-specific validations
                if (string.IsNullOrWhiteSpace(request.ReferenceNumber))
                {
                    result.AddError("ReferenceNumber", "Reference number is required", "MISSING_REFERENCE");
                }

                // Check for reasonable amounts (business rule)
                var maxAmount = 1000000m; // 1 million limit
                foreach (var line in request.Lines.Select((value, index) => new { value, index }))
                {
                    var amount = Math.Max(line.value.Debit, line.value.Credit);
                    if (amount > maxAmount)
                    {
                        result.AddWarning($"Lines[{line.index}]", 
                            $"Large transaction amount detected: {amount:C}. Please verify.",
                            "LARGE_AMOUNT");
                    }
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating business rules");
                return ValidationResult.Failure("Error validating business rules");
            }
        }
    }
}