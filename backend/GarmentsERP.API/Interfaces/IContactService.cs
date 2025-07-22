using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public interface IContactService
    {
        // Create operations
        Task<Contact> CreateContactAsync(CreateContactRequest request);
        Task<CategoryContact> AssignContactToCategoryAsync(Guid contactId, Guid categoryId, ContactRole role);
        
        // Read operations
        Task<IEnumerable<Contact>> GetContactsAsync();
        Task<IEnumerable<Contact>> GetSuppliersAsync();
        Task<IEnumerable<Contact>> GetBuyersAsync();
        Task<Contact?> GetContactByIdAsync(Guid id);
        Task<IEnumerable<Contact>> SearchContactsAsync(string searchTerm);
        Task<IEnumerable<CategoryContact>> GetContactCategoriesAsync(Guid contactId);
        Task<IEnumerable<Contact>> GetContactsByCategoryAsync(Guid categoryId);
        
        // Update operations
        Task<Contact> UpdateContactAsync(Guid id, UpdateContactRequest request);
        Task<Contact> ActivateContactAsync(Guid id);
        Task<Contact> DeactivateContactAsync(Guid id);
        
        // Delete operations
        Task<bool> DeleteContactAsync(Guid id);
        Task<bool> RemoveContactFromCategoryAsync(Guid contactId, Guid categoryId);
        
        // Business logic operations
        Task<bool> IsEmailUniqueAsync(string email, Guid? excludeId = null);
        Task<decimal> GetContactBalanceAsync(Guid contactId);
        Task<IEnumerable<object>> GetContactTransactionsAsync(Guid contactId, DateTime? startDate = null, DateTime? endDate = null);
        Task<bool> ValidateContactCategoryAssignmentAsync(Guid contactId, Guid categoryId, ContactRole role);
        
        // Autocomplete operations
        Task<IEnumerable<Contact>> GetContactAutoCompleteAsync(string term, ContactType? contactType = null);
    }

    // Request DTOs
    public class CreateContactRequest
    {
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public ContactType ContactType { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Mobile { get; set; }
        public string? Fax { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CreditLimit { get; set; } = 0;
        public int PaymentTerms { get; set; } = 30;
        public List<CategoryAssignmentRequest> CategoryAssignments { get; set; } = new();
    }

    public class UpdateContactRequest
    {
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public ContactType ContactType { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Mobile { get; set; }
        public string? Fax { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CreditLimit { get; set; } = 0;
        public int PaymentTerms { get; set; } = 30;
    }

    public class CategoryAssignmentRequest
    {
        public Guid CategoryId { get; set; }
        public ContactRole Role { get; set; }
    }

    public class AssignCategoryRequest
    {
        public Guid CategoryId { get; set; }
        public ContactRole Role { get; set; }
    }
}