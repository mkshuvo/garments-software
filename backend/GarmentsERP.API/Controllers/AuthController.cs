using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Services.Interfaces;
using GarmentsERP.API.Interfaces;
using System.Security.Claims;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IPermissionSeederService _permissionSeederService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            IPermissionSeederService permissionSeederService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _permissionSeederService = permissionSeederService;
            _logger = logger;
        }        [HttpPost("setup-admin")]
        public async Task<IActionResult> SetupAdmin(RegisterDto registerDto)
        {
            try
            {
                _logger.LogInformation("Admin setup process initiated for email: {Email}", registerDto.Email);

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Admin setup failed due to invalid model state");
                    return BadRequest(new { 
                        message = "Invalid input data provided.",
                        errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }

                // Check if any admin users already exist
                var existingAdmins = await _authService.GetUsersByRoleAsync("Admin");
                if (existingAdmins.Any())
                {
                    _logger.LogWarning("Admin setup attempted but admin user already exists");
                    return BadRequest(new { 
                        message = "Admin user already exists. Use regular registration.",
                        code = "ADMIN_EXISTS"
                    });
                }

                // Step 1: Ensure all permissions and role assignments are properly seeded
                _logger.LogInformation("Seeding permissions and role assignments before admin creation");
                await _permissionSeederService.SeedPermissionsAndRoleAssignmentsAsync();

                // Step 2: Force admin role for first admin setup
                registerDto.Role = "Admin";
                
                _logger.LogInformation("Creating admin user with email: {Email}", registerDto.Email);
                var result = await _authService.RegisterAsync(registerDto);

                if (result.IsSuccess)
                {
                    _logger.LogInformation("Admin user created successfully: {Email}", registerDto.Email);
                    
                    // Step 3: Verify admin user has all necessary permissions
                    var adminUsers = await _authService.GetUsersByRoleAsync("Admin");
                    var createdAdmin = adminUsers.FirstOrDefault(u => u.Email == registerDto.Email);
                    
                    if (createdAdmin != null)
                    {
                        _logger.LogInformation("Admin setup completed successfully for user ID: {UserId}", createdAdmin.Id);
                        return Ok(new { 
                            message = "First admin user created successfully. You can now login.",
                            adminId = createdAdmin.Id,
                            email = createdAdmin.Email
                        });
                    }
                    else
                    {
                        _logger.LogError("Admin user created but could not be retrieved for verification");
                        return Ok(new { message = "Admin user created successfully. You can now login." });
                    }
                }

                _logger.LogError("Admin user creation failed: {Message}", result.Message);
                return BadRequest(new { 
                    message = $"Failed to create admin user: {result.Message}",
                    code = "ADMIN_CREATION_FAILED"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred during admin setup for email: {Email}", registerDto.Email);
                return StatusCode(500, new { 
                    message = "An unexpected error occurred during admin setup. Please try again.",
                    code = "ADMIN_SETUP_ERROR"
                });
            }
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(registerDto);

            if (result.IsSuccess)
            {
                return Ok(new { message = result.Message });
            }

            return BadRequest(new { message = result.Message });
        }        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(loginDto);

            if (result.IsSuccess)
            {
                return Ok(result.Data);
            }

            return Unauthorized(new { message = result.Message });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var userInfo = await _authService.GetProfileAsync(userId);
            if (userInfo == null)
            {
                return NotFound(new { message = "User not found." });
            }

            return Ok(userInfo);
        }        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var result = await _authService.UpdateProfileAsync(userId, updateDto);

            if (result.IsSuccess)
            {
                return Ok(new { message = result.Message });
            }

            return BadRequest(new { message = result.Message });
        }        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);

            if (result.IsSuccess)
            {
                return Ok(new { message = result.Message });
            }

            return BadRequest(new { message = result.Message });
        }

        [HttpGet("roles")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _authService.GetRolesAsync();
            return Ok(roles);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userInfo = await _authService.GetCurrentUserAsync(User);
                if (userInfo == null)
                {
                    _logger.LogWarning("Current user not found");
                    return NotFound(new { message = "User not found" });
                }

                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching current user");
                return StatusCode(500, new { message = "An error occurred while fetching user information" });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.Token))
                {
                    return BadRequest(new { message = "Token is required" });
                }

                var result = await _authService.RefreshTokenAsync(request.Token);

                if (result.IsSuccess)
                {
                    return Ok(result.Data);
                }

                return Unauthorized(new { message = result.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during token refresh");
                return StatusCode(500, new { message = "An error occurred during token refresh" });
            }
        }
    }
}
