using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using GarmentsERP.API.Services;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Tests
{
    public class TrialBalanceCalculationServiceTests
    {
        private readonly ITrialBalanceCalculationService _calculationService;
        private readonly Mock<ILogger<TrialBalanceCalculationService>> _mockLogger;

        public TrialBalanceCalculationServiceTests()
        {
            _mockLogger = new Mock<ILogger<TrialBalanceCalculationService>>();
            _calculationService = new TrialBalanceCalculationService(_mockLogger.Object);
        }

        [Fact]
        public void CalculateTrialBalance_WithEmptyTransactions_ReturnsZeroBalance()
        {
            // Arrange
            var transactions = new List<TransactionData>();

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(0, result.FinalBalance);
            Assert.Equal("0 = 0", result.Expression);
            Assert.Equal(0, result.TransactionCount);
            Assert.Equal(0, result.TotalDebits);
            Assert.Equal(0, result.TotalCredits);
        }

        [Fact]
        public void CalculateTrialBalance_WithMixedTransactions_ReturnsCorrectBalance()
        {
            // Arrange - Example from requirements: "1000 - 1100 + 11000 - 1000 = 9900"
            var transactions = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 1000, DebitAmount = 0, Description = "Credit 1000" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 1100, CreditAmount = 0, Description = "Debit 1100" },
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 11000, DebitAmount = 0, Description = "Credit 11000" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 1000, CreditAmount = 0, Description = "Debit 1000" }
            };

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(9900, result.FinalBalance); // 1000 - 1100 + 11000 - 1000 = 9900
            Assert.Equal(4, result.TransactionCount);
            Assert.Equal(2100, result.TotalDebits); // 1100 + 1000
            Assert.Equal(12000, result.TotalCredits); // 1000 + 11000
            Assert.Contains("1000", result.Expression);
            Assert.Contains("- 1100", result.Expression);
            Assert.Contains("+ 11000", result.Expression);
            Assert.Contains("- 1000", result.Expression);
            Assert.Contains("= 9900", result.Expression);
        }

        [Fact]
        public void CalculateTrialBalance_WithOnlyDebits_ReturnsNegativeBalance()
        {
            // Arrange
            var transactions = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 500, CreditAmount = 0, Description = "Debit 500" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 300, CreditAmount = 0, Description = "Debit 300" }
            };

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(-800, result.FinalBalance); // -500 - 300 = -800
            Assert.Equal(800, result.TotalDebits);
            Assert.Equal(0, result.TotalCredits);
        }

        [Fact]
        public void CalculateTrialBalance_WithOnlyCredits_ReturnsPositiveBalance()
        {
            // Arrange
            var transactions = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 750, DebitAmount = 0, Description = "Credit 750" },
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 250, DebitAmount = 0, Description = "Credit 250" }
            };

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(1000, result.FinalBalance); // 750 + 250 = 1000
            Assert.Equal(0, result.TotalDebits);
            Assert.Equal(1000, result.TotalCredits);
        }

        [Fact]
        public void CalculateTrialBalance_WithLargeDataset_HandlesCorrectly()
        {
            // Arrange - Test with 1000 transactions
            var transactions = new List<TransactionData>();
            var expectedBalance = 0m;

            for (int i = 1; i <= 1000; i++)
            {
                if (i % 2 == 0) // Even numbers as credits
                {
                    transactions.Add(new TransactionData 
                    { 
                        TransactionId = Guid.NewGuid(), 
                        CreditAmount = i, 
                        DebitAmount = 0, 
                        Description = $"Credit {i}" 
                    });
                    expectedBalance += i;
                }
                else // Odd numbers as debits
                {
                    transactions.Add(new TransactionData 
                    { 
                        TransactionId = Guid.NewGuid(), 
                        DebitAmount = i, 
                        CreditAmount = 0, 
                        Description = $"Debit {i}" 
                    });
                    expectedBalance -= i;
                }
            }

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(expectedBalance, result.FinalBalance);
            Assert.Equal(1000, result.TransactionCount);
        }

        [Fact]
        public void GenerateCalculationExpression_WithSimpleValues_ReturnsCorrectExpression()
        {
            // Arrange
            var values = new List<decimal> { 1000, -1100, 11000, -1000 };
            var finalBalance = 9900m;

            // Act
            var expression = _calculationService.GenerateCalculationExpression(values, finalBalance);

            // Assert
            Assert.Equal("1000 - 1100 + 11000 - 1000 = 9900", expression);
        }

        [Fact]
        public void GenerateCalculationExpression_WithEmptyValues_ReturnsZeroExpression()
        {
            // Arrange
            var values = new List<decimal>();
            var finalBalance = 0m;

            // Act
            var expression = _calculationService.GenerateCalculationExpression(values, finalBalance);

            // Assert
            Assert.Equal("0 = 0", expression);
        }

        [Fact]
        public void GenerateCalculationExpression_WithMoreThan10Values_TruncatesCorrectly()
        {
            // Arrange
            var values = new List<decimal>();
            for (int i = 1; i <= 15; i++)
            {
                values.Add(i * 100);
            }
            var finalBalance = values.Sum();

            // Act
            var expression = _calculationService.GenerateCalculationExpression(values, finalBalance);

            // Assert
            Assert.Contains("... (5 more)", expression);
            Assert.Contains($"= {finalBalance}", expression);
        }

        [Fact]
        public void ComputeFinalBalance_WithMixedValues_ReturnsCorrectSum()
        {
            // Arrange
            var values = new List<decimal> { 1000, -500, 2000, -300, 800 };

            // Act
            var result = _calculationService.ComputeFinalBalance(values);

            // Assert
            Assert.Equal(3000, result); // 1000 - 500 + 2000 - 300 + 800 = 3000
        }

        [Fact]
        public void ComputeFinalBalance_WithEmptyList_ReturnsZero()
        {
            // Arrange
            var values = new List<decimal>();

            // Act
            var result = _calculationService.ComputeFinalBalance(values);

            // Assert
            Assert.Equal(0, result);
        }

        [Fact]
        public void ValidateTransactionSigns_WithValidTransactions_ReturnsTrue()
        {
            // Arrange
            var transactions = new List<TransactionData>
            {
                new TransactionData { DebitAmount = 100, CreditAmount = 0 },
                new TransactionData { DebitAmount = 0, CreditAmount = 200 },
                new TransactionData { DebitAmount = 50, CreditAmount = 75 }
            };

            // Act
            var result = _calculationService.ValidateTransactionSigns(transactions);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void ValidateTransactionSigns_WithNegativeDebit_ReturnsFalse()
        {
            // Arrange
            var transactions = new List<TransactionData>
            {
                new TransactionData { DebitAmount = -100, CreditAmount = 0 }, // Invalid negative debit
                new TransactionData { DebitAmount = 0, CreditAmount = 200 }
            };

            // Act
            var result = _calculationService.ValidateTransactionSigns(transactions);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void ValidateTransactionSigns_WithNegativeCredit_ReturnsFalse()
        {
            // Arrange
            var transactions = new List<TransactionData>
            {
                new TransactionData { DebitAmount = 100, CreditAmount = 0 },
                new TransactionData { DebitAmount = 0, CreditAmount = -200 } // Invalid negative credit
            };

            // Act
            var result = _calculationService.ValidateTransactionSigns(transactions);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void CreateCalculationBreakdown_WithMixedTransactions_ReturnsDetailedBreakdown()
        {
            // Arrange
            var transactions = new List<TransactionData>
            {
                new TransactionData 
                { 
                    TransactionId = Guid.NewGuid(), 
                    DebitAmount = 500, 
                    CreditAmount = 0, 
                    Description = "Office Supplies",
                    AccountName = "Expenses"
                },
                new TransactionData 
                { 
                    TransactionId = Guid.NewGuid(), 
                    DebitAmount = 0, 
                    CreditAmount = 1000, 
                    Description = "Sales Revenue",
                    AccountName = "Revenue"
                }
            };

            // Act
            var breakdown = _calculationService.CreateCalculationBreakdown(transactions);

            // Assert
            Assert.Equal(2, breakdown.Transactions.Count);
            Assert.Equal(500, breakdown.Summary.FinalBalance); // -500 + 1000 = 500
            Assert.Equal(500, breakdown.Summary.TotalDebits);
            Assert.Equal(1000, breakdown.Summary.TotalCredits);
            Assert.Equal(2, breakdown.Summary.TransactionCount);

            // Check first transaction (debit)
            var firstStep = breakdown.Transactions[0];
            Assert.Equal("Debit", firstStep.Type);
            Assert.Equal(-500, firstStep.Amount);
            Assert.Equal(-500, firstStep.RunningTotal);

            // Check second transaction (credit)
            var secondStep = breakdown.Transactions[1];
            Assert.Equal("Credit", secondStep.Type);
            Assert.Equal(1000, secondStep.Amount);
            Assert.Equal(500, secondStep.RunningTotal);
        }

        [Fact]
        public void CreateCalculationBreakdown_WithEmptyTransactions_ReturnsEmptyBreakdown()
        {
            // Arrange
            var transactions = new List<TransactionData>();

            // Act
            var breakdown = _calculationService.CreateCalculationBreakdown(transactions);

            // Assert
            Assert.Empty(breakdown.Transactions);
            Assert.Equal(0, breakdown.Summary.FinalBalance);
            Assert.Equal(0, breakdown.Summary.TotalDebits);
            Assert.Equal(0, breakdown.Summary.TotalCredits);
            Assert.Equal(0, breakdown.Summary.TransactionCount);
        }

        [Fact]
        public void CalculateTrialBalance_WithDecimalPrecision_HandlesCorrectly()
        {
            // Arrange - Test with decimal precision
            var transactions = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 1000.50m, DebitAmount = 0, Description = "Credit 1000.50" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 500.25m, CreditAmount = 0, Description = "Debit 500.25" },
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 250.75m, DebitAmount = 0, Description = "Credit 250.75" }
            };

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(751.00m, result.FinalBalance); // 1000.50 - 500.25 + 250.75 = 751.00
            Assert.Equal(500.25m, result.TotalDebits);
            Assert.Equal(1251.25m, result.TotalCredits);
        }

        [Fact]
        public void CalculateTrialBalance_WithBothDebitAndCreditInSameTransaction_HandlesCorrectly()
        {
            // Arrange - Transaction with both debit and credit (compound entry)
            var transactions = new List<TransactionData>
            {
                new TransactionData 
                { 
                    TransactionId = Guid.NewGuid(), 
                    DebitAmount = 300, 
                    CreditAmount = 500, 
                    Description = "Compound Entry" 
                }
            };

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(200, result.FinalBalance); // -300 + 500 = 200
            Assert.Equal(2, result.TransactionCount); // Both debit and credit count as separate calculation steps
            Assert.Equal(300, result.TotalDebits);
            Assert.Equal(500, result.TotalCredits);
        }

        [Fact]
        public void GenerateCalculationExpression_WithNegativeResult_ShowsCorrectly()
        {
            // Arrange
            var values = new List<decimal> { -1000, -500, 200 };
            var finalBalance = -1300m;

            // Act
            var expression = _calculationService.GenerateCalculationExpression(values, finalBalance);

            // Assert
            Assert.Equal("-1000 - 500 + 200 = -1300", expression);
        }
    }
}