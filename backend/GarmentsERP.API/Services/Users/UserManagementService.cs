using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;
using GarmentsERP.API.DTOs.Users;
using GarmentsERP.API.Services.Interfaces;

namespace GarmentsERP.API.Services.Users
{
    public class UserManagementService : IUserManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IJwtService _jwtService;
        private readonly ILogger<UserManagementService> _logger;

        public UserManagementService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IJwtService jwtService,
            ILogger<UserManagementService> logger)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, UserResponseDto? User)> CreateUserAsync(CreateUserRequestDto request, string createdBy)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Check if user already exists
                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return (false, "User with this email already exists", null);
                }

                // Validate role exists
                var roleExists = await _roleManager.RoleExistsAsync(request.RoleName);
                if (!roleExists)
                {
                    return (false, $"Role '{request.RoleName}' does not exist", null);
                }

                // Create user
                var user = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = request.Email,
                    Email = request.Email,
                    FullName = request.FullName,
                    ContactNumber = request.ContactNumber,
                    UserType = request.UserType,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                var result = await _userManager.CreateAsync(user, request.Password);
                if (!result.Succeeded)
                {
                    return (false, string.Join(", ", result.Errors.Select(e => e.Description)), null);
                }

                // Assign role
                await _userManager.AddToRoleAsync(user, request.RoleName);

                // Create appropriate profile based on user type
                switch (request.UserType)
                {
                    case UserType.Employee:
                        if (request.EmployeeProfile == null)
                        {
                            await _userManager.DeleteAsync(user);
                            return (false, "Employee profile data is required for employee users", null);
                        }
                        await CreateEmployeeProfileAsync(user.Id, request.EmployeeProfile);
                        break;

                    case UserType.Customer:
                        if (request.CustomerProfile == null)
                        {
                            await _userManager.DeleteAsync(user);
                            return (false, "Customer profile data is required for customer users", null);
                        }
                        await CreateCustomerProfileAsync(user.Id, request.CustomerProfile);
                        break;

                    case UserType.Vendor:
                        if (request.VendorProfile == null)
                        {
                            await _userManager.DeleteAsync(user);
                            return (false, "Vendor profile data is required for vendor users", null);
                        }
                        await CreateVendorProfileAsync(user.Id, request.VendorProfile);
                        break;
                }

                await transaction.CommitAsync();

                _logger.LogInformation("User {Email} created successfully by {CreatedBy}", request.Email, createdBy);

                var userResponse = await GetUserByIdAsync(user.Id);
                return (true, "User created successfully", userResponse.User);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating user {Email}", request.Email);
                return (false, "An error occurred while creating the user", null);
            }
        }

        public async Task<(bool Success, string Message, UserResponseDto? User)> GetUserByIdAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users
                    .Include(u => u.EmployeeProfile)
                    .Include(u => u.CustomerProfile)
                    .Include(u => u.VendorProfile)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return (false, "User not found", null);
                }

                var roles = await _userManager.GetRolesAsync(user);

                var userResponse = new UserResponseDto
                {
                    Id = user.Id,
                    Email = user.Email!,
                    FullName = user.FullName,
                    ContactNumber = user.ContactNumber,
                    UserType = user.UserType,
                    Roles = roles.ToList(),
                    CreatedAt = user.CreatedAt,
                    LastLoginAt = user.LastLoginAt,
                    IsActive = user.IsActive
                };

                // Map profile data based on user type
                switch (user.UserType)
                {
                    case UserType.Employee:
                        if (user.EmployeeProfile != null)
                        {
                            userResponse.EmployeeProfile = MapEmployeeProfile(user.EmployeeProfile);
                        }
                        break;

                    case UserType.Customer:
                        if (user.CustomerProfile != null)
                        {
                            userResponse.CustomerProfile = MapCustomerProfile(user.CustomerProfile);
                        }
                        break;

                    case UserType.Vendor:
                        if (user.VendorProfile != null)
                        {
                            userResponse.VendorProfile = MapVendorProfile(user.VendorProfile);
                        }
                        break;
                }

                return (true, "User found", userResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {UserId}", userId);
                return (false, "An error occurred while retrieving the user", null);
            }
        }

        public async Task<(bool Success, string Message, List<UserResponseDto> Users)> GetUsersByTypeAsync(UserType userType, int page = 1, int pageSize = 10)
        {
            try
            {
                var query = _context.Users
                    .Include(u => u.EmployeeProfile)
                    .Include(u => u.CustomerProfile)
                    .Include(u => u.VendorProfile)
                    .Where(u => u.UserType == userType)
                    .OrderBy(u => u.FullName);

                var users = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var userResponses = new List<UserResponseDto>();

                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    var userResponse = new UserResponseDto
                    {
                        Id = user.Id,
                        Email = user.Email!,
                        FullName = user.FullName,
                        ContactNumber = user.ContactNumber,
                        UserType = user.UserType,
                        Roles = roles.ToList(),
                        CreatedAt = user.CreatedAt,
                        LastLoginAt = user.LastLoginAt,
                        IsActive = user.IsActive
                    };

                    // Map profile data based on user type
                    switch (user.UserType)
                    {
                        case UserType.Employee:
                            if (user.EmployeeProfile != null)
                            {
                                userResponse.EmployeeProfile = MapEmployeeProfile(user.EmployeeProfile);
                            }
                            break;

                        case UserType.Customer:
                            if (user.CustomerProfile != null)
                            {
                                userResponse.CustomerProfile = MapCustomerProfile(user.CustomerProfile);
                            }
                            break;

                        case UserType.Vendor:
                            if (user.VendorProfile != null)
                            {
                                userResponse.VendorProfile = MapVendorProfile(user.VendorProfile);
                            }
                            break;
                    }

                    userResponses.Add(userResponse);
                }

                return (true, "Users retrieved successfully", userResponses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users by type {UserType}", userType);
                return (false, "An error occurred while retrieving users", new List<UserResponseDto>());
            }
        }

        public async Task<(bool Success, string Message)> DeactivateUserAsync(Guid userId, string deactivatedBy)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                {
                    return (false, "User not found");
                }

                user.IsActive = false;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    _logger.LogInformation("User {UserId} deactivated by {DeactivatedBy}", userId, deactivatedBy);
                    return (true, "User deactivated successfully");
                }

                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating user {UserId}", userId);
                return (false, "An error occurred while deactivating the user");
            }
        }

        public async Task<(bool Success, string Message)> ReactivateUserAsync(Guid userId, string reactivatedBy)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null)
                {
                    return (false, "User not found");
                }

                user.IsActive = true;
                user.UpdatedAt = DateTime.UtcNow;

                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    _logger.LogInformation("User {UserId} reactivated by {ReactivatedBy}", userId, reactivatedBy);
                    return (true, "User reactivated successfully");
                }

                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating user {UserId}", userId);
                return (false, "An error occurred while reactivating the user");
            }
        }

        public async Task<(bool Success, string Message, LoginResponseDto? Response)> LoginAsync(LoginRequestDto request)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null || !user.IsActive)
                {
                    return (false, "Invalid email or password", null);
                }

                var result = await _userManager.CheckPasswordAsync(user, request.Password);
                if (!result)
                {
                    return (false, "Invalid email or password", null);
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);

                // Generate JWT token
                var roles = await _userManager.GetRolesAsync(user);
                var token = _jwtService.GenerateToken(user, roles);

                var userResult = await GetUserByIdAsync(user.Id);

                var response = new LoginResponseDto
                {
                    Token = token,
                    Expiration = DateTime.UtcNow.AddHours(24), // This should match your JWT expiration
                    User = userResult.User!
                };

                _logger.LogInformation("User {Email} logged in successfully", request.Email);

                return (true, "Login successful", response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for {Email}", request.Email);
                return (false, "An error occurred during login", null);
            }
        }

        public async Task<bool> ValidateUserPermissionsAsync(Guid userId, string requiredRole)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(userId.ToString());
                if (user == null || !user.IsActive)
                {
                    return false;
                }

                return await _userManager.IsInRoleAsync(user, requiredRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating permissions for user {UserId}", userId);
                return false;
            }
        }

        // Private helper methods
        private async Task CreateEmployeeProfileAsync(Guid userId, CreateEmployeeProfileDto dto)
        {
            var profile = new EmployeeProfile
            {
                UserId = userId,
                UserType = UserType.Employee,
                EmployeeId = dto.EmployeeId,
                Department = dto.Department,
                Position = dto.Position,
                HireDate = dto.HireDate,
                Salary = dto.Salary,
                EmploymentType = dto.EmploymentType,
                ReportsTo = dto.ReportsTo,
                ShiftType = dto.ShiftType,
                IsManager = dto.IsManager,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                ZipCode = dto.ZipCode,
                Country = dto.Country
            };

            _context.EmployeeProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        private async Task CreateCustomerProfileAsync(Guid userId, CreateCustomerProfileDto dto)
        {
            var profile = new CustomerProfile
            {
                UserId = userId,
                UserType = UserType.Customer,
                CustomerId = dto.CustomerId,
                CompanyName = dto.CompanyName,
                ContactPersonName = dto.ContactPersonName,
                Industry = dto.Industry,
                TaxId = dto.TaxId,
                CustomerType = dto.CustomerType,
                CreditLimit = dto.CreditLimit,
                PaymentTerms = dto.PaymentTerms,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                ZipCode = dto.ZipCode,
                Country = dto.Country
            };

            _context.CustomerProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        private async Task CreateVendorProfileAsync(Guid userId, CreateVendorProfileDto dto)
        {
            var profile = new VendorProfile
            {
                UserId = userId,
                UserType = UserType.Vendor,
                VendorId = dto.VendorId,
                CompanyName = dto.CompanyName,
                ContactPersonName = dto.ContactPersonName,
                Industry = dto.Industry,
                TaxId = dto.TaxId,
                VendorType = dto.VendorType,
                PaymentTerms = dto.PaymentTerms,
                BankAccount = dto.BankAccount,
                BankName = dto.BankName,
                IsPreferred = dto.IsPreferred,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                ZipCode = dto.ZipCode,
                Country = dto.Country
            };

            _context.VendorProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        private static EmployeeProfileDto MapEmployeeProfile(EmployeeProfile profile)
        {
            return new EmployeeProfileDto
            {
                Id = profile.Id,
                EmployeeId = profile.EmployeeId,
                Department = profile.Department,
                Position = profile.Position,
                HireDate = profile.HireDate,
                TerminationDate = profile.TerminationDate,
                Salary = profile.Salary,
                EmploymentType = profile.EmploymentType,
                ReportsTo = profile.ReportsTo,
                ShiftType = profile.ShiftType,
                IsManager = profile.IsManager,
                Address = profile.Address,
                City = profile.City,
                State = profile.State,
                ZipCode = profile.ZipCode,
                Country = profile.Country
            };
        }

        private static CustomerProfileDto MapCustomerProfile(CustomerProfile profile)
        {
            return new CustomerProfileDto
            {
                Id = profile.Id,
                CustomerId = profile.CustomerId,
                CompanyName = profile.CompanyName,
                ContactPersonName = profile.ContactPersonName,
                Industry = profile.Industry,
                TaxId = profile.TaxId,
                CustomerType = profile.CustomerType,
                CreditLimit = profile.CreditLimit,
                CurrentBalance = profile.CurrentBalance,
                PaymentTerms = profile.PaymentTerms,
                LastOrderDate = profile.LastOrderDate,
                IsBlacklisted = profile.IsBlacklisted,
                Address = profile.Address,
                City = profile.City,
                State = profile.State,
                ZipCode = profile.ZipCode,
                Country = profile.Country
            };
        }

        private static VendorProfileDto MapVendorProfile(VendorProfile profile)
        {
            return new VendorProfileDto
            {
                Id = profile.Id,
                VendorId = profile.VendorId,
                CompanyName = profile.CompanyName,
                ContactPersonName = profile.ContactPersonName,
                Industry = profile.Industry,
                TaxId = profile.TaxId,
                VendorType = profile.VendorType,
                PaymentTerms = profile.PaymentTerms,
                CurrentBalance = profile.CurrentBalance,
                LastPurchaseDate = profile.LastPurchaseDate,
                BankAccount = profile.BankAccount,
                BankName = profile.BankName,
                IsPreferred = profile.IsPreferred,
                IsBlacklisted = profile.IsBlacklisted,
                QualityRating = profile.QualityRating,
                DeliveryRating = profile.DeliveryRating,
                ServiceRating = profile.ServiceRating,
                Address = profile.Address,
                City = profile.City,
                State = profile.State,
                ZipCode = profile.ZipCode,
                Country = profile.Country            };
        }

        public (bool IsValid, string ErrorMessage) ValidateUserCreationRules(CreateUserRequestDto request, List<string> currentUserRoles)
        {
            // Admin can create any type of user
            if (currentUserRoles.Contains("Admin"))
            {
                return (true, string.Empty);
            }

            // Manager can create employees and customers, but not other admins
            if (currentUserRoles.Contains("Manager"))
            {
                if (request.RoleName.Equals("Admin", StringComparison.OrdinalIgnoreCase))
                {
                    return (false, "Managers cannot create Admin users");
                }

                if (request.UserType == UserType.Vendor && 
                    !currentUserRoles.Contains("Procurement"))
                {
                    return (false, "Only Procurement managers can create vendor users");
                }

                return (true, string.Empty);
            }

            // HR can only create employee profiles
            if (currentUserRoles.Contains("HR"))
            {
                if (request.UserType != UserType.Employee)
                {
                    return (false, "HR can only create employee users");
                }

                if (request.RoleName.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
                    request.RoleName.Equals("Manager", StringComparison.OrdinalIgnoreCase))
                {
                    return (false, "HR cannot create Admin or Manager users");
                }

                return (true, string.Empty);
            }

            // Sales can only create customer profiles
            if (currentUserRoles.Contains("Sales"))
            {
                if (request.UserType != UserType.Customer)
                {
                    return (false, "Sales can only create customer users");
                }

                return (true, string.Empty);
            }

            return (false, "You do not have permission to create users");
        }

        public bool CanUserAccessProfile(Guid requestingUserId, Guid targetUserId, List<string> userRoles)
        {
            // Users can access their own profile
            if (requestingUserId == targetUserId)
            {
                return true;
            }

            // Admin and Manager can access any profile
            return userRoles.Contains("Admin") || userRoles.Contains("Manager");
        }
    }
}
