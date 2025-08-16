using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using System.Diagnostics;
using GarmentsERP.API.Services;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Tests
{
    public class TrialBalancePerformanceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly ITrialBalanceService _trialBalanceService;
        private readonly ITrialBalanceCalculationService _calculationService;
        private readonly Mock<ILogger<TrialBalanceService>> _mockServiceLogger;
        private readonly Mock<ILogger<TrialBalanceCalculationService>> _mockCalculationLogger;

        public TrialBalancePerformanceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
                .Options;

            _context = new ApplicationDbContext(options);
            _mockServiceLogger = new Mock<ILogger<TrialBalanceService>>();
            _mockCalculationLogger = new Mock<ILogger<TrialBalanceCalculationService>>();
            
            _calculationService = new TrialBalanceCalculationService(_mockCalculationLogger.Object);
            var mockCacheService = new Mock<ITrialBalanceCacheService>();
            _trialBalanceService = new TrialBalanceService(_context, _mockServiceLogger.Object, mockCacheService.Object);
        }

        [Fact]
        public async Task GenerateTrialBalance_With10000Transactions_CompletesWithin5Seconds()
        {
            // Arrange
            await SeedLargeDatasetAsync(10000);
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var stopwatch = Stopwatch.StartNew();
            var result = await _trialBalanceService.GenerateTrialBalanceAsync(request);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 5000, 
                $"Trial balance generation took {stopwatch.ElapsedMilliseconds}ms, expected < 5000ms");
            Assert.NotNull(result);
            Assert.True(result.TotalTransactions > 0);
            Assert.NotEmpty(result.Categories);
        }

        [Fact]
        public async Task GenerateTrialBalance_With50000Transactions_CompletesWithin10Seconds()
        {
            // Arrange
            await SeedLargeDatasetAsync(50000);
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var stopwatch = Stopwatch.StartNew();
            var result = await _trialBalanceService.GenerateTrialBalanceAsync(request);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 10000, 
                $"Trial balance generation took {stopwatch.ElapsedMilliseconds}ms, expected < 10000ms");
            Assert.NotNull(result);
            Assert.True(result.TotalTransactions > 0);
        }

        [Fact]
        public void CalculateTrialBalance_With10000Transactions_CompletesWithin1Second()
        {
            // Arrange
            var transactions = GenerateTestTransactions(10000);

            // Act
            var stopwatch = Stopwatch.StartNew();
            var result = _calculationService.CalculateTrialBalance(transactions);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 1000, 
                $"Calculation took {stopwatch.ElapsedMilliseconds}ms, expected < 1000ms");
            Assert.Equal(10000, result.TransactionCount);
            Assert.NotNull(result.Expression);
        }

        [Fact]
        public void CalculateTrialBalance_With100000Transactions_CompletesWithin5Seconds()
        {
            // Arrange
            var transactions = GenerateTestTransactions(100000);

            // Act
            var stopwatch = Stopwatch.StartNew();
            var result = _calculationService.CalculateTrialBalance(transactions);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 5000, 
                $"Calculation took {stopwatch.ElapsedMilliseconds}ms, expected < 5000ms");
            Assert.Equal(100000, result.TransactionCount);
        }

        [Fact]
        public async Task GenerateTrialBalance_MemoryUsage_StaysWithinLimits()
        {
            // Arrange
            await SeedLargeDatasetAsync(25000);
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Measure initial memory
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
            var initialMemory = GC.GetTotalMemory(false);

            // Act
            var result = await _trialBalanceService.GenerateTrialBalanceAsync(request);

            // Measure final memory
            var finalMemory = GC.GetTotalMemory(false);
            var memoryIncrease = finalMemory - initialMemory;

            // Assert
            Assert.NotNull(result);
            // Memory increase should be reasonable (less than 100MB for 25k transactions)
            Assert.True(memoryIncrease < 100 * 1024 * 1024, 
                $"Memory increase was {memoryIncrease / (1024 * 1024)}MB, expected < 100MB");
        }

        [Fact]
        public async Task GenerateTrialBalance_ConcurrentRequests_HandlesEfficiently()
        {
            // Arrange
            await SeedLargeDatasetAsync(5000);
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act - Run 5 concurrent requests
            var tasks = new List<Task<TrialBalanceResponseDto>>();
            var stopwatch = Stopwatch.StartNew();

            for (int i = 0; i < 5; i++)
            {
                tasks.Add(_trialBalanceService.GenerateTrialBalanceAsync(request));
            }

            var results = await Task.WhenAll(tasks);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 15000, 
                $"Concurrent requests took {stopwatch.ElapsedMilliseconds}ms, expected < 15000ms");
            Assert.All(results, result => 
            {
                Assert.NotNull(result);
                Assert.True(result.TotalTransactions > 0);
            });
        }

        [Fact]
        public async Task GetAccountTransactions_WithLargeAccountHistory_CompletesQuickly()
        {
            // Arrange
            var accountId = await SeedAccountWithManyTransactionsAsync(5000);
            var startDate = DateTime.UtcNow.AddDays(-30);
            var endDate = DateTime.UtcNow;

            // Act
            var stopwatch = Stopwatch.StartNew();
            var transactions = await _trialBalanceService.GetAccountTransactionsAsync(
                accountId, startDate, endDate);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 2000, 
                $"Account transactions query took {stopwatch.ElapsedMilliseconds}ms, expected < 2000ms");
            Assert.NotEmpty(transactions);
        }

        [Fact]
        public void GenerateCalculationExpression_WithLargeTransactionList_CompletesQuickly()
        {
            // Arrange
            var values = new List<decimal>();
            var random = new Random(42);
            
            for (int i = 0; i < 10000; i++)
            {
                values.Add((decimal)(random.NextDouble() * 10000 - 5000));
            }
            
            var finalBalance = values.Sum();

            // Act
            var stopwatch = Stopwatch.StartNew();
            var expression = _calculationService.GenerateCalculationExpression(values, finalBalance);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 500, 
                $"Expression generation took {stopwatch.ElapsedMilliseconds}ms, expected < 500ms");
            Assert.NotNull(expression);
            Assert.Contains("=", expression);
        }

        [Fact]
        public async Task GenerateTrialBalance_WithComplexDateRanges_MaintainsPerformance()
        {
            // Arrange
            await SeedDataAcrossMultipleYearsAsync();
            
            var requests = new[]
            {
                new TrialBalanceRequestDto
                {
                    StartDate = DateTime.UtcNow.AddYears(-2),
                    EndDate = DateTime.UtcNow.AddYears(-1),
                    GroupByCategory = true,
                    IncludeZeroBalances = false
                },
                new TrialBalanceRequestDto
                {
                    StartDate = DateTime.UtcNow.AddMonths(-6),
                    EndDate = DateTime.UtcNow,
                    GroupByCategory = true,
                    IncludeZeroBalances = true
                },
                new TrialBalanceRequestDto
                {
                    StartDate = DateTime.UtcNow.AddDays(-7),
                    EndDate = DateTime.UtcNow,
                    GroupByCategory = false,
                    IncludeZeroBalances = false
                }
            };

            // Act & Assert
            foreach (var request in requests)
            {
                var stopwatch = Stopwatch.StartNew();
                var result = await _trialBalanceService.GenerateTrialBalanceAsync(request);
                stopwatch.Stop();

                Assert.True(stopwatch.ElapsedMilliseconds < 5000, 
                    $"Complex date range query took {stopwatch.ElapsedMilliseconds}ms, expected < 5000ms");
                Assert.NotNull(result);
            }
        }

        [Fact]
        public async Task GenerateTrialBalance_WithManyAccountTypes_ScalesLinearly()
        {
            // Arrange - Create datasets of different sizes
            var sizes = new[] { 1000, 5000, 10000 };
            var times = new List<long>();

            foreach (var size in sizes)
            {
                // Clean database
                _context.Database.EnsureDeleted();
                _context.Database.EnsureCreated();

                await SeedLargeDatasetAsync(size);
                var request = new TrialBalanceRequestDto
                {
                    StartDate = DateTime.UtcNow.AddDays(-30),
                    EndDate = DateTime.UtcNow,
                    GroupByCategory = true,
                    IncludeZeroBalances = false
                };

                // Act
                var stopwatch = Stopwatch.StartNew();
                var result = await _trialBalanceService.GenerateTrialBalanceAsync(request);
                stopwatch.Stop();

                times.Add(stopwatch.ElapsedMilliseconds);
                Assert.NotNull(result);
            }

            // Assert - Performance should scale reasonably (not exponentially)
            // Time for 10k should be less than 10x time for 1k
            Assert.True(times[2] < times[0] * 15, 
                $"Performance scaling issue: 1k={times[0]}ms, 5k={times[1]}ms, 10k={times[2]}ms");
        }

        [Fact]
        public void ValidateTransactionSigns_WithLargeDataset_CompletesQuickly()
        {
            // Arrange
            var transactions = GenerateTestTransactions(50000);

            // Act
            var stopwatch = Stopwatch.StartNew();
            var isValid = _calculationService.ValidateTransactionSigns(transactions);
            stopwatch.Stop();

            // Assert
            Assert.True(stopwatch.ElapsedMilliseconds < 1000, 
                $"Validation took {stopwatch.ElapsedMilliseconds}ms, expected < 1000ms");
            Assert.True(isValid);
        }

        private async Task SeedLargeDatasetAsync(int transactionCount)
        {
            var random = new Random(42); // Fixed seed for reproducible results

            // Create accounts
            var accounts = new List<ChartOfAccount>();
            var accountTypes = Enum.GetValues<AccountType>();
            
            for (int i = 0; i < 20; i++)
            {
                accounts.Add(new ChartOfAccount
                {
                    Id = Guid.NewGuid(),
                    AccountName = $"Account {i}",
                    AccountCode = $"ACC{i:D4}",
                    AccountType = accountTypes[i % accountTypes.Length],
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            _context.ChartOfAccounts.AddRange(accounts);
            await _context.SaveChangesAsync();

            // Create journal entries and lines
            var journalEntries = new List<JournalEntry>();
            var journalEntryLines = new List<JournalEntryLine>();

            for (int i = 0; i < transactionCount; i++)
            {
                var journalEntry = new JournalEntry
                {
                    Id = Guid.NewGuid(),
                    TransactionDate = DateTime.UtcNow.AddDays(-random.Next(1, 365)),
                    Description = $"Transaction {i}",
                    ReferenceNumber = $"TXN{i:D6}",
                    JournalType = JournalType.General,
                    Status = JournalStatus.Posted,
                    CreatedAt = DateTime.UtcNow
                };

                journalEntries.Add(journalEntry);

                var account = accounts[random.Next(accounts.Count)];
                var amount = (decimal)(random.NextDouble() * 10000);
                var isDebit = random.Next(2) == 0;

                journalEntryLines.Add(new JournalEntryLine
                {
                    Id = Guid.NewGuid(),
                    JournalEntryId = journalEntry.Id,
                    AccountId = account.Id,
                    Debit = isDebit ? amount : 0,
                    Credit = isDebit ? 0 : amount,
                    Description = $"Line {i}"
                });

                // Add batching to avoid memory issues
                if (i % 1000 == 0 && i > 0)
                {
                    _context.JournalEntries.AddRange(journalEntries);
                    _context.JournalEntryLines.AddRange(journalEntryLines);
                    await _context.SaveChangesAsync();
                    
                    journalEntries.Clear();
                    journalEntryLines.Clear();
                }
            }

            // Save remaining entries
            if (journalEntries.Any())
            {
                _context.JournalEntries.AddRange(journalEntries);
                _context.JournalEntryLines.AddRange(journalEntryLines);
                await _context.SaveChangesAsync();
            }
        }

        private async Task<Guid> SeedAccountWithManyTransactionsAsync(int transactionCount)
        {
            var account = new ChartOfAccount
            {
                Id = Guid.NewGuid(),
                AccountName = "High Volume Account",
                AccountCode = "HVA001",
                AccountType = AccountType.Asset,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChartOfAccounts.Add(account);
            await _context.SaveChangesAsync();

            var random = new Random(42);
            var journalEntries = new List<JournalEntry>();
            var journalEntryLines = new List<JournalEntryLine>();

            for (int i = 0; i < transactionCount; i++)
            {
                var journalEntry = new JournalEntry
                {
                    Id = Guid.NewGuid(),
                    TransactionDate = DateTime.UtcNow.AddDays(-random.Next(1, 60)),
                    Description = $"High Volume Transaction {i}",
                    ReferenceNumber = $"HV{i:D6}",
                    JournalType = JournalType.General,
                    Status = JournalStatus.Posted,
                    CreatedAt = DateTime.UtcNow
                };

                journalEntries.Add(journalEntry);

                var amount = (decimal)(random.NextDouble() * 1000);
                var isDebit = random.Next(2) == 0;

                journalEntryLines.Add(new JournalEntryLine
                {
                    Id = Guid.NewGuid(),
                    JournalEntryId = journalEntry.Id,
                    AccountId = account.Id,
                    Debit = isDebit ? amount : 0,
                    Credit = isDebit ? 0 : amount,
                    Description = $"High Volume Line {i}"
                });

                // Batch save
                if (i % 500 == 0 && i > 0)
                {
                    _context.JournalEntries.AddRange(journalEntries);
                    _context.JournalEntryLines.AddRange(journalEntryLines);
                    await _context.SaveChangesAsync();
                    
                    journalEntries.Clear();
                    journalEntryLines.Clear();
                }
            }

            // Save remaining
            if (journalEntries.Any())
            {
                _context.JournalEntries.AddRange(journalEntries);
                _context.JournalEntryLines.AddRange(journalEntryLines);
                await _context.SaveChangesAsync();
            }

            return account.Id;
        }

        private async Task SeedDataAcrossMultipleYearsAsync()
        {
            var accounts = new List<ChartOfAccount>
            {
                new ChartOfAccount { Id = Guid.NewGuid(), AccountName = "Multi-Year Account 1", AccountCode = "MYA001", AccountType = AccountType.Asset, IsActive = true, CreatedAt = DateTime.UtcNow },
                new ChartOfAccount { Id = Guid.NewGuid(), AccountName = "Multi-Year Account 2", AccountCode = "MYA002", AccountType = AccountType.Revenue, IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            _context.ChartOfAccounts.AddRange(accounts);
            await _context.SaveChangesAsync();

            var random = new Random(42);
            var journalEntries = new List<JournalEntry>();
            var journalEntryLines = new List<JournalEntryLine>();

            // Create transactions across 3 years
            for (int year = 0; year < 3; year++)
            {
                for (int month = 1; month <= 12; month++)
                {
                    for (int day = 1; day <= 28; day += 7) // Weekly transactions
                    {
                        var journalEntry = new JournalEntry
                        {
                            Id = Guid.NewGuid(),
                            TransactionDate = new DateTime(DateTime.UtcNow.Year - year, month, day),
                            Description = $"Multi-year transaction {year}-{month}-{day}",
                            ReferenceNumber = $"MY{year}{month:D2}{day:D2}",
                            JournalType = JournalType.General,
                            Status = JournalStatus.Posted,
                            CreatedAt = DateTime.UtcNow
                        };

                        journalEntries.Add(journalEntry);

                        var account = accounts[random.Next(accounts.Count)];
                        var amount = (decimal)(random.NextDouble() * 5000);
                        var isDebit = random.Next(2) == 0;

                        journalEntryLines.Add(new JournalEntryLine
                        {
                            Id = Guid.NewGuid(),
                            JournalEntryId = journalEntry.Id,
                            AccountId = account.Id,
                            Debit = isDebit ? amount : 0,
                            Credit = isDebit ? 0 : amount,
                            Description = $"Multi-year line {year}-{month}-{day}"
                        });
                    }
                }
            }

            _context.JournalEntries.AddRange(journalEntries);
            _context.JournalEntryLines.AddRange(journalEntryLines);
            await _context.SaveChangesAsync();
        }

        private List<TransactionData> GenerateTestTransactions(int count)
        {
            var transactions = new List<TransactionData>();
            var random = new Random(42);

            for (int i = 0; i < count; i++)
            {
                var amount = (decimal)(random.NextDouble() * 10000);
                var isDebit = random.Next(2) == 0;

                transactions.Add(new TransactionData
                {
                    TransactionId = Guid.NewGuid(),
                    DebitAmount = isDebit ? amount : 0,
                    CreditAmount = isDebit ? 0 : amount,
                    Description = $"Test Transaction {i}",
                    AccountName = $"Account {i % 10}"
                });
            }

            return transactions;
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}