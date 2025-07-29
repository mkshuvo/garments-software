using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using GarmentsERP.API.Controllers;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Attributes;
using GarmentsERP.API.Models.Accounting;
using System.Security.Claims;
using CategoryDto = GarmentsERP.API.DTOs.CategoryDto;
using CreateCategoryRequest = GarmentsERP.API.DTOs.CreateCategoryRequest;
using UpdateCategoryRequest = GarmentsERP.API.DTOs.UpdateCategoryRequest;

namespace GarmentsERP.API.Tests
{
    public class CategoryControllerPermissionTests
    {
        private readonly Mock<ICategoryService> _mockCategoryService;
        private readonly Mock<IPermissionService> _mockPermissionService;
        private readonly Mock<ILogger<CategoryController>> _mockLogger;
        private readonly CategoryController _controller;
        private readonly Mock<IServiceProvider> _mockServiceProvider;

        public CategoryControllerPermissionTests()
        {
            _mockCategoryService = new Mock<ICategoryService>();
            _mockPermissionService = new Mock<IPermissionService>();
            _mockLogger = new Mock<ILogger<CategoryController>>();
            _mockServiceProvider = new Mock<IServiceProvider>();
            
            _controller = new CategoryController(_mockCategoryService.Object, _mockLogger.Object);

            // Setup service provider to return permission service using GetService method
            _mockServiceProvider.Setup(sp => sp.GetService(typeof(IPermissionService)))
                .Returns(_mockPermissionService.Object);
        }

        private void SetupUserContext(string userId, string userName = "testuser")
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, userName)
            }, "test"));

            var httpContext = new DefaultHttpContext 
            { 
                User = user,
                RequestServices = _mockServiceProvider.Object
            };

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
        }

        private async Task<AuthorizationFilterContext> CreateAuthorizationContext(string userId, string resource, string action)
        {
            SetupUserContext(userId);
            
            var actionContext = new ActionContext(
                _controller.ControllerContext.HttpContext,
                new Microsoft.AspNetCore.Routing.RouteData(),
                new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()
            );

            var context = new AuthorizationFilterContext(actionContext, new List<IFilterMetadata>());
            
            var attribute = new RequirePermissionAttribute(resource, action);
            await attribute.OnAuthorizationAsync(context);
            
            return context;
        }

        #region Admin User Tests (Should have all permissions)

        [Fact]
        public async Task GetCategories_AdminUser_ShouldAllowAccess()
        {
            // Arrange
            var adminUserId = "admin-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(adminUserId, "Category", "View"))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(adminUserId, "Category", "View");

            // Assert
            Assert.Null(context.Result); // No result means authorization passed
        }

        [Fact]
        public async Task CreateCategory_AdminUser_ShouldAllowAccess()
        {
            // Arrange
            var adminUserId = "admin-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(adminUserId, "Category", "Create"))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(adminUserId, "Category", "Create");

            // Assert
            Assert.Null(context.Result); // No result means authorization passed
        }

        [Fact]
        public async Task UpdateCategory_AdminUser_ShouldAllowAccess()
        {
            // Arrange
            var adminUserId = "admin-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(adminUserId, "Category", "Update"))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(adminUserId, "Category", "Update");

            // Assert
            Assert.Null(context.Result); // No result means authorization passed
        }

        [Fact]
        public async Task DeleteCategory_AdminUser_ShouldAllowAccess()
        {
            // Arrange
            var adminUserId = "admin-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(adminUserId, "Category", "Delete"))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(adminUserId, "Category", "Delete");

            // Assert
            Assert.Null(context.Result); // No result means authorization passed
        }

        #endregion

        #region Manager User Tests (Should have View, Create, Update but not Delete)

        [Fact]
        public async Task GetCategories_ManagerUser_ShouldAllowAccess()
        {
            // Arrange
            var managerUserId = "manager-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(managerUserId, "Category", "View"))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(managerUserId, "Category", "View");

            // Assert
            Assert.Null(context.Result); // No result means authorization passed
        }

        [Fact]
        public async Task CreateCategory_ManagerUser_ShouldAllowAccess()
        {
            // Arrange
            var managerUserId = "manager-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(managerUserId, "Category", "Create"))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(managerUserId, "Category", "Create");

            // Assert
            Assert.Null(context.Result); // No result means authorization passed
        }

        [Fact]
        public async Task UpdateCategory_ManagerUser_ShouldAllowAccess()
        {
            // Arrange
            var managerUserId = "manager-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(managerUserId, "Category", "Update"))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(managerUserId, "Category", "Update");

            // Assert
            Assert.Null(context.Result); // No result means authorization passed
        }

        [Fact]
        public async Task DeleteCategory_ManagerUser_ShouldDenyAccess()
        {
            // Arrange
            var managerUserId = "manager-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(managerUserId, "Category", "Delete"))
                .ReturnsAsync(false);

            // Act
            var context = await CreateAuthorizationContext(managerUserId, "Category", "Delete");

            // Assert
            Assert.IsType<ForbidResult>(context.Result); // Should return 403 Forbidden
        }

        #endregion

        #region Employee User Tests (Should only have View permission)

        [Fact]
        public async Task GetCategories_EmployeeUser_ShouldAllowAccess()
        {
            // Arrange
            var employeeUserId = "employee-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(employeeUserId, "Category", "View"))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(employeeUserId, "Category", "View");

            // Assert
            Assert.Null(context.Result); // No result means authorization passed
        }

        [Fact]
        public async Task CreateCategory_EmployeeUser_ShouldDenyAccess()
        {
            // Arrange
            var employeeUserId = "employee-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(employeeUserId, "Category", "Create"))
                .ReturnsAsync(false);

            // Act
            var context = await CreateAuthorizationContext(employeeUserId, "Category", "Create");

            // Assert
            Assert.IsType<ForbidResult>(context.Result); // Should return 403 Forbidden
        }

        [Fact]
        public async Task UpdateCategory_EmployeeUser_ShouldDenyAccess()
        {
            // Arrange
            var employeeUserId = "employee-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(employeeUserId, "Category", "Update"))
                .ReturnsAsync(false);

            // Act
            var context = await CreateAuthorizationContext(employeeUserId, "Category", "Update");

            // Assert
            Assert.IsType<ForbidResult>(context.Result); // Should return 403 Forbidden
        }

        [Fact]
        public async Task DeleteCategory_EmployeeUser_ShouldDenyAccess()
        {
            // Arrange
            var employeeUserId = "employee-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(employeeUserId, "Category", "Delete"))
                .ReturnsAsync(false);

            // Act
            var context = await CreateAuthorizationContext(employeeUserId, "Category", "Delete");

            // Assert
            Assert.IsType<ForbidResult>(context.Result); // Should return 403 Forbidden
        }

        #endregion

        #region Unauthorized User Tests

        [Fact]
        public async Task GetCategories_UnauthenticatedUser_ShouldReturn401()
        {
            // Arrange
            var httpContext = new DefaultHttpContext 
            { 
                User = new ClaimsPrincipal(), // No authenticated identity
                RequestServices = _mockServiceProvider.Object
            };

            var actionContext = new ActionContext(
                httpContext,
                new Microsoft.AspNetCore.Routing.RouteData(),
                new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()
            );

            var context = new AuthorizationFilterContext(actionContext, new List<IFilterMetadata>());
            
            var attribute = new RequirePermissionAttribute("Category", "View");

            // Act
            await attribute.OnAuthorizationAsync(context);

            // Assert
            Assert.IsType<UnauthorizedResult>(context.Result); // Should return 401 Unauthorized
        }

        [Fact]
        public async Task CreateCategory_UnauthenticatedUser_ShouldReturn401()
        {
            // Arrange
            var httpContext = new DefaultHttpContext 
            { 
                User = new ClaimsPrincipal(), // No authenticated identity
                RequestServices = _mockServiceProvider.Object
            };

            var actionContext = new ActionContext(
                httpContext,
                new Microsoft.AspNetCore.Routing.RouteData(),
                new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()
            );

            var context = new AuthorizationFilterContext(actionContext, new List<IFilterMetadata>());
            
            var attribute = new RequirePermissionAttribute("Category", "Create");

            // Act
            await attribute.OnAuthorizationAsync(context);

            // Assert
            Assert.IsType<UnauthorizedResult>(context.Result); // Should return 401 Unauthorized
        }

        #endregion

        #region User Without Claims Tests

        [Fact]
        public async Task GetCategories_UserWithoutNameIdentifierClaim_ShouldReturn401()
        {
            // Arrange
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, "testuser") // Missing NameIdentifier claim
            }, "test"));

            var httpContext = new DefaultHttpContext 
            { 
                User = user,
                RequestServices = _mockServiceProvider.Object
            };

            var actionContext = new ActionContext(
                httpContext,
                new Microsoft.AspNetCore.Routing.RouteData(),
                new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()
            );

            var context = new AuthorizationFilterContext(actionContext, new List<IFilterMetadata>());
            
            var attribute = new RequirePermissionAttribute("Category", "View");

            // Act
            await attribute.OnAuthorizationAsync(context);

            // Assert
            Assert.IsType<UnauthorizedResult>(context.Result); // Should return 401 Unauthorized
        }

        #endregion

        #region Permission Service Unavailable Tests

        [Fact]
        public async Task GetCategories_PermissionServiceUnavailable_ShouldReturn500()
        {
            // Arrange
            var mockServiceProviderWithoutPermissionService = new Mock<IServiceProvider>();
            mockServiceProviderWithoutPermissionService.Setup(sp => sp.GetService(typeof(IPermissionService)))
                .Returns((IPermissionService?)null);

            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "user-id"),
                new Claim(ClaimTypes.Name, "testuser")
            }, "test"));

            var httpContext = new DefaultHttpContext 
            { 
                User = user,
                RequestServices = mockServiceProviderWithoutPermissionService.Object
            };

            var actionContext = new ActionContext(
                httpContext,
                new Microsoft.AspNetCore.Routing.RouteData(),
                new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()
            );

            var context = new AuthorizationFilterContext(actionContext, new List<IFilterMetadata>());
            
            var attribute = new RequirePermissionAttribute("Category", "View");

            // Act
            await attribute.OnAuthorizationAsync(context);

            // Assert
            var statusResult = Assert.IsType<StatusCodeResult>(context.Result);
            Assert.Equal(500, statusResult.StatusCode); // Should return 500 Internal Server Error
        }

        #endregion

        #region Integration Tests with Controller Methods

        [Fact]
        public async Task GetCategories_WithValidPermission_ShouldCallService()
        {
            // Arrange
            var userId = "test-user-id";
            SetupUserContext(userId);
            
            var categories = new List<CategoryDto>
            {
                new CategoryDto { Id = Guid.NewGuid(), Name = "Test Category", Type = CategoryType.Credit }
            };

            _mockCategoryService.Setup(s => s.GetAllCategoriesAsync())
                .ReturnsAsync(categories);

            // Act
            var result = await _controller.GetCategories();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCategories = Assert.IsAssignableFrom<IEnumerable<CategoryDto>>(okResult.Value);
            Assert.Single(returnedCategories);
            
            // Verify service was called
            _mockCategoryService.Verify(s => s.GetAllCategoriesAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateCategory_WithValidPermission_ShouldCallService()
        {
            // Arrange
            var userId = "test-user-id";
            SetupUserContext(userId);
            
            var request = new CreateCategoryRequest
            {
                Name = "New Category",
                Description = "Test Description",
                Type = CategoryType.Credit
            };

            var createdCategory = new CategoryDto
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Description = request.Description,
                Type = request.Type
            };

            _mockCategoryService.Setup(s => s.CreateCategoryAsync(request, "testuser"))
                .ReturnsAsync(createdCategory);

            // Act
            var result = await _controller.CreateCategory(request);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(createdCategory.Id, createdResult.RouteValues?["id"]);
            
            // Verify service was called
            _mockCategoryService.Verify(s => s.CreateCategoryAsync(request, "testuser"), Times.Once);
        }

        #endregion

        #region Verify Correct Permission Resource and Action

        [Theory]
        [InlineData("Category", "View")]
        public async Task GetCategories_ShouldCheckCorrectPermission(string expectedResource, string expectedAction)
        {
            // Arrange
            var userId = "test-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(userId, expectedResource, expectedAction))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(userId, expectedResource, expectedAction);

            // Assert
            Assert.Null(context.Result); // Authorization should pass
            _mockPermissionService.Verify(ps => ps.HasPermissionAsync(userId, expectedResource, expectedAction), Times.Once);
        }

        [Theory]
        [InlineData("Category", "Create")]
        public async Task CreateCategory_ShouldCheckCorrectPermission(string expectedResource, string expectedAction)
        {
            // Arrange
            var userId = "test-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(userId, expectedResource, expectedAction))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(userId, expectedResource, expectedAction);

            // Assert
            Assert.Null(context.Result); // Authorization should pass
            _mockPermissionService.Verify(ps => ps.HasPermissionAsync(userId, expectedResource, expectedAction), Times.Once);
        }

        [Theory]
        [InlineData("Category", "Update")]
        public async Task UpdateCategory_ShouldCheckCorrectPermission(string expectedResource, string expectedAction)
        {
            // Arrange
            var userId = "test-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(userId, expectedResource, expectedAction))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(userId, expectedResource, expectedAction);

            // Assert
            Assert.Null(context.Result); // Authorization should pass
            _mockPermissionService.Verify(ps => ps.HasPermissionAsync(userId, expectedResource, expectedAction), Times.Once);
        }

        [Theory]
        [InlineData("Category", "Delete")]
        public async Task DeleteCategory_ShouldCheckCorrectPermission(string expectedResource, string expectedAction)
        {
            // Arrange
            var userId = "test-user-id";
            _mockPermissionService.Setup(ps => ps.HasPermissionAsync(userId, expectedResource, expectedAction))
                .ReturnsAsync(true);

            // Act
            var context = await CreateAuthorizationContext(userId, expectedResource, expectedAction);

            // Assert
            Assert.Null(context.Result); // Authorization should pass
            _mockPermissionService.Verify(ps => ps.HasPermissionAsync(userId, expectedResource, expectedAction), Times.Once);
        }

        #endregion
    }
}