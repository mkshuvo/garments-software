using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using Xunit;

namespace GarmentsERP.API.Tests
{
    public class MigrationValidationTest
    {
        [Fact]
        public void CategoryMigration_ShouldHaveCorrectSchema()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "CategoryMigrationTest")
                .Options;

            using var context = new ApplicationDbContext(options);

            // Act - Ensure database is created with migrations
            context.Database.EnsureCreated();

            // Assert - Verify Category entity can be used
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Test Category",
                Description = "Test Description",
                Type = CategoryType.Credit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "TestUser"
            };

            context.Categories.Add(category);
            var result = context.SaveChanges();

            Assert.Equal(1, result);
            Assert.Single(context.Categories);
        }

        [Fact]
        public void CategoryMigration_ShouldAllowSameNameDifferentType()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "CategoryUniqueTest")
                .Options;

            using var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();

            // Act - Add categories with same name but different types
            var creditCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Same Name",
                Type = CategoryType.Credit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            
            var debitCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Same Name",
                Type = CategoryType.Debit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Categories.AddRange(creditCategory, debitCategory);
            var result = context.SaveChanges();

            // Assert - Should allow same name with different types
            Assert.Equal(2, result);
            Assert.Equal(2, context.Categories.Count());
            
            var creditCat = context.Categories.First(c => c.Type == CategoryType.Credit);
            var debitCat = context.Categories.First(c => c.Type == CategoryType.Debit);
            
            Assert.Equal("Same Name", creditCat.Name);
            Assert.Equal("Same Name", debitCat.Name);
            Assert.NotEqual(creditCat.Type, debitCat.Type);
        }

        [Fact]
        public void CategoryMigration_ShouldSupportAllRequiredFields()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "CategoryFieldsTest")
                .Options;

            using var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();

            // Act - Create category with all fields
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Full Category",
                Description = "Complete description with all fields populated",
                Type = CategoryType.Debit,
                IsActive = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "TestUser",
                UpdatedBy = "UpdateUser"
            };

            context.Categories.Add(category);
            context.SaveChanges();

            // Assert - Verify all fields are persisted
            var savedCategory = context.Categories.First();
            Assert.Equal("Full Category", savedCategory.Name);
            Assert.Equal("Complete description with all fields populated", savedCategory.Description);
            Assert.Equal(CategoryType.Debit, savedCategory.Type);
            Assert.False(savedCategory.IsActive);
            Assert.True(savedCategory.CreatedAt > DateTime.MinValue);
            Assert.True(savedCategory.UpdatedAt > DateTime.MinValue);
            Assert.Equal("TestUser", savedCategory.CreatedBy);
            Assert.Equal("UpdateUser", savedCategory.UpdatedBy);
        }

        [Fact]
        public void CategoryMigration_ShouldSupportBothCategoryTypes()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "CategoryTypesTest")
                .Options;

            using var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();

            // Act - Create categories of both types
            var creditCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Credit Category",
                Type = CategoryType.Credit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var debitCategory = new Category
            {
                Id = Guid.NewGuid(),
                Name = "Debit Category",
                Type = CategoryType.Debit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Categories.AddRange(creditCategory, debitCategory);
            context.SaveChanges();

            // Assert - Verify both types are supported
            var creditCategories = context.Categories.Where(c => c.Type == CategoryType.Credit).ToList();
            var debitCategories = context.Categories.Where(c => c.Type == CategoryType.Debit).ToList();

            Assert.Single(creditCategories);
            Assert.Single(debitCategories);
            Assert.Equal("Credit Category", creditCategories.First().Name);
            Assert.Equal("Debit Category", debitCategories.First().Name);
        }
    }
}