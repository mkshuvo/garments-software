using GarmentsERP.API.Data;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChartOfAccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ICategoryService _categoryService;
        private readonly ILogger<ChartOfAccountsController> _logger;

        public ChartOfAccountsController(
            ApplicationDbContext context, 
            ICategoryService categoryService,
            ILogger<ChartOfAccountsController> logger)
        {
            _context = context;
            _categoryService = categoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all chart of accounts with optional filtering
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ChartOfAccountsListResponse>> GetChartOfAccounts(
            [FromQuery] AccountType? accountType = null,
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var query = _context.ChartOfAccounts.AsQueryable();

                // Filter by account type
                if (accountType.HasValue)
                {
                    query = query.Where(x => x.AccountType == accountType.Value);
                }

                // Search filter
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(x => x.AccountName.Contains(search) || 
                                           x.AccountCode.Contains(search) ||
                                           (x.Description != null && x.Description.Contains(search)));
                }

                // Get total count for pagination
                var totalCount = await query.CountAsync();

                // Apply pagination
                var accounts = await query
                    .OrderBy(x => x.AccountCode)
                    .ThenBy(x => x.AccountName)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => new ChartOfAccountDto
                    {
                        Id = x.Id,
                        AccountCode = x.AccountCode,
                        AccountName = x.AccountName,
                        AccountType = x.AccountType,
                        Description = x.Description,
                        IsActive = x.IsActive,
                        CreatedAt = x.CreatedAt,
                        UpdatedAt = x.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new ChartOfAccountsListResponse
                {
                    Data = accounts,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving chart of accounts");
                return StatusCode(500, new { message = "Error retrieving chart of accounts" });
            }
        }

        /// <summary>
        /// Get chart of account by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ChartOfAccountDto>> GetChartOfAccount(Guid id)
        {
            try
            {
                var account = await _context.ChartOfAccounts
                    .Where(x => x.Id == id)
                    .Select(x => new ChartOfAccountDto
                    {
                        Id = x.Id,
                        AccountCode = x.AccountCode,
                        AccountName = x.AccountName,
                        AccountType = x.AccountType,
                        Description = x.Description,
                        IsActive = x.IsActive,
                        CreatedAt = x.CreatedAt,
                        UpdatedAt = x.UpdatedAt
                    })
                    .FirstOrDefaultAsync();

                if (account == null)
                {
                    return NotFound(new { message = "Chart of account not found" });
                }

                return Ok(account);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving chart of account with ID: {Id}", id);
                return StatusCode(500, new { message = "Error retrieving chart of account" });
            }
        }

        /// <summary>
        /// Create new chart of account
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ChartOfAccountDto>> CreateChartOfAccount([FromBody] CreateChartOfAccountRequest request)
        {
            try
            {
                // Validate account code uniqueness
                var existingAccount = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(x => x.AccountCode == request.AccountCode);

                if (existingAccount != null)
                {
                    return BadRequest(new { message = "Account code already exists" });
                }

                // Validate account name uniqueness
                var existingName = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(x => x.AccountName == request.AccountName);

                if (existingName != null)
                {
                    return BadRequest(new { message = "Account name already exists" });
                }

                var account = new ChartOfAccount
                {
                    AccountCode = request.AccountCode.Trim(),
                    AccountName = request.AccountName.Trim(),
                    AccountType = request.AccountType,
                    Description = request.Description?.Trim(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ChartOfAccounts.Add(account);
                await _context.SaveChangesAsync();

                var result = new ChartOfAccountDto
                {
                    Id = account.Id,
                    AccountCode = account.AccountCode,
                    AccountName = account.AccountName,
                    AccountType = account.AccountType,
                    Description = account.Description,
                    IsActive = account.IsActive,
                    CreatedAt = account.CreatedAt,
                    UpdatedAt = account.UpdatedAt
                };

                return CreatedAtAction(nameof(GetChartOfAccount), new { id = account.Id }, result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating chart of account");
                return StatusCode(500, new { message = "Error creating chart of account" });
            }
        }

        /// <summary>
        /// Update chart of account
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<ChartOfAccountDto>> UpdateChartOfAccount(Guid id, [FromBody] UpdateChartOfAccountRequest request)
        {
            try
            {
                var account = await _context.ChartOfAccounts.FindAsync(id);

                if (account == null)
                {
                    return NotFound(new { message = "Chart of account not found" });
                }

                // Validate account code uniqueness (excluding current account)
                var existingAccount = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(x => x.AccountCode == request.AccountCode && x.Id != id);

                if (existingAccount != null)
                {
                    return BadRequest(new { message = "Account code already exists" });
                }

                // Validate account name uniqueness (excluding current account)
                var existingName = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(x => x.AccountName == request.AccountName && x.Id != id);

                if (existingName != null)
                {
                    return BadRequest(new { message = "Account name already exists" });
                }

                // Update properties
                account.AccountCode = request.AccountCode.Trim();
                account.AccountName = request.AccountName.Trim();
                account.AccountType = request.AccountType;
                account.Description = request.Description?.Trim();
                account.IsActive = request.IsActive;
                account.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var result = new ChartOfAccountDto
                {
                    Id = account.Id,
                    AccountCode = account.AccountCode,
                    AccountName = account.AccountName,
                    AccountType = account.AccountType,
                    Description = account.Description,
                    IsActive = account.IsActive,
                    CreatedAt = account.CreatedAt,
                    UpdatedAt = account.UpdatedAt
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating chart of account with ID: {Id}", id);
                return StatusCode(500, new { message = "Error updating chart of account" });
            }
        }

        /// <summary>
        /// Delete chart of account
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteChartOfAccount(Guid id)
        {
            try
            {
                var account = await _context.ChartOfAccounts.FindAsync(id);

                if (account == null)
                {
                    return NotFound(new { message = "Chart of account not found" });
                }

                // Check if account is used in any journal entries
                var hasTransactions = await _context.JournalEntryLines
                    .AnyAsync(x => x.AccountId == id);

                if (hasTransactions)
                {
                    return BadRequest(new { message = "Cannot delete account that has transactions. Consider deactivating instead." });
                }

                _context.ChartOfAccounts.Remove(account);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting chart of account with ID: {Id}", id);
                return StatusCode(500, new { message = "Error deleting chart of account" });
            }
        }

        /// <summary>
        /// Get account types for dropdowns
        /// </summary>
        [HttpGet("account-types")]
        public ActionResult<List<AccountTypeDto>> GetAccountTypes()
        {
            var accountTypes = Enum.GetValues<AccountType>()
                .Select(x => new AccountTypeDto
                {
                    Value = x,
                    Name = x.ToString(),
                    Description = GetAccountTypeDescription(x)
                })
                .ToList();

            return Ok(accountTypes);
        }

        /// <summary>
        /// Generate next account code for a specific account type
        /// </summary>
        [HttpGet("next-account-code")]
        public async Task<ActionResult<string>> GetNextAccountCode([FromQuery] AccountType accountType)
        {
            try
            {
                var prefix = GetAccountTypePrefix(accountType);
                
                var lastAccount = await _context.ChartOfAccounts
                    .Where(x => x.AccountCode.StartsWith(prefix))
                    .OrderByDescending(x => x.AccountCode)
                    .FirstOrDefaultAsync();

                if (lastAccount == null)
                {
                    return Ok($"{prefix}01");
                }

                // Extract number and increment
                var lastNumber = lastAccount.AccountCode.Substring(prefix.Length);
                if (int.TryParse(lastNumber, out var number))
                {
                    var nextNumber = number + 1;
                    return Ok($"{prefix}{nextNumber:D2}");
                }

                return Ok($"{prefix}01");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating next account code for type: {AccountType}", accountType);
                return StatusCode(500, new { message = "Error generating account code" });
            }
        }

        private string GetAccountTypePrefix(AccountType accountType)
        {
            return accountType switch
            {
                AccountType.Asset => "10",
                AccountType.Liability => "20",
                AccountType.Equity => "30",
                AccountType.Revenue => "40",
                AccountType.Expense => "50",
                _ => "90"
            };
        }

        private string GetAccountTypeDescription(AccountType accountType)
        {
            return accountType switch
            {
                AccountType.Asset => "Resources owned by the company",
                AccountType.Liability => "Debts and obligations",
                AccountType.Equity => "Owner's equity and retained earnings",
                AccountType.Revenue => "Income from sales and services",
                AccountType.Expense => "Costs and expenses",
                _ => "Other account type"
            };
        }

        // ========== ENHANCED DYNAMIC ACCOUNTING ENDPOINTS ==========

        /// <summary>
        /// Get categories in hierarchical structure
        /// </summary>
        [HttpGet("hierarchy")]
        public async Task<ActionResult<List<EnhancedCategoryDto>>> GetCategoriesHierarchy()
        {
            try
            {
                var categories = await _categoryService.GetCategoriesHierarchyAsync();
                
                var result = new List<EnhancedCategoryDto>();
                
                foreach (var c in categories)
                {
                    result.Add(new EnhancedCategoryDto
                    {
                        Id = c.Id,
                        AccountCode = c.AccountCode,
                        AccountName = c.AccountName,
                        AccountType = c.AccountType,
                        ParentAccountId = c.ParentAccountId,
                        Description = c.Description,
                        CategoryGroup = c.CategoryGroup,
                        SortOrder = c.SortOrder,
                        AllowTransactions = c.AllowTransactions,
                        IsDynamic = c.IsDynamic,
                        IsActive = c.IsActive,
                        CurrentBalance = await _categoryService.GetCategoryBalanceAsync(c.Id),
                        HasTransactions = await _categoryService.HasTransactionsAsync(c.Id),
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories hierarchy");
                return StatusCode(500, new { message = "Error retrieving categories hierarchy" });
            }
        }

        /// <summary>
        /// Create new category using CategoryService
        /// </summary>
        [HttpPost("category")]
        public async Task<ActionResult<EnhancedCategoryDto>> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            try
            {
                var category = await _categoryService.CreateCategoryAsync(request);
                
                var result = new EnhancedCategoryDto
                {
                    Id = category.Id,
                    AccountCode = category.AccountCode,
                    AccountName = category.AccountName,
                    AccountType = category.AccountType,
                    ParentAccountId = category.ParentAccountId,
                    Description = category.Description,
                    CategoryGroup = category.CategoryGroup,
                    SortOrder = category.SortOrder,
                    AllowTransactions = category.AllowTransactions,
                    IsDynamic = category.IsDynamic,
                    IsActive = category.IsActive,
                    CurrentBalance = 0,
                    HasTransactions = false,
                    CreatedAt = category.CreatedAt,
                    UpdatedAt = category.UpdatedAt
                };

                return CreatedAtAction(nameof(GetChartOfAccount), new { id = category.Id }, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating category");
                return StatusCode(500, new { message = "Error creating category" });
            }
        }

        /// <summary>
        /// Update category using CategoryService
        /// </summary>
        [HttpPut("category/{id}")]
        public async Task<ActionResult<EnhancedCategoryDto>> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request)
        {
            try
            {
                var category = await _categoryService.UpdateCategoryAsync(id, request);
                
                var result = new EnhancedCategoryDto
                {
                    Id = category.Id,
                    AccountCode = category.AccountCode,
                    AccountName = category.AccountName,
                    AccountType = category.AccountType,
                    ParentAccountId = category.ParentAccountId,
                    Description = category.Description,
                    CategoryGroup = category.CategoryGroup,
                    SortOrder = category.SortOrder,
                    AllowTransactions = category.AllowTransactions,
                    IsDynamic = category.IsDynamic,
                    IsActive = category.IsActive,
                    CurrentBalance = await _categoryService.GetCategoryBalanceAsync(category.Id),
                    HasTransactions = await _categoryService.HasTransactionsAsync(category.Id),
                    CreatedAt = category.CreatedAt,
                    UpdatedAt = category.UpdatedAt
                };

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating category");
                return StatusCode(500, new { message = "Error updating category" });
            }
        }

        /// <summary>
        /// Delete category using CategoryService
        /// </summary>
        [HttpDelete("category/{id}")]
        public async Task<ActionResult> DeleteCategory(Guid id)
        {
            try
            {
                var success = await _categoryService.DeleteCategoryAsync(id);
                
                if (!success)
                {
                    return NotFound(new { message = "Category not found" });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting category");
                return StatusCode(500, new { message = "Error deleting category" });
            }
        }

        /// <summary>
        /// Activate category
        /// </summary>
        [HttpPatch("category/{id}/activate")]
        public async Task<ActionResult<EnhancedCategoryDto>> ActivateCategory(Guid id)
        {
            try
            {
                var category = await _categoryService.ActivateCategoryAsync(id);
                
                var result = new EnhancedCategoryDto
                {
                    Id = category.Id,
                    AccountCode = category.AccountCode,
                    AccountName = category.AccountName,
                    AccountType = category.AccountType,
                    ParentAccountId = category.ParentAccountId,
                    Description = category.Description,
                    CategoryGroup = category.CategoryGroup,
                    SortOrder = category.SortOrder,
                    AllowTransactions = category.AllowTransactions,
                    IsDynamic = category.IsDynamic,
                    IsActive = category.IsActive,
                    CurrentBalance = await _categoryService.GetCategoryBalanceAsync(category.Id),
                    HasTransactions = await _categoryService.HasTransactionsAsync(category.Id),
                    CreatedAt = category.CreatedAt,
                    UpdatedAt = category.UpdatedAt
                };

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating category");
                return StatusCode(500, new { message = "Error activating category" });
            }
        }

        /// <summary>
        /// Deactivate category
        /// </summary>
        [HttpPatch("category/{id}/deactivate")]
        public async Task<ActionResult<EnhancedCategoryDto>> DeactivateCategory(Guid id)
        {
            try
            {
                var category = await _categoryService.DeactivateCategoryAsync(id);
                
                var result = new EnhancedCategoryDto
                {
                    Id = category.Id,
                    AccountCode = category.AccountCode,
                    AccountName = category.AccountName,
                    AccountType = category.AccountType,
                    ParentAccountId = category.ParentAccountId,
                    Description = category.Description,
                    CategoryGroup = category.CategoryGroup,
                    SortOrder = category.SortOrder,
                    AllowTransactions = category.AllowTransactions,
                    IsDynamic = category.IsDynamic,
                    IsActive = category.IsActive,
                    CurrentBalance = await _categoryService.GetCategoryBalanceAsync(category.Id),
                    HasTransactions = await _categoryService.HasTransactionsAsync(category.Id),
                    CreatedAt = category.CreatedAt,
                    UpdatedAt = category.UpdatedAt
                };

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating category");
                return StatusCode(500, new { message = "Error deactivating category" });
            }
        }

        /// <summary>
        /// Search categories
        /// </summary>
        [HttpGet("search")]
        public async Task<ActionResult<List<EnhancedCategoryDto>>> SearchCategories([FromQuery] string searchTerm)
        {
            try
            {
                var categories = await _categoryService.SearchCategoriesAsync(searchTerm);
                
                var result = categories.Select(c => new EnhancedCategoryDto
                {
                    Id = c.Id,
                    AccountCode = c.AccountCode,
                    AccountName = c.AccountName,
                    AccountType = c.AccountType,
                    ParentAccountId = c.ParentAccountId,
                    Description = c.Description,
                    CategoryGroup = c.CategoryGroup,
                    SortOrder = c.SortOrder,
                    AllowTransactions = c.AllowTransactions,
                    IsDynamic = c.IsDynamic,
                    IsActive = c.IsActive,
                    CurrentBalance = 0, // Skip balance calculation for search results for performance
                    HasTransactions = false, // Skip transaction check for search results for performance
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching categories");
                return StatusCode(500, new { message = "Error searching categories" });
            }
        }

        /// <summary>
        /// Get categories by account type
        /// </summary>
        [HttpGet("by-type/{accountType}")]
        public async Task<ActionResult<List<EnhancedCategoryDto>>> GetCategoriesByType(AccountType accountType)
        {
            try
            {
                var categories = await _categoryService.GetCategoriesByTypeAsync(accountType);
                
                var result = categories.Select(c => new EnhancedCategoryDto
                {
                    Id = c.Id,
                    AccountCode = c.AccountCode,
                    AccountName = c.AccountName,
                    AccountType = c.AccountType,
                    ParentAccountId = c.ParentAccountId,
                    Description = c.Description,
                    CategoryGroup = c.CategoryGroup,
                    SortOrder = c.SortOrder,
                    AllowTransactions = c.AllowTransactions,
                    IsDynamic = c.IsDynamic,
                    IsActive = c.IsActive,
                    CurrentBalance = 0, // Skip balance calculation for type filtering for performance
                    HasTransactions = false, // Skip transaction check for type filtering for performance
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving categories by type");
                return StatusCode(500, new { message = "Error retrieving categories by type" });
            }
        }

        /// <summary>
        /// Get category transactions
        /// </summary>
        [HttpGet("category/{id}/transactions")]
        public async Task<ActionResult<object>> GetCategoryTransactions(
            Guid id, 
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var transactions = await _categoryService.GetCategoryTransactionsAsync(id, startDate, endDate);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving category transactions");
                return StatusCode(500, new { message = "Error retrieving category transactions" });
            }
        }

        /// <summary>
        /// Generate account code for account type
        /// </summary>
        [HttpGet("generate-code/{accountType}")]
        public async Task<ActionResult<string>> GenerateAccountCode(AccountType accountType)
        {
            try
            {
                var accountCode = await _categoryService.GenerateAccountCodeAsync(accountType);
                return Ok(new { accountCode });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating account code");
                return StatusCode(500, new { message = "Error generating account code" });
            }
        }
    }

    // DTOs
    public class ChartOfAccountDto
    {
        public Guid Id { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateChartOfAccountRequest
    {
        [Required]
        [StringLength(20)]
        public string AccountCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; } = string.Empty;

        [Required]
        public AccountType AccountType { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }
    }

    public class UpdateChartOfAccountRequest
    {
        [Required]
        [StringLength(20)]
        public string AccountCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; } = string.Empty;

        [Required]
        public AccountType AccountType { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class ChartOfAccountsListResponse
    {
        public List<ChartOfAccountDto> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class AccountTypeDto
    {
        public AccountType Value { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    // Enhanced Dynamic Accounting DTOs
    public class EnhancedCategoryDto
    {
        public Guid Id { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public Guid? ParentAccountId { get; set; }
        public string? ParentAccountName { get; set; }
        public string? Description { get; set; }
        public string? CategoryGroup { get; set; }
        public int SortOrder { get; set; }
        public bool AllowTransactions { get; set; }
        public bool IsDynamic { get; set; }
        public bool IsActive { get; set; }
        public decimal CurrentBalance { get; set; }
        public bool HasTransactions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ContactAssignmentDto> AssignedContacts { get; set; } = new();
    }

    public class ContactAssignmentDto
    {
        public Guid ContactId { get; set; }
        public string ContactName { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public ContactRole Role { get; set; }
        public bool IsActive { get; set; }
    }
}
