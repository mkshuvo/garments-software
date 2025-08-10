using GarmentsERP.API.Services;

namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Interface for trial balance calculation service that handles mathematical computations.
    /// </summary>
    public interface ITrialBalanceCalculationService
    {
        /// <summary>
        /// Calculates the trial balance from a list of transactions.
        /// Debits are treated as negative values, credits as positive values.
        /// </summary>
        /// <param name="transactions">List of transaction data with debit and credit amounts</param>
        /// <returns>TrialBalanceCalculation object containing the final balance and calculation expression</returns>
        TrialBalanceCalculation CalculateTrialBalance(List<TransactionData> transactions);

        /// <summary>
        /// Generates a mathematical expression showing the calculation process.
        /// Format: "1000 - 1100 + 11000 - 1000 = 9900"
        /// </summary>
        /// <param name="values">List of calculation values (debits as negative, credits as positive)</param>
        /// <param name="finalBalance">The computed final balance</param>
        /// <returns>String representation of the mathematical expression</returns>
        string GenerateCalculationExpression(List<decimal> values, decimal finalBalance);

        /// <summary>
        /// Computes the final trial balance sum from a list of values.
        /// </summary>
        /// <param name="values">List of values where debits are negative and credits are positive</param>
        /// <returns>The sum of all values</returns>
        decimal ComputeFinalBalance(List<decimal> values);

        /// <summary>
        /// Validates that debits are represented as negative values and credits as positive values.
        /// </summary>
        /// <param name="transactions">List of transactions to validate</param>
        /// <returns>True if all transactions follow the correct sign convention</returns>
        bool ValidateTransactionSigns(List<TransactionData> transactions);

        /// <summary>
        /// Creates a detailed breakdown of the calculation for audit purposes.
        /// </summary>
        /// <param name="transactions">List of transaction data</param>
        /// <returns>Detailed calculation breakdown</returns>
        CalculationBreakdown CreateCalculationBreakdown(List<TransactionData> transactions);
    }
}