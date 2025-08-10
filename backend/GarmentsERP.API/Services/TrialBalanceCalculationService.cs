using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service responsible for mathematical calculations and balance computations for trial balance reports.
    /// Handles the core calculation logic where debits are represented as negative values and credits as positive values.
    /// </summary>
    public class TrialBalanceCalculationService : ITrialBalanceCalculationService
    {
        private readonly ILogger<TrialBalanceCalculationService> _logger;

        public TrialBalanceCalculationService(ILogger<TrialBalanceCalculationService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Calculates the trial balance from a list of transactions.
        /// Debits are treated as negative values, credits as positive values.
        /// </summary>
        /// <param name="transactions">List of transaction data with debit and credit amounts</param>
        /// <returns>TrialBalanceCalculation object containing the final balance and calculation expression</returns>
        public TrialBalanceCalculation CalculateTrialBalance(List<TransactionData> transactions)
        {
            try
            {
                _logger.LogDebug("Calculating trial balance for {TransactionCount} transactions", transactions.Count);

                if (!transactions.Any())
                {
                    return new TrialBalanceCalculation
                    {
                        FinalBalance = 0,
                        Expression = "0 = 0",
                        TransactionCount = 0,
                        TotalDebits = 0,
                        TotalCredits = 0
                    };
                }

                var calculationValues = new List<decimal>();
                decimal totalDebits = 0;
                decimal totalCredits = 0;

                foreach (var transaction in transactions)
                {
                    // Debits as negative values
                    if (transaction.DebitAmount > 0)
                    {
                        var debitValue = -Math.Abs(transaction.DebitAmount);
                        calculationValues.Add(debitValue);
                        totalDebits += Math.Abs(transaction.DebitAmount);
                    }

                    // Credits as positive values
                    if (transaction.CreditAmount > 0)
                    {
                        var creditValue = Math.Abs(transaction.CreditAmount);
                        calculationValues.Add(creditValue);
                        totalCredits += Math.Abs(transaction.CreditAmount);
                    }
                }

                var finalBalance = ComputeFinalBalance(calculationValues);
                var expression = GenerateCalculationExpression(calculationValues, finalBalance);

                var result = new TrialBalanceCalculation
                {
                    FinalBalance = finalBalance,
                    Expression = expression,
                    TransactionCount = calculationValues.Count,
                    TotalDebits = totalDebits,
                    TotalCredits = totalCredits
                };

                _logger.LogDebug("Trial balance calculated: Final Balance = {FinalBalance}, Expression = {Expression}", 
                    finalBalance, expression);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating trial balance");
                throw;
            }
        }

        /// <summary>
        /// Generates a mathematical expression showing the calculation process.
        /// Format: "1000 - 1100 + 11000 - 1000 = 9900"
        /// </summary>
        /// <param name="values">List of calculation values (debits as negative, credits as positive)</param>
        /// <param name="finalBalance">The computed final balance</param>
        /// <returns>String representation of the mathematical expression</returns>
        public string GenerateCalculationExpression(List<decimal> values, decimal finalBalance)
        {
            try
            {
                if (!values.Any())
                    return "0 = 0";

                // Limit display to first 10 values for readability
                var displayValues = values.Take(10).ToList();
                var hasMore = values.Count > 10;

                var expressionParts = new List<string>();

                for (int i = 0; i < displayValues.Count; i++)
                {
                    var value = displayValues[i];
                    var absoluteValue = Math.Abs(value);

                    if (i == 0)
                    {
                        // First value doesn't need a sign prefix
                        expressionParts.Add(value.ToString("0"));
                    }
                    else
                    {
                        // Subsequent values show the sign explicitly
                        var sign = value >= 0 ? " + " : " - ";
                        expressionParts.Add($"{sign}{absoluteValue:0}");
                    }
                }

                var expression = string.Join("", expressionParts);

                if (hasMore)
                {
                    var remainingCount = values.Count - 10;
                    expression += $" + ... ({remainingCount} more)";
                }

                expression += $" = {finalBalance:0}";

                return expression;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating calculation expression");
                return $"Calculation Error = {finalBalance:0}";
            }
        }

        /// <summary>
        /// Computes the final trial balance sum from a list of values.
        /// </summary>
        /// <param name="values">List of values where debits are negative and credits are positive</param>
        /// <returns>The sum of all values</returns>
        public decimal ComputeFinalBalance(List<decimal> values)
        {
            try
            {
                return values.Sum();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error computing final balance");
                throw;
            }
        }

        /// <summary>
        /// Validates that debits are represented as negative values and credits as positive values.
        /// </summary>
        /// <param name="transactions">List of transactions to validate</param>
        /// <returns>True if all transactions follow the correct sign convention</returns>
        public bool ValidateTransactionSigns(List<TransactionData> transactions)
        {
            try
            {
                foreach (var transaction in transactions)
                {
                    // Debit amounts should be positive in the input (we make them negative in calculation)
                    if (transaction.DebitAmount < 0)
                    {
                        _logger.LogWarning("Invalid debit amount: {DebitAmount}. Debit amounts should be positive.", 
                            transaction.DebitAmount);
                        return false;
                    }

                    // Credit amounts should be positive
                    if (transaction.CreditAmount < 0)
                    {
                        _logger.LogWarning("Invalid credit amount: {CreditAmount}. Credit amounts should be positive.", 
                            transaction.CreditAmount);
                        return false;
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating transaction signs");
                return false;
            }
        }

        /// <summary>
        /// Creates a detailed breakdown of the calculation for audit purposes.
        /// </summary>
        /// <param name="transactions">List of transaction data</param>
        /// <returns>Detailed calculation breakdown</returns>
        public CalculationBreakdown CreateCalculationBreakdown(List<TransactionData> transactions)
        {
            try
            {
                var breakdown = new CalculationBreakdown
                {
                    Transactions = new List<CalculationStep>(),
                    Summary = new CalculationSummary()
                };

                decimal runningTotal = 0;
                decimal totalDebits = 0;
                decimal totalCredits = 0;

                foreach (var transaction in transactions)
                {
                    if (transaction.DebitAmount > 0)
                    {
                        var debitValue = -Math.Abs(transaction.DebitAmount);
                        runningTotal += debitValue;
                        totalDebits += Math.Abs(transaction.DebitAmount);

                        breakdown.Transactions.Add(new CalculationStep
                        {
                            TransactionId = transaction.TransactionId,
                            Description = $"Debit: {transaction.Description}",
                            Amount = debitValue,
                            RunningTotal = runningTotal,
                            Type = "Debit"
                        });
                    }

                    if (transaction.CreditAmount > 0)
                    {
                        var creditValue = Math.Abs(transaction.CreditAmount);
                        runningTotal += creditValue;
                        totalCredits += Math.Abs(transaction.CreditAmount);

                        breakdown.Transactions.Add(new CalculationStep
                        {
                            TransactionId = transaction.TransactionId,
                            Description = $"Credit: {transaction.Description}",
                            Amount = creditValue,
                            RunningTotal = runningTotal,
                            Type = "Credit"
                        });
                    }
                }

                breakdown.Summary = new CalculationSummary
                {
                    TotalDebits = totalDebits,
                    TotalCredits = totalCredits,
                    FinalBalance = runningTotal,
                    TransactionCount = breakdown.Transactions.Count
                };

                return breakdown;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating calculation breakdown");
                throw;
            }
        }
    }

    /// <summary>
    /// Represents transaction data for trial balance calculations.
    /// </summary>
    public class TransactionData
    {
        public Guid TransactionId { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string AccountName { get; set; } = string.Empty;
    }

    /// <summary>
    /// Represents the result of a trial balance calculation.
    /// </summary>
    public class TrialBalanceCalculation
    {
        public decimal FinalBalance { get; set; }
        public string Expression { get; set; } = string.Empty;
        public int TransactionCount { get; set; }
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
    }

    /// <summary>
    /// Detailed breakdown of the calculation process.
    /// </summary>
    public class CalculationBreakdown
    {
        public List<CalculationStep> Transactions { get; set; } = new();
        public CalculationSummary Summary { get; set; } = new();
    }

    /// <summary>
    /// Individual step in the calculation process.
    /// </summary>
    public class CalculationStep
    {
        public Guid TransactionId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal RunningTotal { get; set; }
        public string Type { get; set; } = string.Empty; // "Debit" or "Credit"
    }

    /// <summary>
    /// Summary of the calculation results.
    /// </summary>
    public class CalculationSummary
    {
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal FinalBalance { get; set; }
        public int TransactionCount { get; set; }
    }
}