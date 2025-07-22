using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Models.Accounting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ContactController : ControllerBase
    {
        private readonly IContactService _contactService;
        private readonly ILogger<ContactController> _logger;

        public ContactController(IContactService contactService, ILogger<ContactController> logger)
        {
            _contactService = contactService;
            _logger = logger;
        }

        // ========== CREATE OPERATIONS ==========

        /// <summary>
        /// Create new contact
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EnhancedContactDto>> CreateContact([FromBody] CreateContactRequest request)
        {
            try
            {
                var contact = await _contactService.CreateContactAsync(request);
                
                var result = new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = await _contactService.GetContactBalanceAsync(contact.Id),
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt
                };

                return CreatedAtAction(nameof(GetContactById), new { id = contact.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating contact");
                return StatusCode(500, new { message = "Error creating contact" });
            }
        }

        /// <summary>
        /// Assign contact to category
        /// </summary>
        [HttpPost("{id}/assign-category")]
        public async Task<ActionResult<ContactCategoryAssignmentDto>> AssignContactToCategory(Guid id, [FromBody] AssignCategoryRequest request)
        {
            try
            {
                var categoryContact = await _contactService.AssignContactToCategoryAsync(id, request.CategoryId, request.Role);
                
                var result = new ContactCategoryAssignmentDto
                {
                    Id = categoryContact.Id,
                    ContactId = categoryContact.ContactId,
                    CategoryId = categoryContact.CategoryId,
                    Role = categoryContact.Role,
                    IsActive = categoryContact.IsActive,
                    CreatedAt = categoryContact.CreatedAt,
                    UpdatedAt = categoryContact.UpdatedAt
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
                _logger.LogError(ex, "Error assigning contact to category");
                return StatusCode(500, new { message = "Error assigning contact to category" });
            }
        }

        // ========== READ OPERATIONS ==========

        /// <summary>
        /// Get all contacts
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<EnhancedContactDto>>> GetAllContacts()
        {
            try
            {
                var contacts = await _contactService.GetContactsAsync();
                
                var result = new List<EnhancedContactDto>();
                foreach (var contact in contacts)
                {
                    result.Add(new EnhancedContactDto
                    {
                        Id = contact.Id,
                        Name = contact.Name,
                        CompanyName = contact.CompanyName,
                        ContactType = contact.ContactType,
                        Email = contact.Email,
                        Phone = contact.Phone,
                        Mobile = contact.Mobile,
                        Fax = contact.Fax,
                        Website = contact.Website,
                        TaxNumber = contact.TaxNumber,
                        CreditLimit = contact.CreditLimit,
                        PaymentTerms = contact.PaymentTerms,
                        IsActive = contact.IsActive,
                        OutstandingBalance = 0, // Skip balance calculation for list for performance
                        CreatedAt = contact.CreatedAt,
                        UpdatedAt = contact.UpdatedAt
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contacts");
                return StatusCode(500, new { message = "Error retrieving contacts" });
            }
        }

        /// <summary>
        /// Get contact by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EnhancedContactDto>> GetContactById(Guid id)
        {
            try
            {
                var contact = await _contactService.GetContactByIdAsync(id);
                
                if (contact == null)
                {
                    return NotFound(new { message = "Contact not found" });
                }

                var categoryAssignments = await _contactService.GetContactCategoriesAsync(id);

                var result = new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = await _contactService.GetContactBalanceAsync(contact.Id),
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt,
                    AssignedCategories = categoryAssignments.Select(ca => new ContactCategoryAssignmentDto
                    {
                        Id = ca.Id,
                        ContactId = ca.ContactId,
                        CategoryId = ca.CategoryId,
                        Role = ca.Role,
                        IsActive = ca.IsActive,
                        CreatedAt = ca.CreatedAt,
                        UpdatedAt = ca.UpdatedAt
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact");
                return StatusCode(500, new { message = "Error retrieving contact" });
            }
        }

        /// <summary>
        /// Get all suppliers
        /// </summary>
        [HttpGet("suppliers")]
        public async Task<ActionResult<List<EnhancedContactDto>>> GetAllSuppliers()
        {
            try
            {
                var suppliers = await _contactService.GetSuppliersAsync();
                
                var result = suppliers.Select(contact => new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = 0, // Skip balance calculation for list for performance
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving suppliers");
                return StatusCode(500, new { message = "Error retrieving suppliers" });
            }
        }

        /// <summary>
        /// Get all buyers/customers
        /// </summary>
        [HttpGet("buyers")]
        public async Task<ActionResult<List<EnhancedContactDto>>> GetAllBuyers()
        {
            try
            {
                var buyers = await _contactService.GetBuyersAsync();
                
                var result = buyers.Select(contact => new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = 0, // Skip balance calculation for list for performance
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving buyers");
                return StatusCode(500, new { message = "Error retrieving buyers" });
            }
        }

        /// <summary>
        /// Get contact categories/assignments
        /// </summary>
        [HttpGet("{id}/categories")]
        public async Task<ActionResult<List<ContactCategoryAssignmentDto>>> GetContactCategories(Guid id)
        {
            try
            {
                var categoryAssignments = await _contactService.GetContactCategoriesAsync(id);
                
                var result = categoryAssignments.Select(ca => new ContactCategoryAssignmentDto
                {
                    Id = ca.Id,
                    ContactId = ca.ContactId,
                    CategoryId = ca.CategoryId,
                    Role = ca.Role,
                    IsActive = ca.IsActive,
                    CreatedAt = ca.CreatedAt,
                    UpdatedAt = ca.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact categories");
                return StatusCode(500, new { message = "Error retrieving contact categories" });
            }
        }

        /// <summary>
        /// Search contacts
        /// </summary>
        [HttpGet("search")]
        public async Task<ActionResult<List<EnhancedContactDto>>> SearchContacts([FromQuery] string searchTerm)
        {
            try
            {
                var contacts = await _contactService.SearchContactsAsync(searchTerm);
                
                var result = contacts.Select(contact => new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = 0, // Skip balance calculation for search for performance
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching contacts");
                return StatusCode(500, new { message = "Error searching contacts" });
            }
        }

        /// <summary>
        /// Get contacts by category
        /// </summary>
        [HttpGet("by-category/{categoryId}")]
        public async Task<ActionResult<List<EnhancedContactDto>>> GetContactsByCategory(Guid categoryId)
        {
            try
            {
                var contacts = await _contactService.GetContactsByCategoryAsync(categoryId);
                
                var result = contacts.Select(contact => new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = 0, // Skip balance calculation for category filtering for performance
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contacts by category");
                return StatusCode(500, new { message = "Error retrieving contacts by category" });
            }
        }

        /// <summary>
        /// Get contact autocomplete suggestions
        /// </summary>
        [HttpGet("autocomplete")]
        public async Task<ActionResult<List<ContactAutoCompleteDto>>> GetContactAutoComplete(
            [FromQuery] string term, 
            [FromQuery] ContactType? contactType = null)
        {
            try
            {
                var contacts = await _contactService.GetContactAutoCompleteAsync(term, contactType);
                
                var result = contacts.Select(contact => new ContactAutoCompleteDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact autocomplete");
                return StatusCode(500, new { message = "Error retrieving contact autocomplete" });
            }
        }

        /// <summary>
        /// Get contact transactions
        /// </summary>
        [HttpGet("{id}/transactions")]
        public async Task<ActionResult<object>> GetContactTransactions(
            Guid id, 
            [FromQuery] DateTime? startDate = null, 
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var transactions = await _contactService.GetContactTransactionsAsync(id, startDate, endDate);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving contact transactions");
                return StatusCode(500, new { message = "Error retrieving contact transactions" });
            }
        }

        // ========== UPDATE OPERATIONS ==========

        /// <summary>
        /// Update contact
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<EnhancedContactDto>> UpdateContact(Guid id, [FromBody] UpdateContactRequest request)
        {
            try
            {
                var contact = await _contactService.UpdateContactAsync(id, request);
                
                var result = new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = await _contactService.GetContactBalanceAsync(contact.Id),
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt
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
                _logger.LogError(ex, "Error updating contact");
                return StatusCode(500, new { message = "Error updating contact" });
            }
        }

        /// <summary>
        /// Activate contact
        /// </summary>
        [HttpPatch("{id}/activate")]
        public async Task<ActionResult<EnhancedContactDto>> ActivateContact(Guid id)
        {
            try
            {
                var contact = await _contactService.ActivateContactAsync(id);
                
                var result = new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = await _contactService.GetContactBalanceAsync(contact.Id),
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt
                };

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating contact");
                return StatusCode(500, new { message = "Error activating contact" });
            }
        }

        /// <summary>
        /// Deactivate contact
        /// </summary>
        [HttpPatch("{id}/deactivate")]
        public async Task<ActionResult<EnhancedContactDto>> DeactivateContact(Guid id)
        {
            try
            {
                var contact = await _contactService.DeactivateContactAsync(id);
                
                var result = new EnhancedContactDto
                {
                    Id = contact.Id,
                    Name = contact.Name,
                    CompanyName = contact.CompanyName,
                    ContactType = contact.ContactType,
                    Email = contact.Email,
                    Phone = contact.Phone,
                    Mobile = contact.Mobile,
                    Fax = contact.Fax,
                    Website = contact.Website,
                    TaxNumber = contact.TaxNumber,
                    CreditLimit = contact.CreditLimit,
                    PaymentTerms = contact.PaymentTerms,
                    IsActive = contact.IsActive,
                    OutstandingBalance = await _contactService.GetContactBalanceAsync(contact.Id),
                    CreatedAt = contact.CreatedAt,
                    UpdatedAt = contact.UpdatedAt
                };

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating contact");
                return StatusCode(500, new { message = "Error deactivating contact" });
            }
        }

        // ========== DELETE OPERATIONS ==========

        /// <summary>
        /// Delete contact (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteContact(Guid id)
        {
            try
            {
                var success = await _contactService.DeleteContactAsync(id);
                
                if (!success)
                {
                    return NotFound(new { message = "Contact not found" });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting contact");
                return StatusCode(500, new { message = "Error deleting contact" });
            }
        }

        /// <summary>
        /// Remove contact from category
        /// </summary>
        [HttpDelete("{id}/category/{categoryId}")]
        public async Task<ActionResult> RemoveContactFromCategory(Guid id, Guid categoryId)
        {
            try
            {
                var success = await _contactService.RemoveContactFromCategoryAsync(id, categoryId);
                
                if (!success)
                {
                    return NotFound(new { message = "Contact-category assignment not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing contact from category");
                return StatusCode(500, new { message = "Error removing contact from category" });
            }
        }
    }

    // ========== DTOs ==========

    public class EnhancedContactDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public ContactType ContactType { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Mobile { get; set; }
        public string? Fax { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public decimal CreditLimit { get; set; }
        public int PaymentTerms { get; set; }
        public bool IsActive { get; set; }
        public decimal OutstandingBalance { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ContactCategoryAssignmentDto> AssignedCategories { get; set; } = new();
    }

    public class ContactAutoCompleteDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public ContactType ContactType { get; set; }
        public string Email { get; set; } = string.Empty;
    }

    public class ContactCategoryAssignmentDto
    {
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
        public Guid CategoryId { get; set; }
        public ContactRole Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}