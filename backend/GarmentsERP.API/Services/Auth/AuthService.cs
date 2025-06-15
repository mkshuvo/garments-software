using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models;
using GarmentsERP.API.Services;
using System.Security.Claims;

namespace GarmentsERP.API.Services.Auth
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterDto registerDto);
        Task<AuthResult> LoginAsync(LoginDto loginDto);
        Task<UserInfoDto?> GetProfileAsync(string userId);
        Task<AuthResult> UpdateProfileAsync(string userId, UpdateProfileDto updateDto);
        Task<AuthResult> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<List<RoleInfoDto>> GetRolesAsync();
    }

    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IJwtService _jwtService;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<ApplicationRole> roleManager,
            IJwtService jwtService,
            ILogger<AuthService> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _logger = logger;
        }

        public async Task<AuthResult> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    return AuthResult.Failed("User with this email already exists.");
                }

                existingUser = await _userManager.FindByNameAsync(registerDto.Username);
                if (existingUser != null)
                {
                    return AuthResult.Failed("Username is already taken.");
                }

                // Check if role exists
                if (!await _roleManager.RoleExistsAsync(registerDto.Role))
                {
                    return AuthResult.Failed("Invalid role specified.");
                }

                // Create user
                var user = new ApplicationUser
                {
                    UserName = registerDto.Username,
                    Email = registerDto.Email,
                    FullName = registerDto.FullName,
                    ContactNumber = registerDto.ContactNumber,
                    EmailConfirmed = true // For demo purposes, set to true
                };

                var result = await _userManager.CreateAsync(user, registerDto.Password);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return AuthResult.Failed($"User creation failed: {errors}");
                }

                // Assign role
                await _userManager.AddToRoleAsync(user, registerDto.Role);

                _logger.LogInformation($"User {user.Email} registered successfully with role {registerDto.Role}");

                return AuthResult.Success("User registered successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during user registration");
                return AuthResult.Failed("An error occurred during registration.");
            }
        }

        public async Task<AuthResult> LoginAsync(LoginDto loginDto)
        {
            try
            {
                // Find user by email or username
                var user = await _userManager.FindByEmailAsync(loginDto.EmailOrUsername) ??
                          await _userManager.FindByNameAsync(loginDto.EmailOrUsername);

                if (user == null)
                {
                    return AuthResult.Failed("Invalid credentials.");
                }

                if (!user.IsActive)
                {
                    return AuthResult.Failed("Account is deactivated.");
                }

                // Check password
                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

                if (!result.Succeeded)
                {
                    return AuthResult.Failed("Invalid credentials.");
                }

                // Get user roles
                var roles = await _userManager.GetRolesAsync(user);

                // Generate JWT token
                var token = _jwtService.GenerateToken(user, roles);

                var response = new LoginResponseDto
                {
                    Token = token,
                    Expiration = DateTime.UtcNow.AddHours(24), // Should match JWT expiration
                    User = new UserInfoDto
                    {
                        Id = user.Id,
                        Username = user.UserName!,
                        Email = user.Email!,
                        FullName = user.FullName,
                        ContactNumber = user.ContactNumber,
                        Roles = roles.ToList(),
                        IsActive = user.IsActive,
                        CreatedAt = user.CreatedAt
                    }
                };

                _logger.LogInformation($"User {user.Email} logged in successfully");

                return AuthResult.Success("Login successful.", response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during login");
                return AuthResult.Failed("An error occurred during login.");
            }
        }

        public async Task<UserInfoDto?> GetProfileAsync(string userId)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return null;
                }

                var roles = await _userManager.GetRolesAsync(user);

                return new UserInfoDto
                {
                    Id = user.Id,
                    Username = user.UserName!,
                    Email = user.Email!,
                    FullName = user.FullName,
                    ContactNumber = user.ContactNumber,
                    Roles = roles.ToList(),
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching user profile");
                return null;
            }
        }

        public async Task<AuthResult> UpdateProfileAsync(string userId, UpdateProfileDto updateDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return AuthResult.Failed("User not found.");
                }

                user.FullName = updateDto.FullName;
                user.ContactNumber = updateDto.ContactNumber;

                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return AuthResult.Failed($"Profile update failed: {errors}");
                }

                return AuthResult.Success("Profile updated successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user profile");
                return AuthResult.Failed("An error occurred while updating profile.");
            }
        }

        public async Task<AuthResult> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return AuthResult.Failed("User not found.");
                }

                var result = await _userManager.ChangePasswordAsync(user, 
                    changePasswordDto.CurrentPassword, 
                    changePasswordDto.NewPassword);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return AuthResult.Failed($"Password change failed: {errors}");
                }

                return AuthResult.Success("Password changed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while changing password");
                return AuthResult.Failed("An error occurred while changing password.");
            }
        }

        public async Task<List<RoleInfoDto>> GetRolesAsync()
        {
            try
            {
                var roles = await _roleManager.Roles
                    .Select(r => new RoleInfoDto { Id = r.Id, Name = r.Name!, Description = r.Description })
                    .ToListAsync();

                return roles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching roles");
                return new List<RoleInfoDto>();
            }
        }
    }    public class AuthResult
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }

        public static AuthResult Success(string message, object? data = null)
        {
            return new AuthResult { IsSuccess = true, Message = message, Data = data };
        }

        public static AuthResult Failed(string message)
        {
            return new AuthResult { IsSuccess = false, Message = message };
        }
    }

    public class RoleInfoDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
