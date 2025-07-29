using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Users;
using GarmentsERP.API.Services;

namespace GarmentsERP.API.Tests
{
    public class PermissionSeederServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<PermissionSeederService>> _mockLogger;

        public PermissionSeederServiceTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _mockLogger = new Mock<ILogger<PermissionSeederService>>();
        }

        [Fact]
        public async Task EnsurePermissionsExistAsync_ShouldCreateRequiredPermissions()
        {
            // Arrange - Create a simple test that focuses on permission creation
            var seederService = new TestablePermissionSeederService(_context, _mockLogger.Object);

            // Act
            await seederService.TestEnsurePermissionsExistAsync();

            // Assert - Check that permissions were created
            var permissions = await _context.Permissions.ToListAsync();
            Assert.NotEmpty(permissions);

            // Check specific category permissions
            var categoryViewPermission = permissions.FirstOrDefault(p => p.Resource == "Category" && p.Action == "View");
            Assert.NotNull(categoryViewPermission);
            Assert.Equal("View Categories", categoryViewPermission.Name);

            var categoryCreatePermission = permissions.FirstOrDefault(p => p.Resource == "Category" && p.Action == "Create");
            Assert.NotNull(categoryCreatePermission);
            Assert.Equal("Create Categories", categoryCreatePermission.Name);

            // Check user management permissions
            var userViewPermission = permissions.FirstOrDefault(p => p.Resource == "User" && p.Action == "View");
            Assert.NotNull(userViewPermission);
            Assert.Equal("View Users", userViewPermission.Name);

            // Verify all expected permissions are created
            var expectedPermissionCount = 16; // 4 resources * 4 actions each
            Assert.Equal(expectedPermissionCount, permissions.Count);
        }

        [Fact]
        public async Task EnsurePermissionsExistAsync_ShouldNotDuplicateExistingPermissions()
        {
            // Arrange - Add an existing permission
            var existingPermission = new Permission
            {
                Name = "View Categories",
                Resource = "Category",
                Action = "View",
                Description = "Can view category list and details",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Permissions.Add(existingPermission);
            await _context.SaveChangesAsync();

            var initialPermissionCount = await _context.Permissions.CountAsync();
            var seederService = new TestablePermissionSeederService(_context, _mockLogger.Object);

            // Act
            await seederService.TestEnsurePermissionsExistAsync();

            // Assert - Check that no duplicate permissions were created
            var finalPermissionCount = await _context.Permissions.CountAsync();
            var categoryViewPermissions = await _context.Permissions
                .Where(p => p.Resource == "Category" && p.Action == "View")
                .ToListAsync();

            Assert.Single(categoryViewPermissions);
            Assert.True(finalPermissionCount > initialPermissionCount); // Other permissions should be added
        }

        [Fact]
        public async Task EnsurePermissionsExistAsync_ShouldUpdateInactivePermissions()
        {
            // Arrange - Add an inactive permission
            var inactivePermission = new Permission
            {
                Name = "Old View Categories",
                Resource = "Category",
                Action = "View",
                Description = "Old description",
                IsActive = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Permissions.Add(inactivePermission);
            await _context.SaveChangesAsync();

            var seederService = new TestablePermissionSeederService(_context, _mockLogger.Object);

            // Act
            await seederService.TestEnsurePermissionsExistAsync();

            // Assert - Check that the permission was updated
            var updatedPermission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Resource == "Category" && p.Action == "View");

            Assert.NotNull(updatedPermission);
            Assert.Equal("View Categories", updatedPermission.Name);
            Assert.Equal("Can view category list and details", updatedPermission.Description);
            Assert.True(updatedPermission.IsActive);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        // Test helper class to expose private methods for testing
        private class TestablePermissionSeederService : PermissionSeederService
        {
            public TestablePermissionSeederService(ApplicationDbContext context, ILogger<PermissionSeederService> logger)
                : base(context, null!, logger) // RoleManager not needed for permission creation tests
            {
            }

            public async Task TestEnsurePermissionsExistAsync()
            {
                // Use reflection to call the private method
                var method = typeof(PermissionSeederService).GetMethod("EnsurePermissionsExistAsync", 
                    System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                await (Task)method!.Invoke(this, null)!;
            }
        }
    }
}