using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Models;
using GarmentsERP.API.Services.Interfaces;
using System.Security.Claims;

namespace GarmentsERP.API.Services.Auth
{
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

        public async Task<DTOs.AuthResult> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
                if (existingUser != null)
                {
                    return DTOs.AuthResult.Failed("User with this email already exists.");
                }

                existingUser = await _userManager.FindByNameAsync(registerDto.Username);
                if (existingUser != null)
                {
                    return DTOs.AuthResult.Failed("Username is already taken.");
                }

                // Check if role exists
                if (!await _roleManager.RoleExistsAsync(registerDto.Role))
                {
                    return DTOs.AuthResult.Failed("Invalid role specified.");
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
                    return DTOs.AuthResult.Failed($"User creation failed: {errors}");
                }

                // Assign role
                await _userManager.AddToRoleAsync(user, registerDto.Role);

                _logger.LogInformation($"User {user.Email} registered successfully with role {registerDto.Role}");

                return DTOs.AuthResult.Success("User registered successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during user registration");
                return DTOs.AuthResult.Failed("An error occurred during registration.");
            }
        }        public async Task<DTOs.AuthResult> LoginAsync(LoginDto loginDto)
        {
            try
            {
                _logger.LogInformation($"Login attempt for: {loginDto.EmailOrUsername}");

                // Find user by email or username
                var userByEmail = await _userManager.FindByEmailAsync(loginDto.EmailOrUsername);
                _logger.LogInformation($"User found by email: {userByEmail != null}");
                if (userByEmail != null)
                {
                    _logger.LogInformation($"Found user by email - Username: {userByEmail.UserName}, Email: {userByEmail.Email}");
                }

                var userByUsername = await _userManager.FindByNameAsync(loginDto.EmailOrUsername);
                _logger.LogInformation($"User found by username: {userByUsername != null}");
                if (userByUsername != null)
                {
                    _logger.LogInformation($"Found user by username - Username: {userByUsername.UserName}, Email: {userByUsername.Email}");
                }

                var user = userByEmail ?? userByUsername;

                if (user == null)
                {
                    _logger.LogWarning($"No user found for: {loginDto.EmailOrUsername}");
                    // Let's also try a direct database query to see if the user exists
                    var allUsers = await _userManager.Users.ToListAsync();
                    _logger.LogInformation($"Total users in database: {allUsers.Count}");
                    foreach (var u in allUsers)
                    {
                        _logger.LogInformation($"User: {u.UserName}, Email: {u.Email}, NormalizedEmail: {u.NormalizedEmail}");
                    }
                    return DTOs.AuthResult.Failed("Invalid credentials.");
                }
                if (!user.IsActive)
                {
                    return DTOs.AuthResult.Failed("Account is deactivated.");
                }

                // Check password
                var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false); if (!result.Succeeded)
                {
                    return DTOs.AuthResult.Failed("Invalid credentials.");
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

                return DTOs.AuthResult.Success("Login successful.", response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during login");
                return DTOs.AuthResult.Failed("An error occurred during login.");
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
        public async Task<DTOs.AuthResult> UpdateProfileAsync(string userId, UpdateProfileDto updateDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return DTOs.AuthResult.Failed("User not found.");
                }

                user.FullName = updateDto.FullName;
                user.ContactNumber = updateDto.ContactNumber;

                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return DTOs.AuthResult.Failed($"Profile update failed: {errors}");
                }

                return DTOs.AuthResult.Success("Profile updated successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating user profile");
                return DTOs.AuthResult.Failed("An error occurred while updating profile.");
            }
        }
        public async Task<DTOs.AuthResult> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return DTOs.AuthResult.Failed("User not found.");
                }

                var result = await _userManager.ChangePasswordAsync(user,
                    changePasswordDto.CurrentPassword,
                    changePasswordDto.NewPassword);

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    return DTOs.AuthResult.Failed($"Password change failed: {errors}");
                }

                return DTOs.AuthResult.Success("Password changed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while changing password");
                return DTOs.AuthResult.Failed("An error occurred while changing password.");
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

        public async Task<List<UserInfoDto>> GetUsersByRoleAsync(string roleName)
        {
            try
            {
                var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);
                
                return usersInRole.Select(u => new UserInfoDto
                {
                    Id = u.Id,
                    Username = u.UserName!,
                    Email = u.Email!,
                    FullName = u.FullName,
                    ContactNumber = u.ContactNumber,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    Roles = new List<string> { roleName }
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching users by role");
                return new List<UserInfoDto>();
            }
        }
    }
}
