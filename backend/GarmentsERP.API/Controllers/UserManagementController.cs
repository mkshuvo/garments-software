using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using GarmentsERP.API.DTOs.Users;
using GarmentsERP.API.Models.Users;
using GarmentsERP.API.Services.Users;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserManagementController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;
        private readonly ILogger<UserManagementController> _logger;

        public UserManagementController(
            IUserManagementService userManagementService,
            ILogger<UserManagementController> logger)
        {
            _userManagementService = userManagementService;
            _logger = logger;
        }        /// <summary>
        /// Create a new user (Admin/Manager only)
        /// </summary>
        [HttpPost("create")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get current user roles for validation
            var currentUserRoles = User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();

            // Validate business rules for user creation
            var validationResult = _userManagementService.ValidateUserCreationRules(request, currentUserRoles);
            if (!validationResult.IsValid)
            {
                return BadRequest(new { message = validationResult.ErrorMessage });
            }

            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";
            var result = await _userManagementService.CreateUserAsync(request, currentUserEmail);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return CreatedAtAction(nameof(GetUser), new { id = result.User!.Id }, result.User);
        }        /// <summary>
        /// Get user by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUser(Guid id)
        {
            // Get current user ID and roles
            var currentUserIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
            {
                return Unauthorized();
            }

            var currentUserRoles = User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();

            // Check if user can access this profile
            if (!_userManagementService.CanUserAccessProfile(currentUserId, id, currentUserRoles))
            {
                return Forbid("You can only view your own profile");
            }

            var result = await _userManagementService.GetUserByIdAsync(id);

            if (!result.Success)
            {
                return NotFound(new { message = result.Message });
            }

            return Ok(result.User);
        }

        /// <summary>
        /// Get users by type with pagination (Admin/Manager only)
        /// </summary>
        [HttpGet("type/{userType}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetUsersByType(
            UserType userType,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1 || pageSize > 100)
            {
                return BadRequest("Invalid pagination parameters");
            }

            var result = await _userManagementService.GetUsersByTypeAsync(userType, page, pageSize);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new
            {
                users = result.Users,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount = result.Users.Count
                }
            });
        }

        /// <summary>
        /// Get all employees (Admin/Manager only)
        /// </summary>
        [HttpGet("employees")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetEmployees([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            return await GetUsersByType(UserType.Employee, page, pageSize);
        }

        /// <summary>
        /// Get all customers (Admin/Manager/Sales only)
        /// </summary>
        [HttpGet("customers")]
        [Authorize(Roles = "Admin,Manager,Sales")]
        public async Task<IActionResult> GetCustomers([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            return await GetUsersByType(UserType.Customer, page, pageSize);
        }

        /// <summary>
        /// Get all vendors (Admin/Manager/Procurement only)
        /// </summary>
        [HttpGet("vendors")]
        [Authorize(Roles = "Admin,Manager,Procurement")]
        public async Task<IActionResult> GetVendors([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            return await GetUsersByType(UserType.Vendor, page, pageSize);
        }

        /// <summary>
        /// Deactivate a user (Admin only)
        /// </summary>
        [HttpPut("{id}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";
            var result = await _userManagementService.DeactivateUserAsync(id, currentUserEmail);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Reactivate a user (Admin only)
        /// </summary>
        [HttpPut("{id}/reactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReactivateUser(Guid id)
        {
            var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";
            var result = await _userManagementService.ReactivateUserAsync(id, currentUserEmail);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        /// <summary>
        /// Login endpoint
        /// </summary>
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userManagementService.LoginAsync(request);

            if (!result.Success)
            {
                return Unauthorized(new { message = result.Message });
            }

            return Ok(result.Response);
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var currentUserId = GetCurrentUserId();
            return await GetUser(currentUserId);
        }

        // Private helper methods
        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
        }    }
}
