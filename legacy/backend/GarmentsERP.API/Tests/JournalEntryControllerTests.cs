using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using GarmentsERP.API.Controllers;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Tests
{
    public class JournalEntryControllerTests
    {
        private readonly Mock<IJournalEntryService> _mockJournalEntryService;
        private readonly Mock<ILogger<JournalEntryController>> _mockLogger;
        private readonly JournalEntryController _controller;

        public JournalEntryControllerTests()
        {
            _mockJournalEntryService = new Mock<IJournalEntryService>();
            _mockLogger = new Mock<ILogger<JournalEntryController>>();
            _controller = new JournalEntryController(_mockJournalEntryService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetJournalEntries_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new GetJournalEntriesRequest
            {
                Page = 1,
                Limit = 20,
                SortBy = "TransactionDate",
                SortOrder = "desc"
            };

            var mockResponse = new GetJournalEntriesResponse
            {
                Success = true,
                Entries = new List<JournalEntryDisplayDto>
                {
                    new JournalEntryDisplayDto
                    {
                        Id = "1",
                        JournalNumber = "JE-2024-01-0001",
                        TransactionDate = DateTime.Now,
                        Type = "Credit",
                        CategoryName = "Sales",
                        Particulars = "Test transaction",
                        Amount = 1000,
                        ReferenceNumber = "REF001",
                        ContactName = "Test Customer",
                        AccountName = "Sales Account",
                        Status = "Posted",
                        TransactionStatus = "Posted",
                        CreatedAt = DateTime.Now,
                        CreatedBy = "System",
                        JournalType = "General"
                    }
                },
                Pagination = new PaginationInfo
                {
                    CurrentPage = 1,
                    TotalPages = 1,
                    TotalEntries = 1,
                    PageSize = 20
                },
                Summary = new SummaryInfo
                {
                    TotalEntries = 1,
                    TotalDebits = 0,
                    TotalCredits = 1000,
                    Balance = -1000,
                    CreditEntries = 1,
                    DebitEntries = 0,
                    EntriesByStatus = new Dictionary<string, int> { { "Posted", 1 } },
                    EntriesByType = new Dictionary<string, int> { { "Credit", 1 } }
                }
            };

            _mockJournalEntryService
                .Setup(x => x.GetJournalEntriesAsync(It.IsAny<GetJournalEntriesRequest>()))
                .ReturnsAsync(mockResponse);

            // Act
            var result = await _controller.GetJournalEntries(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<GetJournalEntriesResponse>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Entries);
            Assert.Equal("JE-2024-01-0001", response.Entries.First().JournalNumber);
        }

        [Fact]
        public async Task GetJournalEntries_WithServiceException_ReturnsInternalServerError()
        {
            // Arrange
            var request = new GetJournalEntriesRequest
            {
                Page = 1,
                Limit = 20
            };

            _mockJournalEntryService
                .Setup(x => x.GetJournalEntriesAsync(It.IsAny<GetJournalEntriesRequest>()))
                .ThrowsAsync(new Exception("Service error"));

            // Act
            var result = await _controller.GetJournalEntries(request);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        [Fact]
        public async Task GetJournalEntryById_WithValidId_ReturnsOkResult()
        {
            // Arrange
            var id = Guid.NewGuid();
            var mockEntry = new JournalEntryDetailDto
            {
                Id = id.ToString(),
                JournalNumber = "JE-2024-01-0001",
                TransactionDate = DateTime.Now,
                JournalType = "General",
                ReferenceNumber = "REF001",
                Description = "Test transaction",
                TotalDebit = 0,
                TotalCredit = 1000,
                Status = "Posted",
                TransactionStatus = "Posted",
                CreatedAt = DateTime.Now,
                CreatedBy = "System",
                Lines = new List<JournalEntryLineDetailDto>(),
                AuditTrail = new List<AuditTrailEntryDto>()
            };

            _mockJournalEntryService
                .Setup(x => x.GetJournalEntryByIdAsync(id))
                .ReturnsAsync(mockEntry);

            // Act
            var result = await _controller.GetJournalEntryById(id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(id.ToString(), response.Data.Id);
        }

        [Fact]
        public async Task GetJournalEntryById_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var id = Guid.NewGuid();

            _mockJournalEntryService
                .Setup(x => x.GetJournalEntryByIdAsync(id))
                .ReturnsAsync((JournalEntryDetailDto?)null);

            // Act
            var result = await _controller.GetJournalEntryById(id);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = notFoundResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.Equal("Journal entry not found", response.Message);
        }

        [Fact]
        public async Task GetStatistics_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new JournalEntryStatisticsRequest
            {
                DateFrom = DateTime.Now.AddDays(-30),
                DateTo = DateTime.Now
            };

            var mockStats = new JournalEntryStatisticsResponse
            {
                Success = true,
                TotalEntries = 100,
                TotalDebits = 50000,
                TotalCredits = 45000,
                Balance = 5000,
                AverageEntryAmount = 950,
                LargestEntry = 5000,
                EntriesByType = new Dictionary<string, int> { { "Credit", 50 }, { "Debit", 50 } },
                EntriesByStatus = new Dictionary<string, int> { { "Posted", 100 } },
                EntriesByMonth = new List<MonthlyStatistics>()
            };

            _mockJournalEntryService
                .Setup(x => x.GetStatisticsAsync(It.IsAny<JournalEntryStatisticsRequest>()))
                .ReturnsAsync(mockStats);

            // Act
            var result = await _controller.GetStatistics(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<JournalEntryStatisticsResponse>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(100, response.TotalEntries);
        }

        [Fact]
        public async Task ExportJournalEntries_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var request = new ExportJournalEntriesRequest
            {
                Format = "csv",
                Filters = new GetJournalEntriesRequest
                {
                    Page = 1,
                    Limit = 1000
                }
            };

            var mockExportResponse = new ExportJournalEntriesResponse
            {
                Success = true,
                FileName = "journal-entries-2024-01-01.csv",
                DownloadUrl = "/api/exports/journal-entries-2024-01-01.csv",
                ExportedRecords = 50
            };

            _mockJournalEntryService
                .Setup(x => x.ExportJournalEntriesAsync(It.IsAny<ExportJournalEntriesRequest>()))
                .ReturnsAsync(mockExportResponse);

            // Act
            var result = await _controller.ExportJournalEntries(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ExportJournalEntriesResponse>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal("journal-entries-2024-01-01.csv", response.FileName);
        }

        [Fact]
        public async Task CreateJournalEntry_WithValidRequest_ReturnsCreatedResult()
        {
            // Arrange
            var request = new CreateJournalEntryRequest
            {
                TransactionDate = DateTime.Now,
                JournalType = "General",
                ReferenceNumber = "REF001",
                Description = "Test transaction",
                Lines = new List<JournalEntryLineRequest>
                {
                    new JournalEntryLineRequest
                    {
                        AccountId = Guid.NewGuid(),
                        Credit = 1000,
                        Debit = 0,
                        Description = "Test line",
                        LineOrder = 1
                    },
                    new JournalEntryLineRequest
                    {
                        AccountId = Guid.NewGuid(),
                        Credit = 0,
                        Debit = 1000,
                        Description = "Test line 2",
                        LineOrder = 2
                    }
                }
            };

            var mockCreatedEntry = new JournalEntryDetailDto
            {
                Id = Guid.NewGuid().ToString(),
                JournalNumber = "JE-2024-01-0001",
                TransactionDate = request.TransactionDate,
                JournalType = request.JournalType,
                ReferenceNumber = request.ReferenceNumber,
                Description = request.Description,
                TotalDebit = 1000,
                TotalCredit = 1000,
                Status = "Draft",
                TransactionStatus = "Draft",
                CreatedAt = DateTime.Now,
                CreatedBy = "System",
                Lines = new List<JournalEntryLineDetailDto>(),
                AuditTrail = new List<AuditTrailEntryDto>()
            };

            _mockJournalEntryService
                .Setup(x => x.CreateJournalEntryAsync(It.IsAny<CreateJournalEntryRequest>()))
                .ReturnsAsync(mockCreatedEntry);

            // Act
            var result = await _controller.CreateJournalEntry(request);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal("GetJournalEntryById", createdResult.ActionName);
            Assert.Equal(mockCreatedEntry.Id, createdResult.RouteValues?["id"]);
        }

        [Fact]
        public async Task CreateJournalEntry_WithInvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var request = new CreateJournalEntryRequest
            {
                // Missing required fields
            };

            _controller.ModelState.AddModelError("TransactionDate", "Transaction date is required");

            // Act
            var result = await _controller.CreateJournalEntry(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task UpdateJournalEntry_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var id = Guid.NewGuid();
            var request = new UpdateJournalEntryRequest
            {
                Description = "Updated description"
            };

            var mockUpdatedEntry = new JournalEntryDetailDto
            {
                Id = id.ToString(),
                JournalNumber = "JE-2024-01-0001",
                TransactionDate = DateTime.Now,
                JournalType = "General",
                ReferenceNumber = "REF001",
                Description = "Updated description",
                TotalDebit = 1000,
                TotalCredit = 1000,
                Status = "Draft",
                TransactionStatus = "Draft",
                CreatedAt = DateTime.Now,
                CreatedBy = "System",
                Lines = new List<JournalEntryLineDetailDto>(),
                AuditTrail = new List<AuditTrailEntryDto>()
            };

            _mockJournalEntryService
                .Setup(x => x.UpdateJournalEntryAsync(id, It.IsAny<UpdateJournalEntryRequest>()))
                .ReturnsAsync(mockUpdatedEntry);

            // Act
            var result = await _controller.UpdateJournalEntry(id, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal("Updated description", response.Data.Description);
        }

        [Fact]
        public async Task DeleteJournalEntry_WithValidId_ReturnsOkResult()
        {
            // Arrange
            var id = Guid.NewGuid();

            _mockJournalEntryService
                .Setup(x => x.DeleteJournalEntryAsync(id))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteJournalEntry(id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.Equal("Journal entry deleted successfully", response.Message);
        }

        [Fact]
        public async Task DeleteJournalEntry_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var id = Guid.NewGuid();

            _mockJournalEntryService
                .Setup(x => x.DeleteJournalEntryAsync(id))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteJournalEntry(id);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = notFoundResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.Equal("Journal entry not found", response.Message);
        }

        [Fact]
        public async Task ApproveJournalEntry_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var id = Guid.NewGuid();
            var request = new ApprovalRequest
            {
                Notes = "Approved for posting"
            };

            _mockJournalEntryService
                .Setup(x => x.ApproveJournalEntryAsync(id, It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ApproveJournalEntry(id, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.Equal("Journal entry approved successfully", response.Message);
        }

        [Fact]
        public async Task ReverseJournalEntry_WithValidRequest_ReturnsOkResult()
        {
            // Arrange
            var id = Guid.NewGuid();
            var request = new ReversalRequest
            {
                Reason = "Incorrect amount"
            };

            _mockJournalEntryService
                .Setup(x => x.ReverseJournalEntryAsync(id, It.IsAny<Guid>(), It.IsAny<string>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.ReverseJournalEntry(id, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.Equal("Journal entry reversed successfully", response.Message);
        }

        [Fact]
        public async Task ReverseJournalEntry_WithEmptyReason_ReturnsBadRequest()
        {
            // Arrange
            var id = Guid.NewGuid();
            var request = new ReversalRequest
            {
                Reason = ""
            };

            // Act
            var result = await _controller.ReverseJournalEntry(id, request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = badRequestResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.False(response.Success);
            Assert.Equal("Reversal reason is required", response.Message);
        }

        [Fact]
        public async Task GetCategories_ReturnsOkResult()
        {
            // Arrange
            var mockCategories = new List<string> { "Sales", "Expenses", "Assets" };

            _mockJournalEntryService
                .Setup(x => x.GetCategoriesAsync())
                .ReturnsAsync(mockCategories);

            // Act
            var result = await _controller.GetCategories();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(3, response.Data.Count);
        }

        [Fact]
        public async Task GetStatuses_ReturnsOkResult()
        {
            // Arrange
            var mockStatuses = new List<string> { "Draft", "Posted", "Approved", "Reversed" };

            _mockJournalEntryService
                .Setup(x => x.GetStatusesAsync())
                .ReturnsAsync(mockStatuses);

            // Act
            var result = await _controller.GetStatuses();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(4, response.Data.Count);
        }

        [Fact]
        public async Task GetTypes_ReturnsOkResult()
        {
            // Arrange
            var mockTypes = new List<string> { "General", "Sales", "Purchase", "Payment" };

            _mockJournalEntryService
                .Setup(x => x.GetTypesAsync())
                .ReturnsAsync(mockTypes);

            // Act
            var result = await _controller.GetTypes();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value as dynamic;
            Assert.NotNull(response);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(4, response.Data.Count);
        }
    }
}

