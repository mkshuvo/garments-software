using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public interface ITrialBalanceService
    {
        Task<TrialBalanceResult> GenerateTrialBalanceAsync(int year, int month, string companyName, string? companyAddress = null);
        Task<PagedResult<TrialBalanceDto>> GetTrialBalanceHistoryAsync(TrialBalanceFilterRequest filter);
        Task<TrialBalanceComparisonResult> CompareTrialBalancesAsync(Guid trialBalance1Id, Guid trialBalance2Id);
        Task<TrialBalanceDto?> GetTrialBalanceByIdAsync(Guid id);
        Task<TrialBalanceResult> ApproveTrialBalanceAsync(Guid id, Guid userId, string? notes = null);
        Task<TrialBalanceResult> UpdateNotesAsync(Guid id, string notes);
        Task<bool> DeleteTrialBalanceAsync(Guid id);
        Task<TrialBalanceValidationResult> ValidateTrialBalanceAsync(Guid id);
    }

    // DTOs and Request/Response classes
    public class TrialBalanceDto
    {
        public Guid Id { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? CompanyAddress { get; set; }
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public bool IsBalanced { get; set; }
        public TrialBalanceStatus Status { get; set; }
        public string? Notes { get; set; }
        public DateTime GeneratedDate { get; set; }
        public Guid GeneratedByUserId { get; set; }
        public string? GeneratedByUserName { get; set; }
        public Guid? ApprovedByUserId { get; set; }
        public string? ApprovedByUserName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public List<TrialBalanceEntryDto> Entries { get; set; } = new();
    }

    public class TrialBalanceEntryDto
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal DebitMovements { get; set; }
        public decimal CreditMovements { get; set; }
        public decimal ClosingBalance { get; set; }
        public int SortOrder { get; set; }
    }

    public class TrialBalanceFilterRequest
    {
        public int? Year { get; set; }
        public int? Month { get; set; }
        public TrialBalanceStatus? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SortBy { get; set; } = "GeneratedDate";
        public bool SortDescending { get; set; } = true;
    }

    public class TrialBalanceResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public TrialBalanceDto? TrialBalance { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class TrialBalanceComparisonResult
    {
        public TrialBalanceDto TrialBalance1 { get; set; } = new();
        public TrialBalanceDto TrialBalance2 { get; set; } = new();
        public List<TrialBalanceComparisonEntry> Differences { get; set; } = new();
        public decimal TotalDifference { get; set; }
    }

    public class TrialBalanceComparisonEntry
    {
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public decimal Balance1 { get; set; }
        public decimal Balance2 { get; set; }
        public decimal Difference { get; set; }
        public string ChangeType { get; set; } = string.Empty; // "New", "Removed", "Changed"
    }

    public class TrialBalanceValidationResult
    {
        public bool IsValid { get; set; }
        public bool IsBalanced { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal Variance { get; set; }
    }
}