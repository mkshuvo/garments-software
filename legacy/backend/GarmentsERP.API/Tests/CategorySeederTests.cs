using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using Xunit;

namespace GarmentsERP.API.Tests
{
    public class CategorySeederTests
    {
        private ApplicationDbContext GetInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task SeedCategoriesAsync_ShouldSeedCategoriesSuccessfully()
        {
            // Arrange
            using var context = GetInMemoryContext();

            // Act
            await CategorySeeder.SeedCategoriesAsync(context);

            // Assert
            var categories = await context.Categories.ToListAsync();
            Assert.NotEmpty(categories);

            // Check that we have both Credit and Debit categories
            var creditCategories = categories.Where(c => c.Type == CategoryType.Credit).ToList();
            var debitCategories = categories.Where(c => c.Type == CategoryType.Debit).ToList();

            Assert.NotEmpty(creditCategories);
            Assert.NotEmpty(debitCategories);

            // Verify specific categories exist
            Assert.Contains(categories, c => c.Name == "Received: Urbo ltd" && c.Type == CategoryType.Credit);
            Assert.Contains(categories, c => c.Name == "Fabric- Purchase" && c.Type == CategoryType.Debit);
            Assert.Contains(categories, c => c.Name == "Electric Bill" && c.Type == CategoryType.Debit);

            // Verify all categories are active and have proper audit fields
            Assert.All(categories, c =>
            {
                Assert.True(c.IsActive);
                Assert.Equal("System", c.CreatedBy);
                Assert.True(c.CreatedAt > DateTime.MinValue);
                Assert.NotEqual(Guid.Empty, c.Id);
            });
        }

        [Fact]
        public async Task SeedCategoriesAsync_ShouldNotSeedIfCategoriesExist()
        {
            // Arrange
            using var context = GetInMemoryContext();
            
            // Add a category first
            context.Categories.Add(new Category
            {
                Name = "Test Category",
                Type = CategoryType.Credit,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Test"
            });
            await context.SaveChangesAsync();

            var initialCount = await context.Categories.CountAsync();

            // Act
            await CategorySeeder.SeedCategoriesAsync(context);

            // Assert
            var finalCount = await context.Categories.CountAsync();
            Assert.Equal(initialCount, finalCount); // Should not add more categories
        }

        [Fact]
        public async Task SeedCategoriesAsync_ShouldHaveCorrectCategoryTypes()
        {
            // Arrange
            using var context = GetInMemoryContext();

            // Act
            await CategorySeeder.SeedCategoriesAsync(context);

            // Assert
            var categories = await context.Categories.ToListAsync();

            // Verify Credit categories
            var creditCategories = categories.Where(c => c.Type == CategoryType.Credit).ToList();
            var expectedCreditCategories = new[]
            {
                "Loan A/C Chairman",
                "Received: Urbo ltd",
                "Received: Brooklyn BD",
                "Received: Kafit Gallary",
                "Received: Adl"
            };

            foreach (var expectedName in expectedCreditCategories)
            {
                Assert.Contains(creditCategories, c => c.Name == expectedName);
            }

            // Verify Debit categories
            var debitCategories = categories.Where(c => c.Type == CategoryType.Debit).ToList();
            var expectedDebitCategories = new[]
            {
                "Fabric- Purchase",
                "Electric Bill",
                "Accessories Bill",
                "Salary A/C",
                "Machine- Purchase"
            };

            foreach (var expectedName in expectedDebitCategories)
            {
                Assert.Contains(debitCategories, c => c.Name == expectedName);
            }
        }
    }
}