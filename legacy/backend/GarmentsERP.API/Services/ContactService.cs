using GarmentsERP.API.Data;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;
using Microsoft.EntityFrameworkCore;

namespace GarmentsERP.API.Services
{
    public class ContactService : IContactService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ContactService> _logger;

        public ContactService(ApplicationDbContext context, ILogger<ContactService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Contact> CreateContactAsync(CreateContactRequest request)
        {
            try
            {
                // Validate email uniqueness
                if (!await IsEmailUniqueAsync(request.Email))
                {
                    throw new InvalidOperationException($"Email {request.Email} already exists");
                }

                var contact = new Contact
                {
                    Name = request.Name,
                    CompanyName = request.CompanyName,
                    ContactType = request.ContactType,
                    Email = request.Email,
                    Phone = request.Phone,
                    Mobile = request.Mobile,
                    Fax = request.Fax,
                    Website = request.Website,
                    TaxNumber = request.TaxNumber,
                    CreditLimit = request.CreditLimit,
                    PaymentTerms = request.PaymentTerms,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Contacts.Add(contact);
                await _context.SaveChangesAsync();

                // Handle category assignments
                foreach (var assignment in request.CategoryAssignments)
                {
                    await AssignContactToCategoryAsync(contact.Id, assignment.CategoryId, assignment.Role);
                }

                _logger.LogInformation("Created new contact: {CompanyName} - {Email}", 
                    contact.CompanyName, contact.Email);

                return contact;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contact: {CompanyName}", request.CompanyName);
                throw;
            }
        }

        public async Task<CategoryContact> AssignContactToCategoryAsync(Guid contactId, Guid categoryId, ContactRole role)
        {
            try
            {
                // Validate contact exists
                var contact = await _context.Contacts.FirstOrDefaultAsync(x => x.Id == contactId);
                if (contact == null)
                {
                    throw new ArgumentException("Contact not found");
                }

                // Validate category exists
                var category = await _context.ChartOfAccounts.FirstOrDefaultAsync(x => x.Id == categoryId);
                if (category == null)
                {
                    throw new ArgumentException("Category not found");
                }

                // Validate business rules for assignment
                if (!await ValidateContactCategoryAssignmentAsync(contactId, categoryId, role))
                {
                    throw new InvalidOperationException("Invalid contact-category assignment based on business rules");
                }

                // Check if assignment already exists
                var existingAssignment = await _context.CategoryContacts
                    .FirstOrDefaultAsync(x => x.ContactId == contactId && x.CategoryId == categoryId);

                if (existingAssignment != null)
                {
                    // Update existing assignment
                    existingAssignment.Role = role;
                    existingAssignment.IsActive = true;
                    existingAssignment.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return existingAssignment;
                }

                // Create new assignment
                var categoryContact = new CategoryContact
                {
                    ContactId = contactId,
                    CategoryId = categoryId,
                    Role = role,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CategoryContacts.Add(categoryContact);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Assigned contact {ContactId} to category {CategoryId} with role {Role}", 
                    contactId, categoryId, role);

                return categoryContact;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning contact to category");
                throw;
            }
        }

        public async Task<IEnumerable<Contact>> GetContactsAsync()
        {
            return await _context.Contacts
                .Where(x => x.IsActive)
                .OrderBy(x => x.CompanyName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Contact>> GetSuppliersAsync()
        {
            return await _context.Contacts
                .Where(x => x.IsActive && (x.ContactType == ContactType.Supplier || x.ContactType == ContactType.Both))
                .OrderBy(x => x.CompanyName)
                .ToListAsync();
        }

        public async Task<IEnumerable<Contact>> GetBuyersAsync()
        {
            return await _context.Contacts
                .Where(x => x.IsActive && (x.ContactType == ContactType.Customer || x.ContactType == ContactType.Both))
                .OrderBy(x => x.CompanyName)
                .ToListAsync();
        }

        public async Task<Contact?> GetContactByIdAsync(Guid id)
        {
            return await _context.Contacts
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<Contact>> SearchContactsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetContactsAsync();
            }

            var lowerSearchTerm = searchTerm.ToLower();

            return await _context.Contacts
                .Where(x => x.IsActive && 
                    (x.Name.ToLower().Contains(lowerSearchTerm) ||
                     x.CompanyName.ToLower().Contains(lowerSearchTerm) ||
                     x.Email.ToLower().Contains(lowerSearchTerm) ||
                     (x.Phone != null && x.Phone.Contains(searchTerm)) ||
                     (x.Mobile != null && x.Mobile.Contains(searchTerm))))
                .OrderBy(x => x.CompanyName)
                .ToListAsync();
        }

        public async Task<IEnumerable<CategoryContact>> GetContactCategoriesAsync(Guid contactId)
        {
            return await _context.CategoryContacts
                .Where(x => x.ContactId == contactId && x.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Contact>> GetContactsByCategoryAsync(Guid categoryId)
        {
            var contactIds = await _context.CategoryContacts
                .Where(x => x.CategoryId == categoryId && x.IsActive)
                .Select(x => x.ContactId)
                .ToListAsync();

            return await _context.Contacts
                .Where(x => contactIds.Contains(x.Id) && x.IsActive)
                .OrderBy(x => x.CompanyName)
                .ToListAsync();
        }

        public async Task<Contact> UpdateContactAsync(Guid id, UpdateContactRequest request)
        {
            try
            {
                var contact = await _context.Contacts
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (contact == null)
                {
                    throw new ArgumentException("Contact not found");
                }

                // Validate email uniqueness (excluding current contact)
                if (!await IsEmailUniqueAsync(request.Email, id))
                {
                    throw new InvalidOperationException($"Email {request.Email} already exists");
                }

                // Update contact fields
                contact.Name = request.Name;
                contact.CompanyName = request.CompanyName;
                contact.ContactType = request.ContactType;
                contact.Email = request.Email;
                contact.Phone = request.Phone;
                contact.Mobile = request.Mobile;
                contact.Fax = request.Fax;
                contact.Website = request.Website;
                contact.TaxNumber = request.TaxNumber;
                contact.CreditLimit = request.CreditLimit;
                contact.PaymentTerms = request.PaymentTerms;
                contact.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated contact: {CompanyName} - {Email}", 
                    contact.CompanyName, contact.Email);

                return contact;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating contact: {Id}", id);
                throw;
            }
        }

        public async Task<Contact> ActivateContactAsync(Guid id)
        {
            var contact = await _context.Contacts
                .FirstOrDefaultAsync(x => x.Id == id);

            if (contact == null)
            {
                throw new ArgumentException("Contact not found");
            }

            contact.IsActive = true;
            contact.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Activated contact: {CompanyName} - {Email}", 
                contact.CompanyName, contact.Email);

            return contact;
        }

        public async Task<Contact> DeactivateContactAsync(Guid id)
        {
            var contact = await _context.Contacts
                .FirstOrDefaultAsync(x => x.Id == id);

            if (contact == null)
            {
                throw new ArgumentException("Contact not found");
            }

            contact.IsActive = false;
            contact.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Deactivated contact: {CompanyName} - {Email}", 
                contact.CompanyName, contact.Email);

            return contact;
        }

        public async Task<bool> DeleteContactAsync(Guid id)
        {
            try
            {
                var contact = await _context.Contacts
                    .FirstOrDefaultAsync(x => x.Id == id);

                if (contact == null)
                {
                    return false;
                }

                // Check if contact has transactions
                var hasTransactions = await _context.JournalEntryLines
                    .AnyAsync(x => x.Reference != null && x.Reference.Contains(contact.CompanyName));

                if (hasTransactions)
                {
                    throw new InvalidOperationException("Cannot delete contact with existing transactions. Use deactivate instead.");
                }

                // Soft delete by deactivating
                contact.IsActive = false;
                contact.UpdatedAt = DateTime.UtcNow;

                // Deactivate category assignments
                var categoryAssignments = await _context.CategoryContacts
                    .Where(x => x.ContactId == id)
                    .ToListAsync();

                foreach (var assignment in categoryAssignments)
                {
                    assignment.IsActive = false;
                    assignment.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Soft deleted contact: {CompanyName} - {Email}", 
                    contact.CompanyName, contact.Email);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting contact: {Id}", id);
                throw;
            }
        }

        public async Task<bool> RemoveContactFromCategoryAsync(Guid contactId, Guid categoryId)
        {
            try
            {
                var categoryContact = await _context.CategoryContacts
                    .FirstOrDefaultAsync(x => x.ContactId == contactId && x.CategoryId == categoryId);

                if (categoryContact == null)
                {
                    return false;
                }

                categoryContact.IsActive = false;
                categoryContact.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Removed contact {ContactId} from category {CategoryId}", 
                    contactId, categoryId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing contact from category");
                throw;
            }
        }

        public async Task<bool> IsEmailUniqueAsync(string email, Guid? excludeId = null)
        {
            var query = _context.Contacts
                .Where(x => x.Email.ToLower() == email.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(x => x.Id != excludeId.Value);
            }

            return !await query.AnyAsync();
        }

        public async Task<decimal> GetContactBalanceAsync(Guid contactId)
        {
            var contact = await _context.Contacts
                .FirstOrDefaultAsync(x => x.Id == contactId);

            if (contact == null)
            {
                return 0;
            }

            // Calculate balance from journal entry lines that reference this contact
            // This is a simplified approach - in a full implementation, you'd have proper contact-transaction relationships
            var contactName = contact.CompanyName;

            var totalDebits = await _context.JournalEntryLines
                .Where(x => x.Reference != null && x.Reference.Contains(contactName))
                .SumAsync(x => x.Debit);

            var totalCredits = await _context.JournalEntryLines
                .Where(x => x.Reference != null && x.Reference.Contains(contactName))
                .SumAsync(x => x.Credit);

            // For suppliers, positive balance means we owe them (credit balance)
            // For customers, positive balance means they owe us (debit balance)
            return contact.ContactType switch
            {
                ContactType.Supplier => totalCredits - totalDebits,
                ContactType.Customer => totalDebits - totalCredits,
                ContactType.Both => totalDebits - totalCredits, // Default to customer logic
                _ => 0
            };
        }

        public async Task<IEnumerable<object>> GetContactTransactionsAsync(Guid contactId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var contact = await _context.Contacts
                .FirstOrDefaultAsync(x => x.Id == contactId);

            if (contact == null)
            {
                return new List<object>();
            }

            var contactName = contact.CompanyName;

            var query = from jel in _context.JournalEntryLines
                       join je in _context.JournalEntries on jel.JournalEntryId equals je.Id
                       where jel.Reference != null && jel.Reference.Contains(contactName)
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

        public async Task<bool> ValidateContactCategoryAssignmentAsync(Guid contactId, Guid categoryId, ContactRole role)
        {
            var contact = await _context.Contacts.FirstOrDefaultAsync(x => x.Id == contactId);
            var category = await _context.ChartOfAccounts.FirstOrDefaultAsync(x => x.Id == categoryId);

            if (contact == null || category == null)
            {
                return false;
            }

            // Business rule validation
            return role switch
            {
                ContactRole.Supplier => contact.ContactType == ContactType.Supplier || contact.ContactType == ContactType.Both,
                ContactRole.Buyer => contact.ContactType == ContactType.Customer || contact.ContactType == ContactType.Both,
                ContactRole.Both => contact.ContactType == ContactType.Both,
                _ => false
            };
        }

        public async Task<IEnumerable<Contact>> GetContactAutoCompleteAsync(string term, ContactType? contactType = null)
        {
            if (string.IsNullOrWhiteSpace(term))
            {
                return new List<Contact>();
            }

            var lowerTerm = term.ToLower();

            var query = _context.Contacts
                .Where(x => x.IsActive && 
                    (x.Name.ToLower().Contains(lowerTerm) ||
                     x.CompanyName.ToLower().Contains(lowerTerm)));

            if (contactType.HasValue)
            {
                query = query.Where(x => x.ContactType == contactType.Value || x.ContactType == ContactType.Both);
            }

            return await query
                .OrderBy(x => x.CompanyName)
                .Take(10) // Limit for autocomplete
                .ToListAsync();
        }
    }
}