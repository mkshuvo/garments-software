using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminSetupController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminSetupController> _logger;

        public AdminSetupController(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            ApplicationDbContext context,
            ILogger<AdminSetupController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
            _logger = logger;
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] AdminSetupRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new { error = "Username and password are required" });
                }

                // Validate password requirements
                if (request.Password.Length < 6)
                {
                    return BadRequest(new { error = "Password must be at least 6 characters long" });
                }

                if (!request.Password.Any(char.IsUpper) || !request.Password.Any(char.IsLower) || !request.Password.Any(char.IsDigit))
                {
                    return BadRequest(new { error = "Password must contain at least one uppercase letter, one lowercase letter, and one digit" });
                }

                // Check if Admin role exists first, then check for existing admin users
                if (await _roleManager.RoleExistsAsync("Admin"))
                {
                    var existingAdmins = await _userManager.GetUsersInRoleAsync("Admin");
                    if (existingAdmins.Any())
                    {
                        return BadRequest(new { error = "Admin users already exist. This endpoint is for initial setup only." });
                    }
                }

                // Check if username/email already exists
                var existingUser = await _userManager.FindByNameAsync(request.Username);
                if (existingUser != null)
                {
                    return BadRequest(new { error = $"User with username '{request.Username}' already exists" });
                }

                var email = request.Email ?? $"{request.Username}@company.com";
                var existingEmailUser = await _userManager.FindByEmailAsync(email);
                if (existingEmailUser != null)
                {
                    return BadRequest(new { error = $"User with email '{email}' already exists" });
                }

                // Ensure Admin role exists
                if (!await _roleManager.RoleExistsAsync("Admin"))
                {
                    var adminRole = new ApplicationRole
                    {
                        Name = "Admin",
                        Description = "System Administrator with full access"
                    };
                    var roleResult = await _roleManager.CreateAsync(adminRole);
                    if (!roleResult.Succeeded)
                    {
                        return BadRequest(new { error = "Failed to create Admin role", details = roleResult.Errors });
                    }
                }

                // Create admin user
                var adminUser = new ApplicationUser
                {
                    UserName = request.Username,
                    Email = email,
                    FullName = request.FullName ?? "System Administrator",
                    EmailConfirmed = true,
                    IsActive = true,
                    UserType = UserType.Employee
                };

                var userResult = await _userManager.CreateAsync(adminUser, request.Password);
                if (!userResult.Succeeded)
                {
                    var errors = string.Join(", ", userResult.Errors.Select(e => e.Description));
                    return BadRequest(new { error = "Failed to create user", details = errors });
                }

                // Add user to Admin role
                var roleAssignResult = await _userManager.AddToRoleAsync(adminUser, "Admin");
                if (!roleAssignResult.Succeeded)
                {
                    var errors = string.Join(", ", roleAssignResult.Errors.Select(e => e.Description));
                    return BadRequest(new { error = "Failed to assign Admin role", details = errors });
                }

                _logger.LogInformation("Admin user '{Username}' created successfully", request.Username);

                return Ok(new
                {
                    message = "Admin user created successfully",
                    username = request.Username,
                    email = email,
                    userId = adminUser.Id.ToString()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create admin user");
                return StatusCode(500, new { error = "Internal server error", details = ex.Message });
            }
        }
    }

    public class AdminSetupRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? FullName { get; set; }
    }
}
