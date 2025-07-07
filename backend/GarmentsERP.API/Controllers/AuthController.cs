using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Services.Auth;
using GarmentsERP.API.Services.Interfaces;
using System.Security.Claims;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }        [HttpPost("setup-admin")]
        public async Task<IActionResult> SetupAdmin(RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if any admin users already exist
            var existingAdmins = await _authService.GetUsersByRoleAsync("Admin");
            if (existingAdmins.Any())
            {
                return BadRequest(new { message = "Admin user already exists. Use regular registration." });
            }

            // Force admin role for first admin setup
            registerDto.Role = "Admin";
            var result = await _authService.RegisterAsync(registerDto);

            if (result.IsSuccess)
            {
                return Ok(new { message = "First admin user created successfully. You can now login." });
            }

            return BadRequest(new { message = result.Message });
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
    }
}
