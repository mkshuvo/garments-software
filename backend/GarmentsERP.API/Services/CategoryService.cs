using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Accounting;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CategoryService> _logger;

        public CategoryService(ApplicationDbContext context, ILogger<CategoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<ChartOfAccount> CreateCategoryAsync(CreateCategoryRequest request)
        {
            try
            {
                // Generate unique account code
                var accountCode = await GenerateAccountCodeAsync(request.AccountType);

                // Validate account code uniqueness
                if (!await IsAccountCodeUniqueAsync(accountCode))
                {
                    throw new InvalidOperationException($"Account code {accountCode} already exists");
                }

                // Validate parent account if specified
                if (request.ParentAccountId.HasValue)
                {
                    var parentAccount = await _context.ChartOfAccounts
                        .FirstOrDefaultAsync(x => x.Id == request.ParentAccountId.Value);
                    
                    if (parentAccount == null)
                    {
                        throw new ArgumentException("Parent account not found");
                    }

                    // Validate parent account type compatibility
                    if (parentAccount.AccountType != request.AccountType)
                    {
                        throw new ArgumentException("Parent account type must match child account type");
                    }
                }

                var category = new ChartOfAccount
                {
                    AccountCode = accountCode,
                    AccountName = request.AccountName,
                    AccountType = request.AccountType,
                    ParentAccountId = request.ParentAccountId,
                    Description = request.Description,
                    CategoryGroup = request.CategoryGroup,
                    SortOrder = request.SortOrder,
                    AllowTransactions = request.AllowTransactions,
                    IsDynamic = true,
                    IsActive = true,
                    OpeningBalance = 0,
                    CurrentBalance = 0,
                    CreatedAt = DateTime.UtcNow
                };

                _context.ChartOfAccounts.Add(category);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created new category: {AccountCode} - {AccountName}", 
                    category.AccountCode, category.AccountName);

                return category;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category: {AccountName}", request.AccountName);
                throw;
            }
        }

        public async Task<IEnumerable<ChartOfAccount>> GetCategoriesAsync()
        {
            return await _context.ChartOfAccounts
                .Where(x => x.IsActive)
                .OrderBy(x => x.AccountType)
                .ThenBy(x => x.SortOrder)
                .ThenBy(x => x.AccountCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<ChartOfAccount>> GetCategoriesHierarchyAsync()
        {
            var allCategories = await _context.ChartOfAccounts
                .Where(x => x.IsActive)
                .OrderBy(x => x.AccountType)
                .ThenBy(x => x.SortOrder)
                .ThenBy(x => x.AccountCode)
                .ToListAsync();

            // Return hierarchical structure (parent accounts first, then children)
            var parentAccounts = allCategories.Where(x => x.ParentAccountId == null).ToList();
            var childAccounts = allCategories.Where(x => x.ParentAccountId != null).ToList();

            var result = new List<ChartOfAccount>();
            
            foreach (var parent in parentAccounts)
            {
                result.Add(parent);
                var children = childAccounts.Where(x => x.ParentAccountId == parent.Id)
                    .OrderBy(x => x.SortOrder)
                    .ThenBy(x => x.AccountCode);
                result.AddRange(children);
            }

            return result;
        }

        public async Task<ChartOfAccount?> GetCategoryByIdAsync(Guid id)
        {
            return await _context.ChartOfAccounts
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<ChartOfAccount>> SearchCategoriesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetCategoriesAsync();
            }

            var lowerSearchTerm = searchTerm.ToLower();

            return await _context.ChartOfAccounts
                .Where(x => x.IsActive && 
                    (x.AccountName.ToLower().Contains(lowerSearchTerm) ||
                     x.AccountCode.ToLower().Contains(lowerSearchTerm) ||
                     (x.Description != null && x.Description.ToLower().Contains(lowerSearchTerm))))
                .OrderBy(x => x.AccountType)
                .ThenBy(x => x.SortOrder)
                .ThenBy(x => x.AccountCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<ChartOfAccount>> GetCategoriesByTypeAsync(AccountType accountType)
        {
            return await _context.ChartOfAccounts
                .Where(x => x.IsActive && x.AccountType == accountType)
                .OrderBy(x => x.SortOrder)
                .ThenBy(x => x.AccountCode)
                .ToListAsync();
        }

        public async Task<ChartOfAccount> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request)
        {
            try
            {
                var category = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (category == null)
                {
                    throw new ArgumentException("Category not found");
                }

                // Check if category has transactions before allowing certain changes
                var hasTransactions = await HasTransactionsAsync(id);
                
                // Validate parent account if specified
                if (request.ParentAccountId.HasValue)
                {
                    var parentAccount = await _context.ChartOfAccounts
                        .FirstOrDefaultAsync(x => x.Id == request.ParentAccountId.Value);
                    
                    if (parentAccount == null)
                    {
                        throw new ArgumentException("Parent account not found");
                    }

                    // Validate parent account type compatibility
                    if (parentAccount.AccountType != category.AccountType)
                    {
                        throw new ArgumentException("Parent account type must match child account type");
                    }

                    // Prevent circular references
                    if (parentAccount.ParentAccountId == id)
                    {
                        throw new ArgumentException("Cannot set parent account that would create circular reference");
                    }
                }

                // Update allowed fields
                category.AccountName = request.AccountName;
                category.ParentAccountId = request.ParentAccountId;
                category.Description = request.Description;
                category.CategoryGroup = request.CategoryGroup;
                category.SortOrder = request.SortOrder;
                category.AllowTransactions = request.AllowTransactions;
                category.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated category: {AccountCode} - {AccountName}", 
                    category.AccountCode, category.AccountName);

                return category;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category: {Id}", id);
                throw;
            }
        }

        public async Task<ChartOfAccount> ActivateCategoryAsync(Guid id)
        {
            var category = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(x => x.Id == id);

            if (category == null)
            {
                throw new ArgumentException("Category not found");
            }

            category.IsActive = true;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Activated category: {AccountCode} - {AccountName}", 
                category.AccountCode, category.AccountName);

            return category;
        }

        public async Task<ChartOfAccount> DeactivateCategoryAsync(Guid id)
        {
            var category = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(x => x.Id == id);

            if (category == null)
            {
                throw new ArgumentException("Category not found");
            }

            // Check if category has active child accounts
            var hasActiveChildren = await _context.ChartOfAccounts
                .AnyAsync(x => x.ParentAccountId == id && x.IsActive);

            if (hasActiveChildren)
            {
                throw new InvalidOperationException("Cannot deactivate category with active child accounts");
            }

            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deactivated category: {AccountCode} - {AccountName}", 
                category.AccountCode, category.AccountName);

            return category;
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            try
            {
                var category = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (category == null)
                {
                    return false;
                }

                // Check if category has transactions
                if (await HasTransactionsAsync(id))
                {
                    throw new InvalidOperationException("Cannot delete category with existing transactions. Use deactivate instead.");
                }

                // Check if category has child accounts
                var hasChildren = await _context.ChartOfAccounts
                    .AnyAsync(x => x.ParentAccountId == id);

                if (hasChildren)
                {
                    throw new InvalidOperationException("Cannot delete category with child accounts");
                }

                // Check if category is referenced in CategoryContacts
                var hasContactReferences = await _context.CategoryContacts
                    .AnyAsync(x => x.CategoryId == id);

                if (hasContactReferences)
                {
                    throw new InvalidOperationException("Cannot delete category with contact assignments");
                }

                // Soft delete by deactivating
                category.IsActive = false;
                category.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted category: {AccountCode} - {AccountName}", 
                    category.AccountCode, category.AccountName);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category: {Id}", id);
                throw;
            }
        }

        public async Task<bool> HardDeleteCategoryAsync(Guid id)
        {
            try
            {
                var category = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (category == null)
                {
                    return false;
                }

                // Check if category has transactions
                if (await HasTransactionsAsync(id))
                {
                    throw new InvalidOperationException("Cannot hard delete category with existing transactions");
                }

                // Check if category has child accounts
                var hasChildren = await _context.ChartOfAccounts
                    .AnyAsync(x => x.ParentAccountId == id);

                if (hasChildren)
                {
                    throw new InvalidOperationException("Cannot hard delete category with child accounts");
                }

                // Remove contact references first
                var contactReferences = await _context.CategoryContacts
                    .Where(x => x.CategoryId == id)
                    .ToListAsync();

                if (contactReferences.Any())
                {
                    _context.CategoryContacts.RemoveRange(contactReferences);
                }

                // Hard delete the category
                _context.ChartOfAccounts.Remove(category);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Hard deleted category: {AccountCode} - {AccountName}", 
                    category.AccountCode, category.AccountName);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error hard deleting category: {Id}", id);
                throw;
            }
        }

        public async Task<bool> HasTransactionsAsync(Guid categoryId)
        {
            return await _context.JournalEntryLines
                .AnyAsync(x => x.AccountId == categoryId);
        }

        public async Task<string> GenerateAccountCodeAsync(AccountType accountType)
        {
            // Account code generation based on standard accounting numbering
            var prefix = accountType switch
            {
                AccountType.Asset => "1",
                AccountType.Liability => "2",
                AccountType.Equity => "3",
                AccountType.Revenue => "4",
                AccountType.Expense => "5",
                _ => "9"
            };

            // Find the highest existing account code for this type
            var existingCodes = await _context.ChartOfAccounts
                .Where(x => x.AccountCode.StartsWith(prefix))
                .Select(x => x.AccountCode)
                .ToListAsync();

            var maxNumber = 0;
            foreach (var code in existingCodes)
            {
                if (code.Length >= 4 && int.TryParse(code.Substring(1), out var number))
                {
                    maxNumber = Math.Max(maxNumber, number);
                }
            }

            // Generate next account code
            var nextNumber = maxNumber + 1;
            return $"{prefix}{nextNumber:D3}"; // e.g., "1001", "2001", etc.
        }

        public async Task<bool> IsAccountCodeUniqueAsync(string accountCode, Guid? excludeId = null)
        {
            var query = _context.ChartOfAccounts
                .Where(x => x.AccountCode == accountCode);

            if (excludeId.HasValue)
            {
                query = query.Where(x => x.Id != excludeId.Value);
            }

            return !await query.AnyAsync();
        }

        public async Task<decimal> GetCategoryBalanceAsync(Guid categoryId)
        {
            var category = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(x => x.Id == categoryId);

            if (category == null)
            {
                return 0;
            }

            // Calculate balance from journal entry lines
            var totalDebits = await _context.JournalEntryLines
                .Where(x => x.AccountId == categoryId)
                .SumAsync(x => x.Debit);

            var totalCredits = await _context.JournalEntryLines
                .Where(x => x.AccountId == categoryId)
                .SumAsync(x => x.Credit);

            // Calculate balance based on account type
            var balance = category.AccountType switch
            {
                AccountType.Asset or AccountType.Expense => totalDebits - totalCredits,
                AccountType.Liability or AccountType.Equity or AccountType.Revenue => totalCredits - totalDebits,
                _ => 0
            };

            return balance + category.OpeningBalance;
        }

        public async Task<IEnumerable<object>> GetCategoryTransactionsAsync(Guid categoryId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = from jel in _context.JournalEntryLines
                       join je in _context.JournalEntries on jel.JournalEntryId equals je.Id
                       where jel.AccountId == categoryId
                       select new
                       {
                           TransactionDate = je.TransactionDate,
                           JournalNumber = je.JournalNumber,
                           ReferenceNumber = je.ReferenceNumber,
                           Description = jel.Description ?? je.Description,
                           Debit = jel.Debit,
                           Credit = jel.Credit,
                           Status = je.Status
                       };

            if (startDate.HasValue)
            {
                query = query.Where(x => x.TransactionDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(x => x.TransactionDate <= endDate.Value);
            }

            return await query
                .OrderByDescending(x => x.TransactionDate)
                .ThenBy(x => x.JournalNumber)
                .ToListAsync();
        }
    }
}