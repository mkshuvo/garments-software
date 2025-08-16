using GarmentsERP.API.Services;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Interface for memoizing trial balance calculation results
    /// </summary>
    public interface ITrialBalanceCalculationMemoizationService : IDisposable
    {
        /// <summary>
        /// Calculate trial balance with memoization
        /// </summary>
        TrialBalanceCalculation CalculateTrialBalanceWithMemoization(List<TransactionData> transactions);

        /// <summary>
        /// Generate calculation expression with memoization
        /// </summary>
        string GenerateCalculationExpressionWithMemoization(List<decimal> values, decimal finalBalance);

        /// <summary>
        /// Compute final balance with memoization
        /// </summary>
        decimal ComputeFinalBalanceWithMemoization(List<decimal> values);

        /// <summary>
        /// Clear all memoized calculations
        /// </summary>
        void ClearMemoizationCache();

        /// <summary>
        /// Get memoization cache statistics
        /// </summary>
        MemoizationStatistics GetMemoizationStatistics();
    }
}