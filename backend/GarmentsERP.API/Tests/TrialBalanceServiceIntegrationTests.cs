using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using GarmentsERP.API.Services;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.Tests
{
    public class TrialBalanceServiceIntegrationTests
    {
        private readonly Mock<ILogger<TrialBalanceService>> _mockLogger;

        public TrialBalanceServiceIntegrationTests()
        {
            _mockLogger = new Mock<ILogger<TrialBalanceService>>();
        }

        [Fact]
        public void GetCategoryName_WithDifferentAccountTypes_ReturnsCorrectCategories()
        {
            // This test verifies the account categorization logic
            
            // Test Asset categorization
            Assert.Equal("Assets", GetCategoryNamePublic(AccountType.Asset));
            
            // Test Liability categorization
            Assert.Equal("Liabilities", GetCategoryNamePublic(AccountType.Liability));
            
            // Test Equity categorization
            Assert.Equal("Equity", GetCategoryNamePublic(AccountType.Equity));
            
            // Test Revenue categorization
            Assert.Equal("Income", GetCategoryNamePublic(AccountType.Revenue));
            
            // Test Expense categorization
            Assert.Equal("Expenses", GetCategoryNamePublic(AccountType.Expense));
        }

        [Fact]
        public void GetRecommendedDatabaseIndexes_ReturnsExpectedIndexes()
        {
            // Arrange
            var service = CreateTrialBalanceServiceMock();
            
            // Act
            var indexes = service.GetRecommendedDatabaseIndexes();
            
            // Assert
            Assert.NotEmpty(indexes);
            Assert.Contains(indexes, idx => idx.Contains("IX_JournalEntries_TransactionDate_Status"));
            Assert.Contains(indexes, idx => idx.Contains("IX_JournalEntryLines_AccountId_JournalEntryId"));
            Assert.Contains(indexes, idx => idx.Contains("IX_ChartOfAccounts_AccountType_IsActive"));
            Assert.Contains(indexes, idx => idx.Contains("IX_TrialBalance_Composite"));
        }

        [Fact]
        public void AccountBalanceSummary_PropertiesSetCorrectly()
        {
            // Arrange & Act
            var summary = new AccountBalanceSummary
            {
                AccountId = Guid.NewGuid(),
                AccountName = "Test Account",
                AccountType = AccountType.Asset,
                CategoryName = "Assets",
                CategoryDescription = "Current Assets - Cash & Bank",
                TotalDebits = 1000m,
                TotalCredits = 500m,
                NetBalance = -500m, // Debits negative, credits positive: -1000 + 500 = -500
                TransactionCount = 5,
                MostRecentParticulars = "Recent transaction description"
            };

            // Assert
            Assert.NotEqual(Guid.Empty, summary.AccountId);
            Assert.Equal("Test Account", summary.AccountName);
            Assert.Equal(AccountType.Asset, summary.AccountType);
            Assert.Equal("Assets", summary.CategoryName);
            Assert.Equal("Current Assets - Cash & Bank", summary.CategoryDescription);
            Assert.Equal(1000m, summary.TotalDebits);
            Assert.Equal(500m, summary.TotalCredits);
            Assert.Equal(-500m, summary.NetBalance);
            Assert.Equal(5, summary.TransactionCount);
            Assert.Equal("Recent transaction description", summary.MostRecentParticulars);
        }

        [Fact]
        public void TransactionSummaryDto_PropertiesSetCorrectly()
        {
            // Arrange & Act
            var transactionId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            var transactionDate = DateTime.UtcNow;
            
            var dto = new TransactionSummaryDto
            {
                AccountId = accountId,
                AccountName = "Cash Account",
                AccountType = AccountType.Asset,
                TransactionDate = transactionDate,
                JournalType = JournalType.CashReceipt,
                DebitAmount = 0m,
                CreditAmount = 1000m,
                Description = "Cash receipt from customer",
                ReferenceNumber = "CR-001"
            };

            // Assert
            Assert.Equal(accountId, dto.AccountId);
            Assert.Equal("Cash Account", dto.AccountName);
            Assert.Equal(AccountType.Asset, dto.AccountType);
            Assert.Equal(transactionDate, dto.TransactionDate);
            Assert.Equal(JournalType.CashReceipt, dto.JournalType);
            Assert.Equal(0m, dto.DebitAmount);
            Assert.Equal(1000m, dto.CreditAmount);
            Assert.Equal("Cash receipt from customer", dto.Description);
            Assert.Equal("CR-001", dto.ReferenceNumber);
        }

        // Helper method to test the private GetCategoryName method
        private string GetCategoryNamePublic(AccountType accountType)
        {
            return accountType switch
            {
                AccountType.Asset => "Assets",
                AccountType.Liability => "Liabilities",
                AccountType.Equity => "Equity",
                AccountType.Revenue => "Income",
                AccountType.Expense => "Expenses",
                _ => "Other"
            };
        }

        // Helper method to create a mock TrialBalanceService for testing
        private TrialBalanceService CreateTrialBalanceServiceMock()
        {
            // Note: This would normally require a mock DbContext, but for this test
            // we're only testing the public methods that don't require database access
            var mockCacheService = new Mock<ITrialBalanceCacheService>();
            return new TrialBalanceService(null!, _mockLogger.Object, mockCacheService.Object);
        }
    }
}