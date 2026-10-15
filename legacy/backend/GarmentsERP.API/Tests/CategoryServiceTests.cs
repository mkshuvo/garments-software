using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using GarmentsERP.API.Data;
using GarmentsERP.API.Services;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Tests
{
    public class CategoryServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<CategoryService>> _mockLogger;
        private readonly CategoryService _service;

        public CategoryServiceTests()
        {
            // Create in-memory database for testing
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _mockLogger = new Mock<ILogger<CategoryService>>();
            _service = new CategoryService(_context, _mockLogger.Object);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        #region Read Operations Tests

        [Fact]
        public async Task GetAllCategoriesAsync_ReturnsOnlyActiveCategories()
        {
            // Arrange
            var activeCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Active Category",
                Type = CategoryType.Credit,
                IsActive = true
            };

            var inactiveCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Inactive Category",
                Type = CategoryType.Debit,
                IsActive = false
            };

            _context.Categories.AddRange(activeCategory, inactiveCategory);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetAllCategoriesAsync();

            // Assert
            Assert.Single(result);
            Assert.Equal("Active Category", result.First().Name);
            Assert.True(result.First().IsActive);
        }

        [Fact]
        public async Task GetAllCategoriesAsync_ReturnsOrderedByTypeAndName()
        {
            // Arrange
            var categories = new[]
            {
                new Category { Id = Guid.NewGuid(), Name = "Z Category", Type = CategoryType.Credit, IsActive = true },
                new Category { Id = Guid.NewGuid(), Name = "A Category", Type = CategoryType.Debit, IsActive = true },
                new Category { Id = Guid.NewGuid(), Name = "B Category", Type = CategoryType.Credit, IsActive = true }
            };

            _context.Categories.AddRange(categories);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetAllCategoriesAsync();
            var resultList = result.ToList();

            // Assert
            Assert.Equal(3, resultList.Count);
            // Credit categories should come first (Type = 0), then Debit (Type = 1)
            Assert.Equal(CategoryType.Credit, resultList[0].Type);
            Assert.Equal("B Category", resultList[0].Name);
            Assert.Equal(CategoryType.Credit, resultList[1].Type);
            Assert.Equal("Z Category", resultList[1].Name);
            Assert.Equal(CategoryType.Debit, resultList[2].Type);
            Assert.Equal("A Category", resultList[2].Name);
        }

        [Fact]
        public async Task GetCategoriesByTypeAsync_ReturnsOnlySpecifiedType()
        {
            // Arrange
            var creditCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Credit Category",
                Type = CategoryType.Credit,
                IsActive = true
            };

            var debitCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Debit Category",
                Type = CategoryType.Debit,
                IsActive = true
            };

            _context.Categories.AddRange(creditCategory, debitCategory);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetCategoriesByTypeAsync(CategoryType.Credit);

            // Assert
            Assert.Single(result);
            Assert.Equal("Credit Category", result.First().Name);
            Assert.Equal(CategoryType.Credit, result.First().Type);
        }

        [Fact]
        public async Task GetCategoryByIdAsync_ExistingId_ReturnsCategory()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var category = new Category
            {
                Id = categoryId,
                Name = "Test Category",
                Description = "Test Description",
                Type = CategoryType.Credit,
                IsActive = true,
                CreatedBy = "testuser"
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.GetCategoryByIdAsync(categoryId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(categoryId, result.Id);
            Assert.Equal("Test Category", result.Name);
            Assert.Equal("Test Description", result.Description);
            Assert.Equal(CategoryType.Credit, result.Type);
            Assert.Equal("Credit", result.TypeName);
            Assert.Equal("testuser", result.CreatedBy);
        }

        [Fact]
        public async Task GetCategoryByIdAsync_NonExistingId_ReturnsNull()
        {
            // Arrange
            var nonExistingId = Guid.NewGuid();

            // Act
            var result = await _service.GetCategoryByIdAsync(nonExistingId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task SearchCategoriesAsync_EmptySearchTerm_ReturnsAllCategories()
        {
            // Arrange
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Test Category",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.SearchCategoriesAsync("");

            // Assert
            Assert.Single(result);
            Assert.Equal("Test Category", result.First().Name);
        }

        [Fact]
        public async Task SearchCategoriesAsync_MatchingName_ReturnsMatchingCategories()
        {
            // Arrange
            var categories = new[]
            {
                new Category { Id = Guid.NewGuid(), Name = "Fabric Purchase", Type = CategoryType.Debit, IsActive = true },
                new Category { Id = Guid.NewGuid(), Name = "Electric Bill", Type = CategoryType.Debit, IsActive = true },
                new Category { Id = Guid.NewGuid(), Name = "Received: Urbo ltd", Type = CategoryType.Credit, IsActive = true }
            };

            _context.Categories.AddRange(categories);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.SearchCategoriesAsync("fabric");

            // Assert
            Assert.Single(result);
            Assert.Equal("Fabric Purchase", result.First().Name);
        }

        [Fact]
        public async Task SearchCategoriesAsync_MatchingDescription_ReturnsMatchingCategories()
        {
            // Arrange
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Test Category",
                Description = "This is for fabric purchases",
                Type = CategoryType.Debit,
                IsActive = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.SearchCategoriesAsync("fabric");

            // Assert
            Assert.Single(result);
            Assert.Equal("Test Category", result.First().Name);
        }

        [Fact]
        public async Task SearchCategoriesAsync_CaseInsensitive_ReturnsMatchingCategories()
        {
            // Arrange
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "FABRIC PURCHASE",
                Type = CategoryType.Debit,
                IsActive = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.SearchCategoriesAsync("fabric");

            // Assert
            Assert.Single(result);
            Assert.Equal("FABRIC PURCHASE", result.First().Name);
        }

        #endregion

        #region Write Operations Tests

        [Fact]
        public async Task CreateCategoryAsync_ValidRequest_CreatesCategory()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Name = "New Category",
                Description = "New Description",
                Type = CategoryType.Credit
            };

            // Act
            var result = await _service.CreateCategoryAsync(request, "testuser");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Category", result.Name);
            Assert.Equal("New Description", result.Description);
            Assert.Equal(CategoryType.Credit, result.Type);
            Assert.Equal("Credit", result.TypeName);
            Assert.True(result.IsActive);
            Assert.Equal("testuser", result.CreatedBy);
            Assert.Equal(0, result.UsageCount);

            // Verify in database
            var categoryInDb = await _context.Categories.FirstOrDefaultAsync(c => c.Id == result.Id);
            Assert.NotNull(categoryInDb);
            Assert.Equal("New Category", categoryInDb.Name);
        }

        [Fact]
        public async Task CreateCategoryAsync_DuplicateName_ThrowsInvalidOperationException()
        {
            // Arrange
            var existingCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Existing Category",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(existingCategory);
            await _context.SaveChangesAsync();

            var request = new CreateCategoryRequest
            {
                Name = "Existing Category",
                Type = CategoryType.Credit
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.CreateCategoryAsync(request));

            Assert.Contains("already exists", exception.Message);
        }

        [Fact]
        public async Task CreateCategoryAsync_SameNameDifferentType_CreatesSuccessfully()
        {
            // Arrange
            var existingCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Same Name",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(existingCategory);
            await _context.SaveChangesAsync();

            var request = new CreateCategoryRequest
            {
                Name = "Same Name",
                Type = CategoryType.Debit
            };

            // Act
            var result = await _service.CreateCategoryAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Same Name", result.Name);
            Assert.Equal(CategoryType.Debit, result.Type);
        }

        [Fact]
        public async Task UpdateCategoryAsync_ValidRequest_UpdatesCategory()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var category = new Category
            {
                Id = categoryId,
                Name = "Original Name",
                Description = "Original Description",
                Type = CategoryType.Credit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            var request = new UpdateCategoryRequest
            {
                Name = "Updated Name",
                Description = "Updated Description",
                IsActive = false
            };

            // Act
            var result = await _service.UpdateCategoryAsync(categoryId, request, "updateuser");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Name", result.Name);
            Assert.Equal("Updated Description", result.Description);
            Assert.False(result.IsActive);
            Assert.Equal("updateuser", result.UpdatedBy);
            Assert.NotNull(result.UpdatedAt);

            // Verify in database
            var categoryInDb = await _context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
            Assert.NotNull(categoryInDb);
            Assert.Equal("Updated Name", categoryInDb.Name);
            Assert.False(categoryInDb.IsActive);
        }

        [Fact]
        public async Task UpdateCategoryAsync_NonExistingId_ThrowsArgumentException()
        {
            // Arrange
            var nonExistingId = Guid.NewGuid();
            var request = new UpdateCategoryRequest
            {
                Name = "Updated Name"
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(
                () => _service.UpdateCategoryAsync(nonExistingId, request));

            Assert.Contains("not found", exception.Message);
        }

        [Fact]
        public async Task UpdateCategoryAsync_DuplicateName_ThrowsInvalidOperationException()
        {
            // Arrange
            var category1Id = Guid.NewGuid();
            var category2Id = Guid.NewGuid();

            var categories = new[]
            {
                new Category { Id = category1Id, Name = "Category 1", Type = CategoryType.Credit, IsActive = true },
                new Category { Id = category2Id, Name = "Category 2", Type = CategoryType.Credit, IsActive = true }
            };

            _context.Categories.AddRange(categories);
            await _context.SaveChangesAsync();

            var request = new UpdateCategoryRequest
            {
                Name = "Category 1" // Trying to use existing name
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.UpdateCategoryAsync(category2Id, request));

            Assert.Contains("already exists", exception.Message);
        }

        [Fact]
        public async Task DeleteCategoryAsync_ExistingCategory_SoftDeletesCategory()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var category = new Category
            {
                Id = categoryId,
                Name = "Category to Delete",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.DeleteCategoryAsync(categoryId);

            // Assert
            Assert.True(result);

            // Verify soft delete in database
            var categoryInDb = await _context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
            Assert.NotNull(categoryInDb);
            Assert.False(categoryInDb.IsActive);
            Assert.NotNull(categoryInDb.UpdatedAt);
        }

        [Fact]
        public async Task DeleteCategoryAsync_NonExistingId_ReturnsFalse()
        {
            // Arrange
            var nonExistingId = Guid.NewGuid();

            // Act
            var result = await _service.DeleteCategoryAsync(nonExistingId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task ToggleActiveStatusAsync_ExistingCategory_TogglesStatus()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var category = new Category
            {
                Id = categoryId,
                Name = "Test Category",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.ToggleActiveStatusAsync(categoryId, "testuser");

            // Assert
            Assert.NotNull(result);
            Assert.False(result.IsActive);
            Assert.Equal("testuser", result.UpdatedBy);
            Assert.NotNull(result.UpdatedAt);

            // Verify in database
            var categoryInDb = await _context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
            Assert.NotNull(categoryInDb);
            Assert.False(categoryInDb.IsActive);
        }

        [Fact]
        public async Task ToggleActiveStatusAsync_NonExistingId_ThrowsArgumentException()
        {
            // Arrange
            var nonExistingId = Guid.NewGuid();

            // Act & Assert
            var exception = await Assert.ThrowsAsync<ArgumentException>(
                () => _service.ToggleActiveStatusAsync(nonExistingId));

            Assert.Contains("not found", exception.Message);
        }

        #endregion

        #region Business Logic Tests

        [Fact]
        public async Task IsCategoryNameUniqueAsync_UniqueName_ReturnsTrue()
        {
            // Arrange
            var existingCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Existing Category",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(existingCategory);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.IsCategoryNameUniqueAsync("New Category", CategoryType.Credit);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsCategoryNameUniqueAsync_DuplicateName_ReturnsFalse()
        {
            // Arrange
            var existingCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Existing Category",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(existingCategory);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.IsCategoryNameUniqueAsync("Existing Category", CategoryType.Credit);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task IsCategoryNameUniqueAsync_SameNameDifferentType_ReturnsTrue()
        {
            // Arrange
            var existingCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Same Name",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(existingCategory);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.IsCategoryNameUniqueAsync("Same Name", CategoryType.Debit);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsCategoryNameUniqueAsync_WithExcludeId_ExcludesSpecifiedCategory()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var existingCategory = new Category
            {
                Id = categoryId,
                Name = "Existing Category",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(existingCategory);
            await _context.SaveChangesAsync();

            // Act - Should return true because we're excluding the existing category
            var result = await _service.IsCategoryNameUniqueAsync("Existing Category", CategoryType.Credit, categoryId);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task IsCategoryNameUniqueAsync_CaseInsensitive_ReturnsFalse()
        {
            // Arrange
            var existingCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "EXISTING CATEGORY",
                Type = CategoryType.Credit,
                IsActive = true
            };

            _context.Categories.Add(existingCategory);
            await _context.SaveChangesAsync();

            // Act
            var result = await _service.IsCategoryNameUniqueAsync("existing category", CategoryType.Credit);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task IsCategoryUsedInTransactionsAsync_CurrentImplementation_ReturnsFalse()
        {
            // Arrange
            var categoryId = Guid.NewGuid();

            // Act
            var result = await _service.IsCategoryUsedInTransactionsAsync(categoryId);

            // Assert
            // Current implementation returns false as no transaction tables reference categories yet
            Assert.False(result);
        }

        [Fact]
        public async Task GetCategoryUsageCountAsync_CurrentImplementation_ReturnsZero()
        {
            // Arrange
            var categoryId = Guid.NewGuid();

            // Act
            var result = await _service.GetCategoryUsageCountAsync(categoryId);

            // Assert
            // Current implementation returns 0 as no transaction tables reference categories yet
            Assert.Equal(0, result);
        }

        #endregion

        #region Error Handling Tests

        [Fact]
        public async Task CreateCategoryAsync_DatabaseError_ThrowsException()
        {
            // Arrange
            _context.Dispose(); // Dispose context to simulate database error

            var request = new CreateCategoryRequest
            {
                Name = "Test Category",
                Type = CategoryType.Credit
            };

            // Act & Assert
            await Assert.ThrowsAsync<ObjectDisposedException>(
                () => _service.CreateCategoryAsync(request));
        }

        [Fact]
        public async Task GetAllCategoriesAsync_DatabaseError_ThrowsException()
        {
            // Arrange
            _context.Dispose(); // Dispose context to simulate database error

            // Act & Assert
            await Assert.ThrowsAsync<ObjectDisposedException>(
                () => _service.GetAllCategoriesAsync());
        }

        #endregion
    }
}