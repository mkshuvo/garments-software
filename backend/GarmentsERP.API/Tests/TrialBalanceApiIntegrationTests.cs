using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using System.Net;
using Xunit;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models.Accounting;
using Microsoft.AspNetCore.Identity;
using GarmentsERP.API.Models;
using System.Text.Json;

namespace GarmentsERP.API.Tests
{
    public class TrialBalanceApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public TrialBalanceApiIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext registration
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);

                    // Add in-memory database for testing
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("TestDatabase_" + Guid.NewGuid());
                    });
                });
            });

            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task GetTrialBalance_WithValidDateRange_ReturnsSuccessResponse()
        {
            // Arrange
            await SeedTestDataAsync();
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/trial-balance", request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var trialBalance = JsonSerializer.Deserialize<TrialBalanceResponseDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(trialBalance);
            Assert.NotEmpty(trialBalance.Categories);
            Assert.True(trialBalance.GeneratedAt <= DateTime.UtcNow);
        }

        [Fact]
        public async Task GetTrialBalance_WithInvalidDateRange_ReturnsBadRequest()
        {
            // Arrange
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(-30), // End date before start date
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/trial-balance", request);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetTrialBalance_WithLargeDateRange_ReturnsBadRequest()
        {
            // Arrange
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-400), // More than 365 days
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/trial-balance", request);

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetTrialBalance_WithEmptyDatabase_ReturnsEmptyCategories()
        {
            // Arrange - No test data seeded
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/trial-balance", request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var trialBalance = JsonSerializer.Deserialize<TrialBalanceResponseDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(trialBalance);
            Assert.Equal(0, trialBalance.FinalBalance);
            Assert.Equal(0, trialBalance.TotalDebits);
            Assert.Equal(0, trialBalance.TotalCredits);
        }

        [Fact]
        public async Task GetTrialBalance_WithSpecificScenario_ReturnsCorrectCalculation()
        {
            // Arrange
            await SeedSpecificTestScenarioAsync();
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/trial-balance", request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var trialBalance = JsonSerializer.Deserialize<TrialBalanceResponseDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(trialBalance);
            Assert.Equal(9900, trialBalance.FinalBalance); // Expected from test scenario: 1000 - 1100 + 11000 - 1000 = 9900
            Assert.Contains("= 9900", trialBalance.CalculationExpression);
        }

        [Fact]
        public async Task GetTrialBalance_WithCategoryFilter_ReturnsFilteredResults()
        {
            // Arrange
            await SeedTestDataAsync();
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false,
                CategoryFilter = new List<string> { "Assets", "Liabilities" }
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/trial-balance", request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var trialBalance = JsonSerializer.Deserialize<TrialBalanceResponseDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(trialBalance);
            Assert.True(trialBalance.Categories.All(c => 
                c.Name == "Assets" || c.Name == "Liabilities"));
        }

        [Fact]
        public async Task GetTrialBalance_WithZeroBalancesIncluded_ReturnsAllAccounts()
        {
            // Arrange
            await SeedTestDataWithZeroBalancesAsync();
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = true
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/trial-balance", request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var trialBalance = JsonSerializer.Deserialize<TrialBalanceResponseDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(trialBalance);
            
            // Should include accounts with zero balances
            var allAccounts = trialBalance.Categories.SelectMany(c => c.Accounts).ToList();
            Assert.Contains(allAccounts, a => a.NetBalance == 0);
        }

        [Fact]
        public async Task GetTrialBalance_PerformanceTest_CompletesWithinTimeLimit()
        {
            // Arrange
            await SeedLargeDatasetAsync(10000); // 10,000 transactions
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.UtcNow.AddDays(-30),
                EndDate = DateTime.UtcNow,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var response = await _client.PostAsJsonAsync("/api/trial-balance", request);
            stopwatch.Stop();

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.True(stopwatch.ElapsedMilliseconds < 5000, 
                $"API call took {stopwatch.ElapsedMilliseconds}ms, expected < 5000ms");
        }

        [Fact]
        public async Task GetAccountTransactions_WithValidAccountId_ReturnsTransactions()
        {
            // Arrange
            await SeedTestDataAsync();
            var accountId = await GetFirstAccountIdAsync();

            // Act
            var response = await _client.GetAsync($"/api/trial-balance/account/{accountId}/transactions?startDate={DateTime.UtcNow.AddDays(-30):yyyy-MM-dd}&endDate={DateTime.UtcNow:yyyy-MM-dd}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var transactions = JsonSerializer.Deserialize<List<TransactionSummaryDto>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(transactions);
        }

        [Fact]
        public async Task GetAccountTransactions_WithInvalidAccountId_ReturnsNotFound()
        {
            // Arrange
            var invalidAccountId = Guid.NewGuid();

            // Act
            var response = await _client.GetAsync($"/api/trial-balance/account/{invalidAccountId}/transactions?startDate={DateTime.UtcNow.AddDays(-30):yyyy-MM-dd}&endDate={DateTime.UtcNow:yyyy-MM-dd}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task CompareTrialBalances_WithValidPeriods_ReturnsComparison()
        {
            // Arrange
            await SeedTestDataAsync();
            var request = new TrialBalanceComparisonRequestDto
            {
                Period1StartDate = DateTime.UtcNow.AddDays(-60),
                Period1EndDate = DateTime.UtcNow.AddDays(-30),
                Period2StartDate = DateTime.UtcNow.AddDays(-30),
                Period2EndDate = DateTime.UtcNow
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/trial-balance/compare", request);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadAsStringAsync();
            var comparison = JsonSerializer.Deserialize<TrialBalanceComparisonDto>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            Assert.NotNull(comparison);
            Assert.NotNull(comparison.Period1);
            Assert.NotNull(comparison.Period2);
            Assert.NotNull(comparison.Variances);
        }

        private async Task SeedTestDataAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Create test chart of accounts
            var cashAccount = new ChartOfAccount
            {
                Id = Guid.NewGuid(),
                AccountName = "Cash",
                AccountCode = "1001",
                AccountType = AccountType.Asset,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var revenueAccount = new ChartOfAccount
            {
                Id = Guid.NewGuid(),
                AccountName = "Sales Revenue",
                AccountCode = "4001",
                AccountType = AccountType.Revenue,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.ChartOfAccounts.AddRange(cashAccount, revenueAccount);

            // Create test journal entries
            var journalEntry = new JournalEntry
            {
                Id = Guid.NewGuid(),
                TransactionDate = DateTime.UtcNow.AddDays(-15),
                Description = "Test Transaction",
                ReferenceNumber = "TEST-001",
                JournalType = JournalType.General,
                Status = JournalStatus.Posted,
                CreatedAt = DateTime.UtcNow
            };

            context.JournalEntries.Add(journalEntry);

            // Create journal entry lines
            var debitLine = new JournalEntryLine
            {
                Id = Guid.NewGuid(),
                JournalEntryId = journalEntry.Id,
                AccountId = cashAccount.Id,
                Debit = 1000,
                Credit = 0,
                Description = "Cash received"
            };

            var creditLine = new JournalEntryLine
            {
                Id = Guid.NewGuid(),
                JournalEntryId = journalEntry.Id,
                AccountId = revenueAccount.Id,
                Debit = 0,
                Credit = 1000,
                Description = "Sales revenue"
            };

            context.JournalEntryLines.AddRange(debitLine, creditLine);

            await context.SaveChangesAsync();
        }

        private async Task SeedSpecificTestScenarioAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Create accounts for the specific test scenario: 1000 - 1100 + 11000 - 1000 = 9900
            var accounts = new List<ChartOfAccount>
            {
                new ChartOfAccount { Id = Guid.NewGuid(), AccountName = "Account1", AccountCode = "1001", AccountType = AccountType.Asset, IsActive = true, CreatedAt = DateTime.UtcNow },
                new ChartOfAccount { Id = Guid.NewGuid(), AccountName = "Account2", AccountCode = "1002", AccountType = AccountType.Asset, IsActive = true, CreatedAt = DateTime.UtcNow },
                new ChartOfAccount { Id = Guid.NewGuid(), AccountName = "Account3", AccountCode = "4001", AccountType = AccountType.Revenue, IsActive = true, CreatedAt = DateTime.UtcNow },
                new ChartOfAccount { Id = Guid.NewGuid(), AccountName = "Account4", AccountCode = "5001", AccountType = AccountType.Expense, IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            context.ChartOfAccounts.AddRange(accounts);

            // Create journal entries for the specific scenario
            var journalEntries = new List<JournalEntry>();
            var journalEntryLines = new List<JournalEntryLine>();

            // Transaction 1: Credit 1000
            var je1 = new JournalEntry
            {
                Id = Guid.NewGuid(),
                TransactionDate = DateTime.UtcNow.AddDays(-20),
                Description = "Credit 1000",
                ReferenceNumber = "TEST-001",
                JournalType = JournalType.General,
                Status = JournalStatus.Posted,
                CreatedAt = DateTime.UtcNow
            };
            journalEntries.Add(je1);
            journalEntryLines.Add(new JournalEntryLine
            {
                Id = Guid.NewGuid(),
                JournalEntryId = je1.Id,
                AccountId = accounts[0].Id,
                Debit = 0,
                Credit = 1000,
                Description = "Credit 1000"
            });

            // Transaction 2: Debit 1100
            var je2 = new JournalEntry
            {
                Id = Guid.NewGuid(),
                TransactionDate = DateTime.UtcNow.AddDays(-19),
                Description = "Debit 1100",
                ReferenceNumber = "TEST-002",
                JournalType = JournalType.General,
                Status = JournalStatus.Posted,
                CreatedAt = DateTime.UtcNow
            };
            journalEntries.Add(je2);
            journalEntryLines.Add(new JournalEntryLine
            {
                Id = Guid.NewGuid(),
                JournalEntryId = je2.Id,
                AccountId = accounts[1].Id,
                Debit = 1100,
                Credit = 0,
                Description = "Debit 1100"
            });

            // Transaction 3: Credit 11000
            var je3 = new JournalEntry
            {
                Id = Guid.NewGuid(),
                TransactionDate = DateTime.UtcNow.AddDays(-18),
                Description = "Credit 11000",
                ReferenceNumber = "TEST-003",
                JournalType = JournalType.General,
                Status = JournalStatus.Posted,
                CreatedAt = DateTime.UtcNow
            };
            journalEntries.Add(je3);
            journalEntryLines.Add(new JournalEntryLine
            {
                Id = Guid.NewGuid(),
                JournalEntryId = je3.Id,
                AccountId = accounts[2].Id,
                Debit = 0,
                Credit = 11000,
                Description = "Credit 11000"
            });

            // Transaction 4: Debit 1000
            var je4 = new JournalEntry
            {
                Id = Guid.NewGuid(),
                TransactionDate = DateTime.UtcNow.AddDays(-17),
                Description = "Debit 1000",
                ReferenceNumber = "TEST-004",
                JournalType = JournalType.General,
                Status = JournalStatus.Posted,
                CreatedAt = DateTime.UtcNow
            };
            journalEntries.Add(je4);
            journalEntryLines.Add(new JournalEntryLine
            {
                Id = Guid.NewGuid(),
                JournalEntryId = je4.Id,
                AccountId = accounts[3].Id,
                Debit = 1000,
                Credit = 0,
                Description = "Debit 1000"
            });

            context.JournalEntries.AddRange(journalEntries);
            context.JournalEntryLines.AddRange(journalEntryLines);

            await context.SaveChangesAsync();
        }

        private async Task SeedTestDataWithZeroBalancesAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Create accounts with zero balances
            var accounts = new List<ChartOfAccount>
            {
                new ChartOfAccount { Id = Guid.NewGuid(), AccountName = "Zero Balance Account", AccountCode = "1001", AccountType = AccountType.Asset, IsActive = true, CreatedAt = DateTime.UtcNow },
                new ChartOfAccount { Id = Guid.NewGuid(), AccountName = "Active Account", AccountCode = "1002", AccountType = AccountType.Asset, IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            context.ChartOfAccounts.AddRange(accounts);

            // Create transactions that result in zero balance for first account
            var journalEntry = new JournalEntry
            {
                Id = Guid.NewGuid(),
                TransactionDate = DateTime.UtcNow.AddDays(-15),
                Description = "Zero Balance Transaction",
                ReferenceNumber = "ZERO-001",
                JournalType = JournalType.General,
                Status = JournalStatus.Posted,
                CreatedAt = DateTime.UtcNow
            };

            context.JournalEntries.Add(journalEntry);

            // Debit and credit same amount to create zero balance
            var lines = new List<JournalEntryLine>
            {
                new JournalEntryLine
                {
                    Id = Guid.NewGuid(),
                    JournalEntryId = journalEntry.Id,
                    AccountId = accounts[0].Id,
                    Debit = 500,
                    Credit = 0,
                    Description = "Debit 500"
                },
                new JournalEntryLine
                {
                    Id = Guid.NewGuid(),
                    JournalEntryId = journalEntry.Id,
                    AccountId = accounts[0].Id,
                    Debit = 0,
                    Credit = 500,
                    Description = "Credit 500"
                },
                new JournalEntryLine
                {
                    Id = Guid.NewGuid(),
                    JournalEntryId = journalEntry.Id,
                    AccountId = accounts[1].Id,
                    Debit = 0,
                    Credit = 1000,
                    Description = "Credit 1000"
                }
            };

            context.JournalEntryLines.AddRange(lines);

            await context.SaveChangesAsync();
        }

        private async Task SeedLargeDatasetAsync(int transactionCount)
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Create multiple accounts
            var accounts = new List<ChartOfAccount>();
            for (int i = 1; i <= 10; i++)
            {
                accounts.Add(new ChartOfAccount
                {
                    Id = Guid.NewGuid(),
                    AccountName = $"Account {i}",
                    AccountCode = $"100{i}",
                    AccountType = i <= 5 ? AccountType.Asset : AccountType.Revenue,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            context.ChartOfAccounts.AddRange(accounts);

            // Create large number of transactions
            var journalEntries = new List<JournalEntry>();
            var journalEntryLines = new List<JournalEntryLine>();
            var random = new Random(42); // Fixed seed for reproducible results

            for (int i = 0; i < transactionCount; i++)
            {
                var journalEntry = new JournalEntry
                {
                    Id = Guid.NewGuid(),
                    TransactionDate = DateTime.UtcNow.AddDays(-random.Next(1, 30)),
                    Description = $"Transaction {i}",
                    ReferenceNumber = $"PERF-{i:D6}",
                    JournalType = JournalType.General,
                    Status = JournalStatus.Posted,
                    CreatedAt = DateTime.UtcNow
                };

                journalEntries.Add(journalEntry);

                var account = accounts[random.Next(accounts.Count)];
                var amount = (decimal)(random.NextDouble() * 1000);
                var isDebit = random.Next(2) == 0;

                journalEntryLines.Add(new JournalEntryLine
                {
                    Id = Guid.NewGuid(),
                    JournalEntryId = journalEntry.Id,
                    AccountId = account.Id,
                    Debit = isDebit ? amount : 0,
                    Credit = isDebit ? 0 : amount,
                    Description = $"Transaction {i} - {(isDebit ? "Debit" : "Credit")} {amount}"
                });
            }

            context.JournalEntries.AddRange(journalEntries);
            context.JournalEntryLines.AddRange(journalEntryLines);

            await context.SaveChangesAsync();
        }

        private async Task<Guid> GetFirstAccountIdAsync()
        {
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var account = await context.ChartOfAccounts.FirstOrDefaultAsync();
            return account?.Id ?? Guid.NewGuid();
        }
    }

    // Additional DTO for comparison requests
    public class TrialBalanceComparisonRequestDto
    {
        public DateTime Period1StartDate { get; set; }
        public DateTime Period1EndDate { get; set; }
        public DateTime Period2StartDate { get; set; }
        public DateTime Period2EndDate { get; set; }
    }
}
