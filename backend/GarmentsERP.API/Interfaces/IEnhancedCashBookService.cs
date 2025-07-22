using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public interface IEnhancedCashBookService
    {
        Task<CashBookEntryResult> CreateCashBookEntryAsync(CreateCashBookEntryRequest request);
        Task<PagedResult<CashBookEntryDto>> GetCashBookEntriesAsync(CashBookFilterRequest filter);
        Task<CashBookEntryResult> UpdateCashBookEntryAsync(Guid entryId, UpdateCashBookEntryRequest request);
        Task<CashBookEntryResult> CompleteEntryAsync(Guid entryId, Guid userId);
        Task<CashBookEntryResult> SaveDraftAsync(CreateCashBookEntryRequest request);
        Task<CashBookEntryResult> ApproveEntryAsync(Guid entryId, Guid userId, string? notes = null);
        Task<CashBookEntryResult> RejectEntryAsync(Guid entryId, Guid userId, string reason);
        Task<CashBookEntryResult> CreateReversingEntryAsync(Guid originalEntryId, Guid userId, string reason);
        Task<CashBookEntryDto?> GetCashBookEntryByIdAsync(Guid entryId);
        Task<bool> ValidateDoubleEntryAsync(List<CashBookLineDto> lines);
        Task<decimal> CalculateBalanceAsync(List<CashBookLineDto> lines);
    }

    // Request/Response DTOs
    public class CreateCashBookEntryRequest
    {
        public DateTime TransactionDate { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<CashBookLineDto> Lines { get; set; } = new();
        public bool SaveAsDraft { get; set; } = false;
    }

    public class UpdateCashBookEntryRequest
    {
        public DateTime TransactionDate { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<CashBookLineDto> Lines { get; set; } = new();
    }

    public class CashBookLineDto
    {
        public Guid? Id { get; set; }
        public Guid AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public string? Description { get; set; }
        public string? Reference { get; set; }
        public Guid? ContactId { get; set; }
        public string? ContactName { get; set; }
        public int LineOrder { get; set; }
    }

    public class CashBookEntryDto
    {
        public Guid Id { get; set; }
        public string JournalNumber { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string ReferenceNumber { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public JournalStatus Status { get; set; }
        public TransactionStatus TransactionStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedByUserId { get; set; }
        public string? CreatedByUserName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public Guid? ApprovedByUserId { get; set; }
        public string? ApprovedByUserName { get; set; }
        public List<CashBookLineDto> Lines { get; set; } = new();
        public bool IsBalanced => Math.Abs(TotalDebit - TotalCredit) < 0.01m;
        public bool CanEdit => TransactionStatus == TransactionStatus.Draft;
        public bool CanComplete => TransactionStatus == TransactionStatus.Draft && IsBalanced;
        public bool CanReverse => TransactionStatus == TransactionStatus.Completed;
    }

    public class CashBookFilterRequest
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? Description { get; set; }
        public JournalStatus? Status { get; set; }
        public TransactionStatus? TransactionStatus { get; set; }
        public Guid? AccountId { get; set; }
        public Guid? ContactId { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "TransactionDate";
        public bool SortDescending { get; set; } = true;
    }

    public class CashBookEntryResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public CashBookEntryDto? Entry { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
}