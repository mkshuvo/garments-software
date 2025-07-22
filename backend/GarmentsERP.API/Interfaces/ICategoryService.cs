using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public interface ICategoryService
    {
        // Create operations
        Task<ChartOfAccount> CreateCategoryAsync(CreateCategoryRequest request);
        
        // Read operations
        Task<IEnumerable<ChartOfAccount>> GetCategoriesAsync();
        Task<IEnumerable<ChartOfAccount>> GetCategoriesHierarchyAsync();
        Task<ChartOfAccount?> GetCategoryByIdAsync(Guid id);
        Task<IEnumerable<ChartOfAccount>> SearchCategoriesAsync(string searchTerm);
        Task<IEnumerable<ChartOfAccount>> GetCategoriesByTypeAsync(AccountType accountType);
        
        // Update operations
        Task<ChartOfAccount> UpdateCategoryAsync(Guid id, UpdateCategoryRequest request);
        Task<ChartOfAccount> ActivateCategoryAsync(Guid id);
        Task<ChartOfAccount> DeactivateCategoryAsync(Guid id);
        
        // Delete operations
        Task<bool> DeleteCategoryAsync(Guid id);
        Task<bool> HardDeleteCategoryAsync(Guid id);
        
        // Business logic operations
        Task<bool> HasTransactionsAsync(Guid categoryId);
        Task<string> GenerateAccountCodeAsync(AccountType accountType);
        Task<bool> IsAccountCodeUniqueAsync(string accountCode, Guid? excludeId = null);
        Task<decimal> GetCategoryBalanceAsync(Guid categoryId);
        Task<IEnumerable<object>> GetCategoryTransactionsAsync(Guid categoryId, DateTime? startDate = null, DateTime? endDate = null);
    }

    // Request DTOs
    public class CreateCategoryRequest
    {
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public Guid? ParentAccountId { get; set; }
        public string? Description { get; set; }
        public string? CategoryGroup { get; set; }
        public int SortOrder { get; set; } = 0;
        public bool AllowTransactions { get; set; } = true;
    }

    public class UpdateCategoryRequest
    {
        public string AccountName { get; set; } = string.Empty;
        public Guid? ParentAccountId { get; set; }
        public string? Description { get; set; }
        public string? CategoryGroup { get; set; }
        public int SortOrder { get; set; } = 0;
        public bool AllowTransactions { get; set; } = true;
        // Note: AccountType cannot be changed if transactions exist
    }
}