using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Services;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.Models.Contacts;
using GarmentsERP.API.Interfaces;
using Moq;
using Xunit;

namespace GarmentsERP.API.Tests
{
    public class ServiceMethodsTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly EnhancedCashBookService _service;

        public ServiceMethodsTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            var mockTransactionValidator = new Mock<ITransactionValidator>();
            var mockBalanceService = new Mock<IBalanceService>();
            var mockLogger = new Mock<ILogger<EnhancedCashBookService>>();
            _service = new EnhancedCashBookService(_context, mockTransactionValidator.Object, mockBalanceService.Object, mockLogger.Object);
            
            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Add test categories
            var salesCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Sales Revenue",
                Type = CategoryType.Credit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var suppliesCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Office Supplies",
                Type = CategoryType.Debit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.AddRange(salesCategory, suppliesCategory);

            // Add test contacts
            var customer = new Contact
            {
                Id = Guid.NewGuid(),
                Name = "ABC Company",
                ContactType = ContactType.Customer,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var supplier = new Contact
            {
                Id = Guid.NewGuid(),
                Name = "Office Depot",
                ContactType = ContactType.Supplier,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Contacts.AddRange(customer, supplier);

            // Add test accounts
            var salesAccount = new ChartOfAccount
            {
                Id = Guid.NewGuid(),
                AccountCode = "4000",
                AccountName = "Sales Revenue",
                AccountType = AccountType.Revenue,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var suppliesAccount = new ChartOfAccount
            {
                Id = Guid.NewGuid(),
                AccountCode = "5000",
                AccountName = "Office Supplies",
                AccountType = AccountType.Expense,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ChartOfAccounts.AddRange(salesAccount, suppliesAccount);
            _context.SaveChanges();
        }

        [Fact]
        public async Task SaveCreditTransactionAsync_ValidRequest_CreatesJournalEntry()
        {
            // Arrange
            var request = new CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Sales Revenue",
                Particulars = "Payment from customer ABC",
                Amount = 1000.00m,
                ContactName = "ABC Company"
            };

            // Act
            var result = await _service.SaveCreditTransactionAsync(request);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(result.ReferenceNumber);
            Assert.Contains("CB-", result.ReferenceNumber);

            // Verify journal entry was created
            var journalEntry = await _context.JournalEntries
                .Include(je => je.JournalEntryLines)
                .FirstOrDefaultAsync(je => je.ReferenceNumber == result.ReferenceNumber);

            Assert.NotNull(journalEntry);
            Assert.Equal(JournalType.CashReceipt, journalEntry.JournalType);
            Assert.Equal(request.Date.Date, journalEntry.TransactionDate.Date);
            Assert.Equal(request.Particulars, journalEntry.Description);

            // Verify single journal entry line was created
            Assert.Single(journalEntry.JournalEntryLines);
            var line = journalEntry.JournalEntryLines.First();
            Assert.Equal(request.Amount, line.Credit);
            Assert.Equal(0, line.Debit);
        }

        [Fact]
        public async Task SaveDebitTransactionAsync_ValidRequest_CreatesJournalEntry()
        {
            // Arrange
            var request = new DebitTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Office Supplies",
                Particulars = "Purchase of stationery",
                Amount = 150.00m,
                SupplierName = "Office Depot"
            };

            // Act
            var result = await _service.SaveDebitTransactionAsync(request);

            // Assert
            Assert.True(result.Success);
            Assert.NotNull(result.ReferenceNumber);
            Assert.Contains("CB-", result.ReferenceNumber);

            // Verify journal entry was created
            var journalEntry = await _context.JournalEntries
                .Include(je => je.JournalEntryLines)
                .FirstOrDefaultAsync(je => je.ReferenceNumber == result.ReferenceNumber);

            Assert.NotNull(journalEntry);
            Assert.Equal(JournalType.CashPayment, journalEntry.JournalType);
            Assert.Equal(request.Date.Date, journalEntry.TransactionDate.Date);
            Assert.Equal(request.Particulars, journalEntry.Description);

            // Verify single journal entry line was created
            Assert.Single(journalEntry.JournalEntryLines);
            var line = journalEntry.JournalEntryLines.First();
            Assert.Equal(request.Amount, line.Debit);
            Assert.Equal(0, line.Credit);
        }

        [Fact]
        public async Task SaveCreditTransactionAsync_NewCategory_CreatesCategoryAutomatically()
        {
            // Arrange
            var request = new CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Consulting Fees", // New category
                Particulars = "Professional services",
                Amount = 2500.00m,
                ContactName = "XYZ Corp"
            };

            // Act
            var result = await _service.SaveCreditTransactionAsync(request);

            // Assert
            Assert.True(result.Success);

            // Verify new category was created
            var newCategory = await _context.Categories
                .FirstOrDefaultAsync(c => c.Name == "Consulting Fees");

            Assert.NotNull(newCategory);
            Assert.Equal(CategoryType.Credit, newCategory.Type);
            Assert.True(newCategory.IsActive);
        }

        [Fact]
        public async Task SaveDebitTransactionAsync_NewSupplier_CreatesContactAutomatically()
        {
            // Arrange
            var request = new DebitTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Marketing Expenses",
                Particulars = "Digital advertising",
                Amount = 500.00m,
                SupplierName = "Google Ads" // New supplier
            };

            // Act
            var result = await _service.SaveDebitTransactionAsync(request);

            // Assert
            Assert.True(result.Success);

            // Verify new contact was created
            var newContact = await _context.Contacts
                .FirstOrDefaultAsync(c => c.Name == "Google Ads");

            Assert.NotNull(newContact);
            Assert.Equal(ContactType.Supplier, newContact.ContactType);
            Assert.True(newContact.IsActive);
        }

        [Fact]
        public async Task GetRecentTransactionsAsync_ReturnsCorrectData()
        {
            // Arrange - Create some test transactions
            var creditRequest = new CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Sales Revenue",
                Particulars = "Payment from customer",
                Amount = 1000.00m,
                ContactName = "ABC Company"
            };

            var debitRequest = new DebitTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Office Supplies",
                Particulars = "Purchase of stationery",
                Amount = 150.00m,
                SupplierName = "Office Depot"
            };

            await _service.SaveCreditTransactionAsync(creditRequest);
            await _service.SaveDebitTransactionAsync(debitRequest);

            // Act
            var result = await _service.GetRecentTransactionsAsync(10);

            // Assert
            Assert.True(result.Success);
            Assert.Equal(2, result.TotalCount);
            Assert.Equal(1000.00m, result.TotalCredits);
            Assert.Equal(150.00m, result.TotalDebits);
            Assert.Equal(2, result.Transactions.Count);
        }

        [Fact]
        public async Task SaveCreditTransactionAsync_InvalidAmount_ReturnsError()
        {
            // Arrange
            var request = new CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Sales Revenue",
                Particulars = "Test transaction",
                Amount = 0, // Invalid amount
                ContactName = "Test Contact"
            };

            // Act
            var result = await _service.SaveCreditTransactionAsync(request);

            // Assert
            Assert.False(result.Success);
            Assert.Contains("Amount must be greater than 0", result.Message);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
