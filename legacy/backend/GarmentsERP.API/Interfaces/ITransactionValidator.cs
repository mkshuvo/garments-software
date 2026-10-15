using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Interfaces
{
    public interface ITransactionValidator
    {
        Task<TransactionValidationResult> ValidateDoubleEntryAsync(List<TransactionLineDto> lines);
        Task<TransactionValidationResult> ValidateAccountTypeRulesAsync(List<TransactionLineDto> lines);
        Task<TransactionValidationResult> ValidateTransactionDateAsync(DateTime transactionDate);
        Task<TransactionValidationResult> ValidateContactCategoryAssignmentAsync(Guid? contactId, Guid accountId);
        Task<TransactionValidationResult> ValidateImmutabilityAsync(Guid journalEntryId);
        Task<TransactionValidationResult> ValidateCompleteTransactionAsync(JournalEntry journalEntry, List<JournalEntryLine> lines);
        Task<TransactionValidationResult> ValidateBusinessRulesAsync(CreateTransactionRequest request);
    }
}
