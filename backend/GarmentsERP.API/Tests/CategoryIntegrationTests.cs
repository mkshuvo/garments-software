using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Json;
using System.Net;
using System.Text.Json;
using Xunit;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Accounting;
using GarmentsERP.API.DTOs;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace GarmentsERP.API.Tests
{
    // Test authentication handler for integration tests
    public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger, UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, "testuser"),
                new Claim(ClaimTypes.NameIdentifier, "123")
            };

            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, "Test");

            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }

    public class CategoryIntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IDisposable
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;
        private readonly JsonSerializerOptions _jsonOptions;

        public CategoryIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _factory = _factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove the existing DbContext registration
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);

                    // Add in-memory database for testing
                    services.AddDbContext<ApplicationDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid());
                    });

                    // Replace authentication with test authentication
                    services.AddAuthentication("Test")
                        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", options => { });
                });
            });

            _client = _factory.CreateClient();
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
        }

        public void Dispose()
        {
            _client?.Dispose();
        }

        #region Complete API Workflow Tests

        [Fact]
        public async Task CategoryCRUDWorkflow_CompleteLifecycle_WorksCorrectly()
        {
            // 1. Create a new category
            var createRequest = new CreateCategoryRequest
            {
                Name = "Integration Test Category",
                Description = "Created during integration test",
                Type = CategoryType.Credit
            };

            var createResponse = await _client.PostAsJsonAsync("/api/category", createRequest);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryDto>(_jsonOptions);
            Assert.NotNull(createdCategory);
            Assert.Equal("Integration Test Category", createdCategory.Name);
            Assert.Equal(CategoryType.Credit, createdCategory.Type);
            Assert.True(createdCategory.IsActive);

            // 2. Get the created category by ID
            var getResponse = await _client.GetAsync($"/api/category/{createdCategory.Id}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

            var retrievedCategory = await getResponse.Content.ReadFromJsonAsync<CategoryDto>(_jsonOptions);
            Assert.NotNull(retrievedCategory);
            Assert.Equal(createdCategory.Id, retrievedCategory.Id);
            Assert.Equal("Integration Test Category", retrievedCategory.Name);

            // 3. Update the category
            var updateRequest = new UpdateCategoryRequest
            {
                Name = "Updated Integration Test Category",
                Description = "Updated during integration test",
                IsActive = true
            };

            var updateResponse = await _client.PutAsJsonAsync($"/api/category/{createdCategory.Id}", updateRequest);
            Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

            var updatedCategory = await updateResponse.Content.ReadFromJsonAsync<CategoryDto>(_jsonOptions);
            Assert.NotNull(updatedCategory);
            Assert.Equal("Updated Integration Test Category", updatedCategory.Name);
            Assert.Equal("Updated during integration test", updatedCategory.Description);

            // 4. Toggle active status
            var toggleResponse = await _client.PatchAsync($"/api/category/{createdCategory.Id}/toggle-status", null);
            Assert.Equal(HttpStatusCode.OK, toggleResponse.StatusCode);

            var toggledCategory = await toggleResponse.Content.ReadFromJsonAsync<CategoryDto>(_jsonOptions);
            Assert.NotNull(toggledCategory);
            Assert.False(toggledCategory.IsActive);

            // 5. Delete the category
            var deleteResponse = await _client.DeleteAsync($"/api/category/{createdCategory.Id}");
            Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

            // 6. Verify category is soft deleted (should still exist but inactive)
            var getAfterDeleteResponse = await _client.GetAsync($"/api/category/{createdCategory.Id}");
            Assert.Equal(HttpStatusCode.OK, getAfterDeleteResponse.StatusCode);

            var deletedCategory = await getAfterDeleteResponse.Content.ReadFromJsonAsync<CategoryDto>(_jsonOptions);
            Assert.NotNull(deletedCategory);
            Assert.False(deletedCategory.IsActive);
        }

        [Fact]
        public async Task GetAllCategories_WithMultipleCategories_ReturnsOrderedResults()
        {
            // Create test categories
            var categories = new[]
            {
                new CreateCategoryRequest { Name = "Z Credit Category", Type = CategoryType.Credit },
                new CreateCategoryRequest { Name = "A Debit Category", Type = CategoryType.Debit },
                new CreateCategoryRequest { Name = "B Credit Category", Type = CategoryType.Credit }
            };

            foreach (var category in categories)
            {
                var response = await _client.PostAsJsonAsync("/api/category", category);
                Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            }

            // Get all categories
            var getAllResponse = await _client.GetAsync("/api/category");
            Assert.Equal(HttpStatusCode.OK, getAllResponse.StatusCode);

            var allCategories = await getAllResponse.Content.ReadFromJsonAsync<List<CategoryDto>>(_jsonOptions);
            Assert.NotNull(allCategories);
            Assert.Equal(3, allCategories.Count);

            // Verify ordering: Credit categories first (Type = 0), then Debit (Type = 1), ordered by name within type
            Assert.Equal(CategoryType.Credit, allCategories[0].Type);
            Assert.Equal("B Credit Category", allCategories[0].Name);
            Assert.Equal(CategoryType.Credit, allCategories[1].Type);
            Assert.Equal("Z Credit Category", allCategories[1].Name);
            Assert.Equal(CategoryType.Debit, allCategories[2].Type);
            Assert.Equal("A Debit Category", allCategories[2].Name);
        }

        [Fact]
        public async Task GetCategoriesByType_FiltersByTypeCorrectly()
        {
            // Create categories of different types
            var creditCategory = new CreateCategoryRequest { Name = "Credit Category", Type = CategoryType.Credit };
            var debitCategory = new CreateCategoryRequest { Name = "Debit Category", Type = CategoryType.Debit };

            await _client.PostAsJsonAsync("/api/category", creditCategory);
            await _client.PostAsJsonAsync("/api/category", debitCategory);

            // Get only credit categories
            var creditResponse = await _client.GetAsync("/api/category/type/0"); // Credit = 0
            Assert.Equal(HttpStatusCode.OK, creditResponse.StatusCode);

            var creditCategories = await creditResponse.Content.ReadFromJsonAsync<List<CategoryDto>>(_jsonOptions);
            Assert.NotNull(creditCategories);
            Assert.Single(creditCategories);
            Assert.Equal(CategoryType.Credit, creditCategories[0].Type);
            Assert.Equal("Credit Category", creditCategories[0].Name);

            // Get only debit categories
            var debitResponse = await _client.GetAsync("/api/category/type/1"); // Debit = 1
            Assert.Equal(HttpStatusCode.OK, debitResponse.StatusCode);

            var debitCategories = await debitResponse.Content.ReadFromJsonAsync<List<CategoryDto>>(_jsonOptions);
            Assert.NotNull(debitCategories);
            Assert.Single(debitCategories);
            Assert.Equal(CategoryType.Debit, debitCategories[0].Type);
            Assert.Equal("Debit Category", debitCategories[0].Name);
        }

        [Fact]
        public async Task SearchCategories_FindsMatchingCategories()
        {
            // Create test categories
            var categories = new[]
            {
                new CreateCategoryRequest { Name = "Fabric Purchase", Type = CategoryType.Debit },
                new CreateCategoryRequest { Name = "Electric Bill", Type = CategoryType.Debit },
                new CreateCategoryRequest { Name = "Received: Urbo ltd", Type = CategoryType.Credit }
            };

            foreach (var category in categories)
            {
                await _client.PostAsJsonAsync("/api/category", category);
            }

            // Search for "fabric"
            var searchResponse = await _client.GetAsync("/api/category/search?searchTerm=fabric");
            Assert.Equal(HttpStatusCode.OK, searchResponse.StatusCode);

            var searchResults = await searchResponse.Content.ReadFromJsonAsync<List<CategoryDto>>(_jsonOptions);
            Assert.NotNull(searchResults);
            Assert.Single(searchResults);
            Assert.Equal("Fabric Purchase", searchResults[0].Name);
        }

        #endregion

        #region Database Constraints Tests

        [Fact]
        public async Task CreateCategory_DuplicateNameSameType_ReturnsConflict()
        {
            // Create first category
            var firstCategory = new CreateCategoryRequest
            {
                Name = "Duplicate Name",
                Type = CategoryType.Credit
            };

            var firstResponse = await _client.PostAsJsonAsync("/api/category", firstCategory);
            Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

            // Try to create second category with same name and type
            var secondCategory = new CreateCategoryRequest
            {
                Name = "Duplicate Name",
                Type = CategoryType.Credit
            };

            var secondResponse = await _client.PostAsJsonAsync("/api/category", secondCategory);
            Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
        }

        [Fact]
        public async Task CreateCategory_SameNameDifferentType_Succeeds()
        {
            // Create first category
            var firstCategory = new CreateCategoryRequest
            {
                Name = "Same Name",
                Type = CategoryType.Credit
            };

            var firstResponse = await _client.PostAsJsonAsync("/api/category", firstCategory);
            Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

            // Create second category with same name but different type
            var secondCategory = new CreateCategoryRequest
            {
                Name = "Same Name",
                Type = CategoryType.Debit
            };

            var secondResponse = await _client.PostAsJsonAsync("/api/category", secondCategory);
            Assert.Equal(HttpStatusCode.Created, secondResponse.StatusCode);

            // Verify both categories exist
            var getAllResponse = await _client.GetAsync("/api/category");
            var allCategories = await getAllResponse.Content.ReadFromJsonAsync<List<CategoryDto>>(_jsonOptions);
            Assert.NotNull(allCategories);
            Assert.Equal(2, allCategories.Count);
            Assert.All(allCategories, c => Assert.Equal("Same Name", c.Name));
        }

        #endregion

        #region Data Persistence Tests

        [Fact]
        public async Task CategoryOperations_PersistCorrectly()
        {
            // Create category
            var createRequest = new CreateCategoryRequest
            {
                Name = "Persistence Test",
                Description = "Testing data persistence",
                Type = CategoryType.Debit
            };

            var createResponse = await _client.PostAsJsonAsync("/api/category", createRequest);
            var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryDto>(_jsonOptions);

            // Verify data is persisted correctly
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var categoryInDb = await context.Categories.FirstOrDefaultAsync(c => c.Id == createdCategory!.Id);
            Assert.NotNull(categoryInDb);
            Assert.Equal("Persistence Test", categoryInDb.Name);
            Assert.Equal("Testing data persistence", categoryInDb.Description);
            Assert.Equal(CategoryType.Debit, categoryInDb.Type);
            Assert.True(categoryInDb.IsActive);
            Assert.NotEqual(default(DateTime), categoryInDb.CreatedAt);
        }

        [Fact]
        public async Task UpdateCategory_PersistsChangesCorrectly()
        {
            // Create category
            var createRequest = new CreateCategoryRequest
            {
                Name = "Original Name",
                Type = CategoryType.Credit
            };

            var createResponse = await _client.PostAsJsonAsync("/api/category", createRequest);
            var createdCategory = await createResponse.Content.ReadFromJsonAsync<CategoryDto>(_jsonOptions);

            // Update category
            var updateRequest = new UpdateCategoryRequest
            {
                Name = "Updated Name",
                Description = "Updated Description",
                IsActive = false
            };

            await _client.PutAsJsonAsync($"/api/category/{createdCategory!.Id}", updateRequest);

            // Verify changes are persisted
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var categoryInDb = await context.Categories.FirstOrDefaultAsync(c => c.Id == createdCategory!.Id);
            Assert.NotNull(categoryInDb);
            Assert.Equal("Updated Name", categoryInDb.Name);
            Assert.Equal("Updated Description", categoryInDb.Description);
            Assert.False(categoryInDb.IsActive);
            Assert.NotNull(categoryInDb.UpdatedAt);
        }

        #endregion

        #region Error Handling Tests

        [Fact]
        public async Task GetCategory_NonExistentId_ReturnsNotFound()
        {
            var nonExistentId = Guid.NewGuid();
            var response = await _client.GetAsync($"/api/category/{nonExistentId}");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetCategory_InvalidId_ReturnsBadRequest()
        {
            var response = await _client.GetAsync($"/api/category/{Guid.Empty}");
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task CreateCategory_InvalidData_ReturnsBadRequest()
        {
            var invalidRequest = new CreateCategoryRequest
            {
                // Missing required Name
                Type = CategoryType.Credit
            };

            var response = await _client.PostAsJsonAsync("/api/category", invalidRequest);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task UpdateCategory_NonExistentId_ReturnsNotFound()
        {
            var nonExistentId = Guid.NewGuid();
            var updateRequest = new UpdateCategoryRequest
            {
                Name = "Updated Name",
                IsActive = true
            };

            var response = await _client.PutAsJsonAsync($"/api/category/{nonExistentId}", updateRequest);
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task DeleteCategory_NonExistentId_ReturnsNotFound()
        {
            var nonExistentId = Guid.NewGuid();
            var response = await _client.DeleteAsync($"/api/category/{nonExistentId}");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task SearchCategories_EmptySearchTerm_ReturnsBadRequest()
        {
            var response = await _client.GetAsync("/api/category/search?searchTerm=");
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task GetCategoriesByType_InvalidType_ReturnsBadRequest()
        {
            var response = await _client.GetAsync("/api/category/type/999");
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region Concurrent Access Tests

        [Fact]
        public async Task ConcurrentCategoryCreation_HandlesCorrectly()
        {
            var tasks = new List<Task<HttpResponseMessage>>();

            // Create multiple categories concurrently
            for (int i = 0; i < 5; i++)
            {
                var request = new CreateCategoryRequest
                {
                    Name = $"Concurrent Category {i}",
                    Type = CategoryType.Credit
                };

                tasks.Add(_client.PostAsJsonAsync("/api/category", request));
            }

            var responses = await Task.WhenAll(tasks);

            // All should succeed
            Assert.All(responses, response => Assert.Equal(HttpStatusCode.Created, response.StatusCode));

            // Verify all categories were created
            var getAllResponse = await _client.GetAsync("/api/category");
            var allCategories = await getAllResponse.Content.ReadFromJsonAsync<List<CategoryDto>>(_jsonOptions);
            Assert.NotNull(allCategories);
            Assert.Equal(5, allCategories.Count);
        }

        [Fact]
        public async Task ConcurrentDuplicateCreation_OnlyOneSucceeds()
        {
            var tasks = new List<Task<HttpResponseMessage>>();

            // Try to create multiple categories with the same name concurrently
            for (int i = 0; i < 3; i++)
            {
                var request = new CreateCategoryRequest
                {
                    Name = "Duplicate Concurrent Category",
                    Type = CategoryType.Credit
                };

                tasks.Add(_client.PostAsJsonAsync("/api/category", request));
            }

            var responses = await Task.WhenAll(tasks);

            // Only one should succeed, others should conflict
            var successCount = responses.Count(r => r.StatusCode == HttpStatusCode.Created);
            var conflictCount = responses.Count(r => r.StatusCode == HttpStatusCode.Conflict);

            Assert.Equal(1, successCount);
            Assert.Equal(2, conflictCount);
        }

        #endregion

        #region Data Consistency Tests

        [Fact]
        public async Task CategoryOperations_MaintainDataConsistency()
        {
            // Create multiple categories
            var categories = new[]
            {
                new CreateCategoryRequest { Name = "Category A", Type = CategoryType.Credit },
                new CreateCategoryRequest { Name = "Category B", Type = CategoryType.Debit },
                new CreateCategoryRequest { Name = "Category C", Type = CategoryType.Credit }
            };

            var createdIds = new List<Guid>();

            foreach (var category in categories)
            {
                var response = await _client.PostAsJsonAsync("/api/category", category);
                var created = await response.Content.ReadFromJsonAsync<CategoryDto>(_jsonOptions);
                createdIds.Add(created!.Id);
            }

            // Perform various operations
            await _client.PutAsJsonAsync($"/api/category/{createdIds[0]}", new UpdateCategoryRequest
            {
                Name = "Updated Category A",
                IsActive = true
            });

            await _client.PatchAsync($"/api/category/{createdIds[1]}/toggle-status", null);
            await _client.DeleteAsync($"/api/category/{createdIds[2]}");

            // Verify data consistency
            using var scope = _factory.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var categoriesInDb = await context.Categories.ToListAsync();
            Assert.Equal(3, categoriesInDb.Count);

            var categoryA = categoriesInDb.First(c => c.Id == createdIds[0]);
            Assert.Equal("Updated Category A", categoryA.Name);
            Assert.True(categoryA.IsActive);
            Assert.NotNull(categoryA.UpdatedAt);

            var categoryB = categoriesInDb.First(c => c.Id == createdIds[1]);
            Assert.False(categoryB.IsActive); // Should be toggled to inactive
            Assert.NotNull(categoryB.UpdatedAt);

            var categoryC = categoriesInDb.First(c => c.Id == createdIds[2]);
            Assert.False(categoryC.IsActive); // Should be soft deleted (inactive)
            Assert.NotNull(categoryC.UpdatedAt);
        }

        #endregion
    }
}