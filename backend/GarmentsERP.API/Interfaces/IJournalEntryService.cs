using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Service interface for journal entry management operations
    /// </summary>
    public interface IJournalEntryService
    {
        /// <summary>
        /// Get journal entries with advanced filtering, pagination, and optimization
        /// </summary>
        /// <param name="request">Filter and pagination parameters</param>
        /// <returns>Paginated journal entries with summary information</returns>
        Task<GetJournalEntriesResponse> GetJournalEntriesAsync(GetJournalEntriesRequest request);

        /// <summary>
        /// Get detailed journal entry by ID
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <returns>Detailed journal entry information</returns>
        Task<JournalEntryDetailDto?> GetJournalEntryByIdAsync(Guid id);

        /// <summary>
        /// Get journal entry statistics
        /// </summary>
        /// <param name="request">Statistics request parameters</param>
        /// <returns>Journal entry statistics</returns>
        Task<JournalEntryStatisticsResponse> GetStatisticsAsync(JournalEntryStatisticsRequest request);

        /// <summary>
        /// Export journal entries to various formats
        /// </summary>
        /// <param name="request">Export request parameters</param>
        /// <returns>Export response with download information</returns>
        Task<ExportJournalEntriesResponse> ExportJournalEntriesAsync(ExportJournalEntriesRequest request);

        /// <summary>
        /// Create a new journal entry
        /// </summary>
        /// <param name="request">Journal entry creation request</param>
        /// <returns>Created journal entry details</returns>
        Task<JournalEntryDetailDto> CreateJournalEntryAsync(CreateJournalEntryRequest request);

        /// <summary>
        /// Update an existing journal entry
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <param name="request">Update request</param>
        /// <returns>Updated journal entry details</returns>
        Task<JournalEntryDetailDto> UpdateJournalEntryAsync(Guid id, UpdateJournalEntryRequest request);

        /// <summary>
        /// Delete a journal entry (soft delete)
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <returns>Success status</returns>
        Task<bool> DeleteJournalEntryAsync(Guid id);

        /// <summary>
        /// Approve a journal entry
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <param name="userId">User ID of approver</param>
        /// <param name="notes">Approval notes</param>
        /// <returns>Success status</returns>
        Task<bool> ApproveJournalEntryAsync(Guid id, Guid userId, string? notes = null);

        /// <summary>
        /// Reverse a journal entry
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <param name="userId">User ID of reverser</param>
        /// <param name="reason">Reversal reason</param>
        /// <returns>Success status</returns>
        Task<bool> ReverseJournalEntryAsync(Guid id, Guid userId, string reason);

        /// <summary>
        /// Get journal entry audit trail
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <returns>Audit trail entries</returns>
        Task<List<AuditTrailEntryDto>> GetAuditTrailAsync(Guid id);

        /// <summary>
        /// Validate journal entry balance
        /// </summary>
        /// <param name="id">Journal entry ID</param>
        /// <returns>Validation result</returns>
        Task<JournalEntryValidationResult> ValidateJournalEntryAsync(Guid id);

        /// <summary>
        /// Get journal entry categories for filtering
        /// </summary>
        /// <returns>List of available categories</returns>
        Task<List<string>> GetCategoriesAsync();

        /// <summary>
        /// Get journal entry statuses for filtering
        /// </summary>
        /// <returns>List of available statuses</returns>
        Task<List<string>> GetStatusesAsync();

        /// <summary>
        /// Get journal entry types for filtering
        /// </summary>
        /// <returns>List of available types</returns>
        Task<List<string>> GetTypesAsync();
    }

    /// <summary>
    /// Journal entry creation request
    /// </summary>
    public class CreateJournalEntryRequest
    {
        public DateTime TransactionDate { get; set; }
        public string JournalType { get; set; } = "General";
        public string? ReferenceNumber { get; set; }
        public string? Description { get; set; }
        public List<JournalEntryLineRequest> Lines { get; set; } = new();
    }

    /// <summary>
    /// Journal entry update request
    /// </summary>
    public class UpdateJournalEntryRequest
    {
        public DateTime? TransactionDate { get; set; }
        public string? JournalType { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? Description { get; set; }
        public List<JournalEntryLineRequest>? Lines { get; set; }
    }

    /// <summary>
    /// Journal entry line request
    /// </summary>
    public class JournalEntryLineRequest
    {
        public Guid AccountId { get; set; }
        public decimal? Debit { get; set; }
        public decimal? Credit { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
        public int LineOrder { get; set; }
    }

    /// <summary>
    /// Journal entry validation result
    /// </summary>
    public class JournalEntryValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal Balance => TotalDebits - TotalCredits;
        public bool IsBalanced => Math.Abs(Balance) < 0.01m;
    }
}

