using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using GarmentsERP.API.Controllers;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Accounting;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using CategoryDto = GarmentsERP.API.DTOs.CategoryDto;
using CreateCategoryRequest = GarmentsERP.API.DTOs.CreateCategoryRequest;
using UpdateCategoryRequest = GarmentsERP.API.DTOs.UpdateCategoryRequest;

namespace GarmentsERP.API.Tests
{
    public class CategoryControllerTests
    {
        private readonly Mock<ICategoryService> _mockCategoryService;
        private readonly Mock<ILogger<CategoryController>> _mockLogger;
        private readonly CategoryController _controller;

        public CategoryControllerTests()
        {
            _mockCategoryService = new Mock<ICategoryService>();
            _mockLogger = new Mock<ILogger<CategoryController>>();
            _controller = new CategoryController(_mockCategoryService.Object, _mockLogger.Object);

            // Setup user context for testing
            var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, "testuser")
            }, "test"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        #region GET Endpoints Tests

        [Fact]
        public async Task GetCategories_Success_ReturnsOkWithCategories()
        {
            // Arrange
            var categories = new List<CategoryDto>
            {
                new CategoryDto { Id = Guid.NewGuid(), Name = "Category 1", Type = CategoryType.Credit },
                new CategoryDto { Id = Guid.NewGuid(), Name = "Category 2", Type = CategoryType.Debit }
            };

            _mockCategoryService.Setup(s => s.GetAllCategoriesAsync())
                .ReturnsAsync(categories);

            // Act
            var result = await _controller.GetCategories();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCategories = Assert.IsAssignableFrom<IEnumerable<CategoryDto>>(okResult.Value);
            Assert.Equal(2, returnedCategories.Count());
        }

        [Fact]
        public async Task GetCategories_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            _mockCategoryService.Setup(s => s.GetAllCategoriesAsync())
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetCategories();

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        [Fact]
        public async Task GetCategory_ValidId_ReturnsOkWithCategory()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var category = new CategoryDto
            {
                Id = categoryId,
                Name = "Test Category",
                Type = CategoryType.Credit
            };

            _mockCategoryService.Setup(s => s.GetCategoryByIdAsync(categoryId))
                .ReturnsAsync(category);

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCategory = Assert.IsType<CategoryDto>(okResult.Value);
            Assert.Equal(categoryId, returnedCategory.Id);
            Assert.Equal("Test Category", returnedCategory.Name);
        }

        [Fact]
        public async Task GetCategory_EmptyId_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.GetCategory(Guid.Empty);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task GetCategory_CategoryNotFound_ReturnsNotFound()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.GetCategoryByIdAsync(categoryId))
                .ReturnsAsync((CategoryDto?)null);

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.NotNull(notFoundResult.Value);
        }

        [Fact]
        public async Task GetCategory_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.GetCategoryByIdAsync(categoryId))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetCategory(categoryId);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        [Fact]
        public async Task GetCategoriesByType_ValidType_ReturnsOkWithCategories()
        {
            // Arrange
            var categories = new List<CategoryDto>
            {
                new CategoryDto { Id = Guid.NewGuid(), Name = "Credit Category", Type = CategoryType.Credit }
            };

            _mockCategoryService.Setup(s => s.GetCategoriesByTypeAsync(CategoryType.Credit))
                .ReturnsAsync(categories);

            // Act
            var result = await _controller.GetCategoriesByType(CategoryType.Credit);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCategories = Assert.IsAssignableFrom<IEnumerable<CategoryDto>>(okResult.Value);
            Assert.Single(returnedCategories);
        }

        [Fact]
        public async Task GetCategoriesByType_InvalidType_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.GetCategoriesByType((CategoryType)999);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task GetCategoriesByType_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            _mockCategoryService.Setup(s => s.GetCategoriesByTypeAsync(CategoryType.Credit))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.GetCategoriesByType(CategoryType.Credit);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        [Fact]
        public async Task SearchCategories_ValidSearchTerm_ReturnsOkWithCategories()
        {
            // Arrange
            var searchTerm = "fabric";
            var categories = new List<CategoryDto>
            {
                new CategoryDto { Id = Guid.NewGuid(), Name = "Fabric Purchase", Type = CategoryType.Debit }
            };

            _mockCategoryService.Setup(s => s.SearchCategoriesAsync(searchTerm))
                .ReturnsAsync(categories);

            // Act
            var result = await _controller.SearchCategories(searchTerm);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCategories = Assert.IsAssignableFrom<IEnumerable<CategoryDto>>(okResult.Value);
            Assert.Single(returnedCategories);
        }

        [Fact]
        public async Task SearchCategories_EmptySearchTerm_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.SearchCategories("");

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task SearchCategories_NullSearchTerm_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.SearchCategories(null!);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task SearchCategories_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var searchTerm = "fabric";
            _mockCategoryService.Setup(s => s.SearchCategoriesAsync(searchTerm))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.SearchCategories(searchTerm);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        #endregion

        #region POST Endpoint Tests

        [Fact]
        public async Task CreateCategory_ValidRequest_ReturnsCreatedAtAction()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Name = "New Category",
                Description = "New Description",
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
            Assert.Equal(nameof(CategoryController.GetCategory), createdResult.ActionName);
            Assert.Equal(createdCategory.Id, createdResult.RouteValues?["id"]);
            
            var returnedCategory = Assert.IsType<CategoryDto>(createdResult.Value);
            Assert.Equal(createdCategory.Id, returnedCategory.Id);
        }

        [Fact]
        public async Task CreateCategory_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var request = new CreateCategoryRequest(); // Invalid - missing required fields
            _controller.ModelState.AddModelError("Name", "Name is required");

            // Act
            var result = await _controller.CreateCategory(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.IsType<SerializableError>(badRequestResult.Value);
        }

        [Fact]
        public async Task CreateCategory_DuplicateName_ReturnsConflict()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Name = "Existing Category",
                Type = CategoryType.Credit
            };

            _mockCategoryService.Setup(s => s.CreateCategoryAsync(request, "testuser"))
                .ThrowsAsync(new InvalidOperationException("Category name 'Existing Category' already exists"));

            // Act
            var result = await _controller.CreateCategory(request);

            // Assert
            var conflictResult = Assert.IsType<ConflictObjectResult>(result.Result);
            Assert.NotNull(conflictResult.Value);
        }

        [Fact]
        public async Task CreateCategory_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Name = "New Category",
                Type = CategoryType.Credit
            };

            _mockCategoryService.Setup(s => s.CreateCategoryAsync(request, "testuser"))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.CreateCategory(request);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        #endregion

        #region PUT Endpoint Tests

        [Fact]
        public async Task UpdateCategory_ValidRequest_ReturnsOkWithUpdatedCategory()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var request = new UpdateCategoryRequest
            {
                Name = "Updated Category",
                Description = "Updated Description",
                IsActive = true
            };

            var updatedCategory = new CategoryDto
            {
                Id = categoryId,
                Name = request.Name,
                Description = request.Description,
                IsActive = request.IsActive
            };

            _mockCategoryService.Setup(s => s.UpdateCategoryAsync(categoryId, request, "testuser"))
                .ReturnsAsync(updatedCategory);

            // Act
            var result = await _controller.UpdateCategory(categoryId, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCategory = Assert.IsType<CategoryDto>(okResult.Value);
            Assert.Equal(categoryId, returnedCategory.Id);
            Assert.Equal("Updated Category", returnedCategory.Name);
        }

        [Fact]
        public async Task UpdateCategory_InvalidModelState_ReturnsBadRequest()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var request = new UpdateCategoryRequest(); // Invalid - missing required fields
            _controller.ModelState.AddModelError("Name", "Name is required");

            // Act
            var result = await _controller.UpdateCategory(categoryId, request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.IsType<SerializableError>(badRequestResult.Value);
        }

        [Fact]
        public async Task UpdateCategory_CategoryNotFound_ReturnsNotFound()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var request = new UpdateCategoryRequest
            {
                Name = "Updated Category",
                IsActive = true
            };

            _mockCategoryService.Setup(s => s.UpdateCategoryAsync(categoryId, request, "testuser"))
                .ThrowsAsync(new ArgumentException("Category not found"));

            // Act
            var result = await _controller.UpdateCategory(categoryId, request);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.NotNull(notFoundResult.Value);
        }

        [Fact]
        public async Task UpdateCategory_DuplicateName_ReturnsConflict()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var request = new UpdateCategoryRequest
            {
                Name = "Existing Category",
                IsActive = true
            };

            _mockCategoryService.Setup(s => s.UpdateCategoryAsync(categoryId, request, "testuser"))
                .ThrowsAsync(new InvalidOperationException("Category name 'Existing Category' already exists"));

            // Act
            var result = await _controller.UpdateCategory(categoryId, request);

            // Assert
            var conflictResult = Assert.IsType<ConflictObjectResult>(result.Result);
            Assert.NotNull(conflictResult.Value);
        }

        [Fact]
        public async Task UpdateCategory_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var request = new UpdateCategoryRequest
            {
                Name = "Updated Category",
                IsActive = true
            };

            _mockCategoryService.Setup(s => s.UpdateCategoryAsync(categoryId, request, "testuser"))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.UpdateCategory(categoryId, request);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        #endregion

        #region DELETE Endpoint Tests

        [Fact]
        public async Task DeleteCategory_ExistingCategory_ReturnsNoContent()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.DeleteCategoryAsync(categoryId))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.DeleteCategory(categoryId);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteCategory_CategoryNotFound_ReturnsNotFound()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.DeleteCategoryAsync(categoryId))
                .ReturnsAsync(false);

            // Act
            var result = await _controller.DeleteCategory(categoryId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.NotNull(notFoundResult.Value);
        }

        [Fact]
        public async Task DeleteCategory_CategoryInUse_ReturnsUnprocessableEntity()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.DeleteCategoryAsync(categoryId))
                .ThrowsAsync(new InvalidOperationException("Cannot delete category because it is used in existing transactions"));

            // Act
            var result = await _controller.DeleteCategory(categoryId);

            // Assert
            var unprocessableResult = Assert.IsType<UnprocessableEntityObjectResult>(result);
            Assert.NotNull(unprocessableResult.Value);
        }

        [Fact]
        public async Task DeleteCategory_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.DeleteCategoryAsync(categoryId))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.DeleteCategory(categoryId);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        #endregion

        #region PATCH Endpoint Tests

        [Fact]
        public async Task ToggleActiveStatus_ExistingCategory_ReturnsOkWithUpdatedCategory()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var updatedCategory = new CategoryDto
            {
                Id = categoryId,
                Name = "Test Category",
                IsActive = false // Toggled to inactive
            };

            _mockCategoryService.Setup(s => s.ToggleActiveStatusAsync(categoryId, "testuser"))
                .ReturnsAsync(updatedCategory);

            // Act
            var result = await _controller.ToggleActiveStatus(categoryId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedCategory = Assert.IsType<CategoryDto>(okResult.Value);
            Assert.Equal(categoryId, returnedCategory.Id);
            Assert.False(returnedCategory.IsActive);
        }

        [Fact]
        public async Task ToggleActiveStatus_CategoryNotFound_ReturnsNotFound()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.ToggleActiveStatusAsync(categoryId, "testuser"))
                .ThrowsAsync(new ArgumentException("Category not found"));

            // Act
            var result = await _controller.ToggleActiveStatus(categoryId);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.NotNull(notFoundResult.Value);
        }

        [Fact]
        public async Task ToggleActiveStatus_CategoryInUse_ReturnsUnprocessableEntity()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.ToggleActiveStatusAsync(categoryId, "testuser"))
                .ThrowsAsync(new InvalidOperationException("Cannot deactivate category because it is used in existing transactions"));

            // Act
            var result = await _controller.ToggleActiveStatus(categoryId);

            // Assert
            var unprocessableResult = Assert.IsType<UnprocessableEntityObjectResult>(result.Result);
            Assert.NotNull(unprocessableResult.Value);
        }

        [Fact]
        public async Task ToggleActiveStatus_ServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            _mockCategoryService.Setup(s => s.ToggleActiveStatusAsync(categoryId, "testuser"))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await _controller.ToggleActiveStatus(categoryId);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
        }

        #endregion

        #region Service Method Call Verification Tests

        [Fact]
        public async Task CreateCategory_CallsServiceWithCorrectParameters()
        {
            // Arrange
            var request = new CreateCategoryRequest
            {
                Name = "Test Category",
                Type = CategoryType.Credit
            };

            var createdCategory = new CategoryDto { Id = Guid.NewGuid() };
            _mockCategoryService.Setup(s => s.CreateCategoryAsync(request, "testuser"))
                .ReturnsAsync(createdCategory);

            // Act
            await _controller.CreateCategory(request);

            // Assert
            _mockCategoryService.Verify(s => s.CreateCategoryAsync(request, "testuser"), Times.Once);
        }

        [Fact]
        public async Task UpdateCategory_CallsServiceWithCorrectParameters()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var request = new UpdateCategoryRequest
            {
                Name = "Updated Category",
                IsActive = true
            };

            var updatedCategory = new CategoryDto { Id = categoryId };
            _mockCategoryService.Setup(s => s.UpdateCategoryAsync(categoryId, request, "testuser"))
                .ReturnsAsync(updatedCategory);

            // Act
            await _controller.UpdateCategory(categoryId, request);

            // Assert
            _mockCategoryService.Verify(s => s.UpdateCategoryAsync(categoryId, request, "testuser"), Times.Once);
        }

        [Fact]
        public async Task ToggleActiveStatus_CallsServiceWithCorrectParameters()
        {
            // Arrange
            var categoryId = Guid.NewGuid();
            var updatedCategory = new CategoryDto { Id = categoryId };
            _mockCategoryService.Setup(s => s.ToggleActiveStatusAsync(categoryId, "testuser"))
                .ReturnsAsync(updatedCategory);

            // Act
            await _controller.ToggleActiveStatus(categoryId);

            // Assert
            _mockCategoryService.Verify(s => s.ToggleActiveStatusAsync(categoryId, "testuser"), Times.Once);
        }

        #endregion
    }
}