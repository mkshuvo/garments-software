using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.DTOs;
using Xunit;

namespace GarmentsERP.API.Tests
{
    public class SingleTransactionDTOsTests
    {
        [Fact]
        public void CreditTransactionDto_ValidData_ShouldPassValidation()
        {
            // Arrange
            var dto = new CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Sales Revenue",
                Particulars = "Payment from customer",
                Amount = 1000.00m,
                ContactName = "ABC Company"
            };

            // Act
            var validationResults = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(dto, new ValidationContext(dto), validationResults, true);

            // Assert
            Assert.True(isValid);
            Assert.Empty(validationResults);
        }

        [Fact]
        public void CreditTransactionDto_InvalidData_ShouldFailValidation()
        {
            // Arrange
            var dto = new CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "", // Required field empty
                Particulars = "", // Required field empty
                Amount = 0, // Invalid amount
                ContactName = "ABC Company"
            };

            // Act
            var validationResults = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(dto, new ValidationContext(dto), validationResults, true);

            // Assert
            Assert.False(isValid);
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("CategoryName"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Particulars"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Amount"));
        }

        [Fact]
        public void DebitTransactionDto_ValidData_ShouldPassValidation()
        {
            // Arrange
            var dto = new DebitTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Office Supplies",
                Particulars = "Purchase of stationery",
                Amount = 150.00m,
                SupplierName = "Office Depot"
            };

            // Act
            var validationResults = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(dto, new ValidationContext(dto), validationResults, true);

            // Assert
            Assert.True(isValid);
            Assert.Empty(validationResults);
        }

        [Fact]
        public void DebitTransactionDto_InvalidData_ShouldFailValidation()
        {
            // Arrange
            var dto = new DebitTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "", // Required field empty
                Particulars = "", // Required field empty
                Amount = -100, // Invalid amount
                SupplierName = "Office Depot"
            };

            // Act
            var validationResults = new List<ValidationResult>();
            var isValid = Validator.TryValidateObject(dto, new ValidationContext(dto), validationResults, true);

            // Assert
            Assert.False(isValid);
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("CategoryName"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Particulars"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Amount"));
        }

        [Fact]
        public void SingleTransactionResult_SuccessResult_ShouldCreateValidResult()
        {
            // Arrange
            var journalEntryId = Guid.NewGuid();
            var referenceNumber = "CB-2024-01-15-001";

            // Act
            var result = SingleTransactionResult.SuccessResult(
                journalEntryId, 
                referenceNumber, 
                "Transaction saved successfully",
                1, // categoriesCreated
                1  // contactsCreated
            );

            // Assert
            Assert.True(result.Success);
            Assert.Equal("Transaction saved successfully", result.Message);
            Assert.Equal(journalEntryId, result.JournalEntryId);
            Assert.Equal(referenceNumber, result.ReferenceNumber);
            Assert.Equal(1, result.CategoriesCreated);
            Assert.Equal(1, result.ContactsCreated);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public void SingleTransactionResult_FailedResult_ShouldCreateValidResult()
        {
            // Arrange
            var errors = new List<string> { "Category not found", "Invalid amount" };

            // Act
            var result = SingleTransactionResult.FailedResult("Validation failed", errors);

            // Assert
            Assert.False(result.Success);
            Assert.Equal("Validation failed", result.Message);
            Assert.Equal(Guid.Empty, result.JournalEntryId);
            Assert.Empty(result.ReferenceNumber);
            Assert.Equal(0, result.CategoriesCreated);
            Assert.Equal(0, result.ContactsCreated);
            Assert.Equal(errors, result.Errors);
        }

        [Fact]
        public void SavedTransactionDto_ShouldHaveCorrectProperties()
        {
            // Arrange & Act
            var dto = new SavedTransactionDto
            {
                Id = Guid.NewGuid(),
                Type = "Credit",
                Date = DateTime.Now,
                CategoryName = "Sales Revenue",
                Particulars = "Payment from customer",
                Amount = 1000.00m,
                ReferenceNumber = "CB-2024-01-15-001",
                ContactName = "ABC Company",
                CreatedAt = DateTime.Now
            };

            // Assert
            Assert.NotEqual(Guid.Empty, dto.Id);
            Assert.Equal("Credit", dto.Type);
            Assert.Equal("Sales Revenue", dto.CategoryName);
            Assert.Equal("Payment from customer", dto.Particulars);
            Assert.Equal(1000.00m, dto.Amount);
            Assert.Equal("CB-2024-01-15-001", dto.ReferenceNumber);
            Assert.Equal("ABC Company", dto.ContactName);
        }

        [Fact]
        public void RecentTransactionsResponse_ShouldHaveCorrectProperties()
        {
            // Arrange
            var transactions = new List<SavedTransactionDto>
            {
                new SavedTransactionDto
                {
                    Id = Guid.NewGuid(),
                    Type = "Credit",
                    Amount = 1000.00m,
                    Date = DateTime.Now
                },
                new SavedTransactionDto
                {
                    Id = Guid.NewGuid(),
                    Type = "Debit",
                    Amount = 500.00m,
                    Date = DateTime.Now
                }
            };

            // Act
            var response = new RecentTransactionsResponse
            {
                Success = true,
                Message = "Transactions retrieved successfully",
                Transactions = transactions,
                TotalCount = 2,
                TotalCredits = 1000.00m,
                TotalDebits = 500.00m
            };

            // Assert
            Assert.True(response.Success);
            Assert.Equal("Transactions retrieved successfully", response.Message);
            Assert.Equal(2, response.Transactions.Count);
            Assert.Equal(2, response.TotalCount);
            Assert.Equal(1000.00m, response.TotalCredits);
            Assert.Equal(500.00m, response.TotalDebits);
        }
    }
}
