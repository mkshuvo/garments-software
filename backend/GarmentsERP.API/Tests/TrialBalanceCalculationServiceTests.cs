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

        // Additional comprehensive mathematical accuracy tests
        [Fact]
        public void CalculateTrialBalance_WithVariousScenarios_ReturnsCorrectBalance()
        {
            // Test scenario 1: Mixed positive and negative amounts
            var scenario1 = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 1000, DebitAmount = 0, Description = "Credit 1000" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 500, CreditAmount = 0, Description = "Debit 500" },
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 2000, DebitAmount = 0, Description = "Credit 2000" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 300, CreditAmount = 0, Description = "Debit 300" }
            };
            var result1 = _calculationService.CalculateTrialBalance(scenario1);
            Assert.Equal(2200, result1.FinalBalance); // 1000 - 500 + 2000 - 300 = 2200

            // Test scenario 2: All negative amounts
            var scenario2 = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 1000, CreditAmount = 0, Description = "Debit 1000" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 500, CreditAmount = 0, Description = "Debit 500" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 300, CreditAmount = 0, Description = "Debit 300" }
            };
            var result2 = _calculationService.CalculateTrialBalance(scenario2);
            Assert.Equal(-1800, result2.FinalBalance); // -1000 - 500 - 300 = -1800

            // Test scenario 3: All positive amounts
            var scenario3 = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 5000, DebitAmount = 0, Description = "Credit 5000" },
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 3000, DebitAmount = 0, Description = "Credit 3000" },
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 2000, DebitAmount = 0, Description = "Credit 2000" }
            };
            var result3 = _calculationService.CalculateTrialBalance(scenario3);
            Assert.Equal(10000, result3.FinalBalance); // 5000 + 3000 + 2000 = 10000

            // Test scenario 4: Zero amounts
            var scenario4 = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 0, DebitAmount = 0, Description = "Zero 1" },
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 0, DebitAmount = 0, Description = "Zero 2" }
            };
            var result4 = _calculationService.CalculateTrialBalance(scenario4);
            Assert.Equal(0, result4.FinalBalance);

            // Test scenario 5: Balancing amounts
            var scenario5 = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 999.99m, DebitAmount = 0, Description = "Credit 999.99" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 999.99m, CreditAmount = 0, Description = "Debit 999.99" }
            };
            var result5 = _calculationService.CalculateTrialBalance(scenario5);
            Assert.Equal(0, result5.FinalBalance); // 999.99 - 999.99 = 0
        }

        [Fact]
        public void CalculateTrialBalance_WithExtremelyLargeNumbers_HandlesCorrectly()
        {
            // Arrange - Test with very large decimal values
            var transactions = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 999999999999.99m, DebitAmount = 0, Description = "Large Credit" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 999999999999.98m, CreditAmount = 0, Description = "Large Debit" }
            };

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(0.01m, result.FinalBalance); // 999999999999.99 - 999999999999.98 = 0.01
            Assert.Equal(999999999999.98m, result.TotalDebits);
            Assert.Equal(999999999999.99m, result.TotalCredits);
        }

        [Fact]
        public void CalculateTrialBalance_WithManySmallTransactions_MaintainsPrecision()
        {
            // Arrange - Test precision with many small decimal transactions
            var transactions = new List<TransactionData>();
            decimal expectedBalance = 0;

            for (int i = 1; i <= 100; i++)
            {
                var amount = 0.01m * i; // 0.01, 0.02, 0.03, ... 1.00
                if (i % 2 == 0) // Even numbers as credits
                {
                    transactions.Add(new TransactionData 
                    { 
                        TransactionId = Guid.NewGuid(), 
                        CreditAmount = amount, 
                        DebitAmount = 0, 
                        Description = $"Credit {amount}" 
                    });
                    expectedBalance += amount;
                }
                else // Odd numbers as debits
                {
                    transactions.Add(new TransactionData 
                    { 
                        TransactionId = Guid.NewGuid(), 
                        DebitAmount = amount, 
                        CreditAmount = 0, 
                        Description = $"Debit {amount}" 
                    });
                    expectedBalance -= amount;
                }
            }

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(expectedBalance, result.FinalBalance);
            Assert.Equal(100, result.TransactionCount);
        }

        [Fact]
        public void CalculateTrialBalance_WithZeroAmountTransactions_HandlesCorrectly()
        {
            // Arrange - Test with zero amount transactions
            var transactions = new List<TransactionData>
            {
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 0, DebitAmount = 0, Description = "Zero Transaction" },
                new TransactionData { TransactionId = Guid.NewGuid(), CreditAmount = 1000, DebitAmount = 0, Description = "Credit 1000" },
                new TransactionData { TransactionId = Guid.NewGuid(), DebitAmount = 500, CreditAmount = 0, Description = "Debit 500" }
            };

            // Act
            var result = _calculationService.CalculateTrialBalance(transactions);

            // Assert
            Assert.Equal(500, result.FinalBalance); // 0 + 1000 - 500 = 500
            Assert.Equal(2, result.TransactionCount); // Zero transactions should not be counted
        }

        [Fact]
        public void CalculateTrialBalance_PerformanceTest_CompletesWithinTimeLimit()
        {
            // Arrange - Performance test with 10,000 transactions
            var transactions = new List<TransactionData>();
            var random = new Random(42); // Fixed seed for reproducible results

            for (int i = 0; i < 10000; i++)
            {
                var amount = (decimal)(random.NextDouble() * 10000);
                if (i % 2 == 0)
                {
                    transactions.Add(new TransactionData 
                    { 
                        TransactionId = Guid.NewGuid(), 
                        CreditAmount = amount, 
                        DebitAmount = 0, 
                        Description = $"Credit {amount}" 
                    });
                }
                else
                {
                    transactions.Add(new TransactionData 
                    { 
                        TransactionId = Guid.NewGuid(), 
                        DebitAmount = amount, 
                        CreditAmount = 0, 
                        Description = $"Debit {amount}" 
                    });
                }
            }

            // Act & Assert - Should complete within 1 second
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var result = _calculationService.CalculateTrialBalance(transactions);
            stopwatch.Stop();

            Assert.True(stopwatch.ElapsedMilliseconds < 1000, $"Calculation took {stopwatch.ElapsedMilliseconds}ms, expected < 1000ms");
            Assert.Equal(10000, result.TransactionCount);
            Assert.True(result.TotalDebits > 0);
            Assert.True(result.TotalCredits > 0);
        }

        [Fact]
        public void GenerateCalculationExpression_WithComplexScenario_FormatsCorrectly()
        {
            // Arrange - Test complex expression formatting
            var values = new List<decimal> { 1500.50m, -750.25m, 2000.00m, -500.75m, 1000.00m };
            var finalBalance = 3250.50m;

            // Act
            var expression = _calculationService.GenerateCalculationExpression(values, finalBalance);

            // Assert
            Assert.Contains("1500.50", expression);
            Assert.Contains("- 750.25", expression);
            Assert.Contains("+ 2000.00", expression);
            Assert.Contains("- 500.75", expression);
            Assert.Contains("+ 1000.00", expression);
            Assert.Contains("= 3250.50", expression);
        }

        [Fact]
        public void ValidateTransactionSigns_WithEdgeCases_ValidatesCorrectly()
        {
            // Test with maximum decimal values
            var maxValueTransactions = new List<TransactionData>
            {
                new TransactionData { DebitAmount = decimal.MaxValue, CreditAmount = 0 },
                new TransactionData { DebitAmount = 0, CreditAmount = decimal.MaxValue }
            };

            Assert.True(_calculationService.ValidateTransactionSigns(maxValueTransactions));

            // Test with minimum positive values
            var minValueTransactions = new List<TransactionData>
            {
                new TransactionData { DebitAmount = 0.01m, CreditAmount = 0 },
                new TransactionData { DebitAmount = 0, CreditAmount = 0.01m }
            };

            Assert.True(_calculationService.ValidateTransactionSigns(minValueTransactions));
        }
    }
}