using Xunit;
using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Tests
{
    public class TrialBalanceControllerIntegrationTests
    {

        [Fact]
        public void TrialBalanceRequestDto_IsValid_WithValidDateRange_ReturnsTrue()
        {
            // Arrange
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.Now.AddDays(-30),
                EndDate = DateTime.Now,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var isValid = request.IsValid();

            // Assert
            Assert.True(isValid);
        }

        [Fact]
        public void TrialBalanceRequestDto_IsValid_WithInvalidDateRange_ReturnsFalse()
        {
            // Arrange
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddDays(-30), // End date before start date
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var isValid = request.IsValid();

            // Assert
            Assert.False(isValid);
        }

        [Fact]
        public void TrialBalanceRequestDto_GetValidationErrors_WithInvalidDateRange_ReturnsErrors()
        {
            // Arrange
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddDays(-30), // End date before start date
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var errors = request.GetValidationErrors();

            // Assert
            Assert.Contains("Start date must not be later than end date", errors);
        }

        [Fact]
        public void TrialBalanceRequestDto_GetValidationErrors_WithLargeDateRange_ReturnsErrors()
        {
            // Arrange
            var request = new TrialBalanceRequestDto
            {
                StartDate = DateTime.Now.AddDays(-400), // More than 365 days
                EndDate = DateTime.Now,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var errors = request.GetValidationErrors();

            // Assert
            Assert.Contains("Date range cannot exceed 365 days for performance reasons", errors);
        }

        [Fact]
        public void TrialBalanceRequestDto_GetValidationErrors_WithDefaultDates_ReturnsErrors()
        {
            // Arrange
            var request = new TrialBalanceRequestDto
            {
                StartDate = default,
                EndDate = default,
                GroupByCategory = true,
                IncludeZeroBalances = false
            };

            // Act
            var errors = request.GetValidationErrors();

            // Assert
            Assert.Contains("Start date is required", errors);
            Assert.Contains("End date is required", errors);
        }
    }
}