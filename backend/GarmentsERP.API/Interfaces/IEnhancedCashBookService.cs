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
        
        // New methods for independent transactions
        Task<DTOs.SingleTransactionResult> SaveCreditTransactionAsync(DTOs.CreditTransactionDto request);
        Task<DTOs.SingleTransactionResult> SaveDebitTransactionAsync(DTOs.DebitTransactionDto request);
        Task<DTOs.RecentTransactionsResponse> GetRecentTransactionsAsync(int limit = 20);
    }
}
