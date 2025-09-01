using Microsoft.AspNetCore.Mvc;
using GarmentsERP.API.Controllers;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Data;
using GarmentsERP.API.Services;
using GarmentsERP.API.Services.Interfaces;
using Moq;
using Xunit;

namespace GarmentsERP.API.Tests
{
    public class ControllerEndpointsTests
    {
        private readonly Mock<IEnhancedCashBookService> _mockService;
        private readonly CashBookEntryController _controller;

        public ControllerEndpointsTests()
        {
            _mockService = new Mock<IEnhancedCashBookService>();
            var mockContext = new Mock<ApplicationDbContext>();
            var mockJournalEntryService = new Mock<IJournalEntryService>();
            var mockDatabasePerformanceService = new Mock<IDatabasePerformanceService>();
            var mockLogger = new Mock<ILogger<CashBookEntryController>>();
            _controller = new CashBookEntryController(mockContext.Object, _mockService.Object, mockJournalEntryService.Object, mockDatabasePerformanceService.Object, mockLogger.Object);
        }

        [Fact]
        public async Task SaveIndependentCreditTransaction_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new DTOs.CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Sales Revenue",
                Particulars = "Payment from customer",
                Amount = 1000.00m,
                ContactName = "ABC Company"
            };

            var expectedResult = DTOs.SingleTransactionResult.SuccessResult(
                Guid.NewGuid(),
                "CB-20240115-12345678",
                "Credit transaction saved successfully"
            );

            _mockService.Setup(s => s.SaveCreditTransactionAsync(request))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.SaveIndependentCreditTransaction(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<DTOs.SingleTransactionResult>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedResult.ReferenceNumber, response.ReferenceNumber);
        }

        [Fact]
        public async Task SaveIndependentDebitTransaction_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new DTOs.DebitTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Office Supplies",
                Particulars = "Purchase of stationery",
                Amount = 150.00m,
                SupplierName = "Office Depot"
            };

            var expectedResult = DTOs.SingleTransactionResult.SuccessResult(
                Guid.NewGuid(),
                "CB-20240115-87654321",
                "Debit transaction saved successfully"
            );

            _mockService.Setup(s => s.SaveDebitTransactionAsync(request))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.SaveIndependentDebitTransaction(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<DTOs.SingleTransactionResult>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(expectedResult.ReferenceNumber, response.ReferenceNumber);
        }

        [Fact]
        public async Task GetRecentIndependentTransactions_ValidRequest_ReturnsOkResult()
        {
            // Arrange
            var expectedResult = new RecentTransactionsResponse
            {
                Success = true,
                Message = "Recent transactions retrieved successfully",
                Transactions = new List<SavedTransactionDto>
                {
                    new SavedTransactionDto
                    {
                        Id = Guid.NewGuid(),
                        Type = "Credit",
                        Date = DateTime.Now,
                        CategoryName = "Sales Revenue",
                        Particulars = "Payment from customer",
                        Amount = 1000.00m,
                        ReferenceNumber = "CB-20240115-12345678"
                    }
                },
                TotalCount = 1,
                TotalCredits = 1000.00m,
                TotalDebits = 0
            };

            _mockService.Setup(s => s.GetRecentTransactionsAsync(10))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetRecentIndependentTransactions(10);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<RecentTransactionsResponse>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(1, response.TotalCount);
            Assert.Equal(1000.00m, response.TotalCredits);
        }

        [Fact]
        public async Task SaveIndependentCreditTransaction_InvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var request = new DTOs.CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "", // Invalid - empty category
                Particulars = "Test",
                Amount = 0 // Invalid - zero amount
            };

            _controller.ModelState.AddModelError("CategoryName", "Category name is required");
            _controller.ModelState.AddModelError("Amount", "Amount must be greater than 0");

            // Act
            var result = await _controller.SaveIndependentCreditTransaction(request);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task SaveIndependentCreditTransaction_ServiceError_ReturnsInternalServerError()
        {
            // Arrange
            var request = new DTOs.CreditTransactionDto
            {
                Date = DateTime.Now,
                CategoryName = "Sales Revenue",
                Particulars = "Payment from customer",
                Amount = 1000.00m
            };

            _mockService.Setup(s => s.SaveCreditTransactionAsync(request))
                .ThrowsAsync(new Exception("Database connection failed"));

            // Act
            var result = await _controller.SaveIndependentCreditTransaction(request);

            // Assert
            var statusCodeResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusCodeResult.StatusCode);
        }
    }
}