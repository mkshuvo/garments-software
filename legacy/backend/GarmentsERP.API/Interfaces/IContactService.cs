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
}
