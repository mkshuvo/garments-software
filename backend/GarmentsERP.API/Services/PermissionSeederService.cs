using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;
using GarmentsERP.API.Interfaces;

namespace GarmentsERP.API.Services
{
    public class PermissionSeederService : IPermissionSeederService
    {
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly ILogger<PermissionSeederService> _logger;

        public PermissionSeederService(
            ApplicationDbContext context,
            RoleManager<ApplicationRole> roleManager,
            ILogger<PermissionSeederService> logger)
        {
            _context = context;
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task SeedPermissionsAndRoleAssignmentsAsync()
        {
            try
            {
                _logger.LogInformation("Starting permission seeding process...");

                // Step 1: Ensure all required permissions exist
                await EnsurePermissionsExistAsync();

                // Step 2: Ensure default roles exist
                await EnsureDefaultRolesExistAsync();

                // Step 3: Assign permissions to roles
                await AssignPermissionsToRolesAsync();

                _logger.LogInformation("Permission seeding completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during permission seeding");
                throw;
            }
        }

        private async Task EnsurePermissionsExistAsync()
        {
            _logger.LogInformation("Ensuring required permissions exist...");

            var requiredPermissions = GetRequiredPermissions();

            foreach (var permissionData in requiredPermissions)
            {
                var existingPermission = await _context.Permissions
                    .FirstOrDefaultAsync(p => p.Resource == permissionData.Resource && p.Action == permissionData.Action);

                if (existingPermission == null)
                {
                    var permission = new Permission
                    {
                        Name = permissionData.Name,
                        Resource = permissionData.Resource,
                        Action = permissionData.Action,
                        Description = permissionData.Description,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Permissions.Add(permission);
                    _logger.LogInformation($"Created permission: {permission.Name} ({permission.Resource}.{permission.Action})");
                }
                else
                {
                    // Update existing permission if needed
                    if (existingPermission.Name != permissionData.Name || 
                        existingPermission.Description != permissionData.Description ||
                        !existingPermission.IsActive)
                    {
                        existingPermission.Name = permissionData.Name;
                        existingPermission.Description = permissionData.Description;
                        existingPermission.IsActive = true;
                        _logger.LogInformation($"Updated permission: {existingPermission.Name} ({existingPermission.Resource}.{existingPermission.Action})");
                    }
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Permission creation/update completed");
        }

        private async Task EnsureDefaultRolesExistAsync()
        {
            _logger.LogInformation("Ensuring default roles exist...");

            var defaultRoles = new[]
            {
                new { Name = "Admin", Description = "System Administrator with full access" },
                new { Name = "Manager", Description = "Manager with elevated permissions" },
                new { Name = "Employee", Description = "Regular employee with basic permissions" }
            };

            foreach (var roleData in defaultRoles)
            {
                var roleExists = await _roleManager.RoleExistsAsync(roleData.Name);
                if (!roleExists)
                {
                    var role = new ApplicationRole
                    {
                        Name = roleData.Name,
                        Description = roleData.Description,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await _roleManager.CreateAsync(role);
                    if (result.Succeeded)
                    {
                        _logger.LogInformation($"Created role: {roleData.Name}");
                    }
                    else
                    {
                        _logger.LogError($"Failed to create role {roleData.Name}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
            }
        }

        private async Task AssignPermissionsToRolesAsync()
        {
            _logger.LogInformation("Assigning permissions to roles...");

            var rolePermissionMappings = GetRolePermissionMappings();

            foreach (var mapping in rolePermissionMappings)
            {
                var role = await _roleManager.FindByNameAsync(mapping.RoleName);
                if (role == null)
                {
                    _logger.LogWarning($"Role {mapping.RoleName} not found, skipping permission assignment");
                    continue;
                }

                // Get existing role permissions
                var existingRolePermissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == role.Id)
                    .Select(rp => rp.PermissionId)
                    .ToListAsync();

                var permissionsToAssign = new List<Guid>();

                foreach (var permissionKey in mapping.Permissions)
                {
                    var permission = await _context.Permissions
                        .FirstOrDefaultAsync(p => p.Resource == permissionKey.Resource && p.Action == permissionKey.Action);

                    if (permission != null && !existingRolePermissions.Contains(permission.Id))
                    {
                        permissionsToAssign.Add(permission.Id);
                    }
                }

                // Add new role permissions
                if (permissionsToAssign.Any())
                {
                    var newRolePermissions = permissionsToAssign.Select(permissionId => new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permissionId,
                        CreatedAt = DateTime.UtcNow
                    });

                    _context.RolePermissions.AddRange(newRolePermissions);
                    _logger.LogInformation($"Assigned {permissionsToAssign.Count} new permissions to role {mapping.RoleName}");
                }
                else
                {
                    _logger.LogInformation($"No new permissions to assign to role {mapping.RoleName}");
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Role permission assignment completed");
        }

        private List<PermissionData> GetRequiredPermissions()
        {
            return new List<PermissionData>
            {
                // Category Management Permissions
                new PermissionData
                {
                    Name = "View Categories",
                    Resource = "Category",
                    Action = "View",
                    Description = "Can view category list and details"
                },
                new PermissionData
                {
                    Name = "Create Categories",
                    Resource = "Category",
                    Action = "Create",
                    Description = "Can create new categories"
                },
                new PermissionData
                {
                    Name = "Update Categories",
                    Resource = "Category",
                    Action = "Update",
                    Description = "Can modify existing categories"
                },
                new PermissionData
                {
                    Name = "Delete Categories",
                    Resource = "Category",
                    Action = "Delete",
                    Description = "Can delete categories"
                },

                // User Management Permissions
                new PermissionData
                {
                    Name = "View Users",
                    Resource = "User",
                    Action = "View",
                    Description = "Can view user list and details"
                },
                new PermissionData
                {
                    Name = "Create Users",
                    Resource = "User",
                    Action = "Create",
                    Description = "Can create new users"
                },
                new PermissionData
                {
                    Name = "Update Users",
                    Resource = "User",
                    Action = "Update",
                    Description = "Can modify user details"
                },
                new PermissionData
                {
                    Name = "Delete Users",
                    Resource = "User",
                    Action = "Delete",
                    Description = "Can delete users"
                },

                // Role Management Permissions
                new PermissionData
                {
                    Name = "View Roles",
                    Resource = "Role",
                    Action = "View",
                    Description = "Can view role list and details"
                },
                new PermissionData
                {
                    Name = "Create Roles",
                    Resource = "Role",
                    Action = "Create",
                    Description = "Can create new roles"
                },
                new PermissionData
                {
                    Name = "Update Roles",
                    Resource = "Role",
                    Action = "Update",
                    Description = "Can modify role permissions"
                },
                new PermissionData
                {
                    Name = "Delete Roles",
                    Resource = "Role",
                    Action = "Delete",
                    Description = "Can delete roles"
                },

                // Permission Management Permissions
                new PermissionData
                {
                    Name = "View Permissions",
                    Resource = "Permission",
                    Action = "View",
                    Description = "Can view permission list and details"
                },
                new PermissionData
                {
                    Name = "Create Permissions",
                    Resource = "Permission",
                    Action = "Create",
                    Description = "Can create new permissions"
                },
                new PermissionData
                {
                    Name = "Update Permissions",
                    Resource = "Permission",
                    Action = "Update",
                    Description = "Can modify permissions"
                },
                new PermissionData
                {
                    Name = "Delete Permissions",
                    Resource = "Permission",
                    Action = "Delete",
                    Description = "Can delete permissions"
                }
            };
        }

        private List<RolePermissionMapping> GetRolePermissionMappings()
        {
            return new List<RolePermissionMapping>
            {
                // Admin Role - Full access to all resources
                new RolePermissionMapping
                {
                    RoleName = "Admin",
                    Permissions = new List<PermissionKey>
                    {
                        // Category permissions
                        new PermissionKey { Resource = "Category", Action = "View" },
                        new PermissionKey { Resource = "Category", Action = "Create" },
                        new PermissionKey { Resource = "Category", Action = "Update" },
                        new PermissionKey { Resource = "Category", Action = "Delete" },
                        
                        // User management permissions
                        new PermissionKey { Resource = "User", Action = "View" },
                        new PermissionKey { Resource = "User", Action = "Create" },
                        new PermissionKey { Resource = "User", Action = "Update" },
                        new PermissionKey { Resource = "User", Action = "Delete" },
                        
                        // Role management permissions
                        new PermissionKey { Resource = "Role", Action = "View" },
                        new PermissionKey { Resource = "Role", Action = "Create" },
                        new PermissionKey { Resource = "Role", Action = "Update" },
                        new PermissionKey { Resource = "Role", Action = "Delete" },
                        
                        // Permission management permissions
                        new PermissionKey { Resource = "Permission", Action = "View" },
                        new PermissionKey { Resource = "Permission", Action = "Create" },
                        new PermissionKey { Resource = "Permission", Action = "Update" },
                        new PermissionKey { Resource = "Permission", Action = "Delete" }
                    }
                },

                // Manager Role - Elevated permissions but not full admin access
                new RolePermissionMapping
                {
                    RoleName = "Manager",
                    Permissions = new List<PermissionKey>
                    {
                        // Category permissions (all except delete)
                        new PermissionKey { Resource = "Category", Action = "View" },
                        new PermissionKey { Resource = "Category", Action = "Create" },
                        new PermissionKey { Resource = "Category", Action = "Update" },
                        
                        // User management permissions (view only)
                        new PermissionKey { Resource = "User", Action = "View" },
                        
                        // Role management permissions (view only)
                        new PermissionKey { Resource = "Role", Action = "View" },
                        
                        // Permission management permissions (view only)
                        new PermissionKey { Resource = "Permission", Action = "View" }
                    }
                },

                // Employee Role - Basic permissions
                new RolePermissionMapping
                {
                    RoleName = "Employee",
                    Permissions = new List<PermissionKey>
                    {
                        // Category permissions (view only)
                        new PermissionKey { Resource = "Category", Action = "View" }
                    }
                }
            };
        }

        private class PermissionData
        {
            public string Name { get; set; } = string.Empty;
            public string Resource { get; set; } = string.Empty;
            public string Action { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
        }

        private class RolePermissionMapping
        {
            public string RoleName { get; set; } = string.Empty;
            public List<PermissionKey> Permissions { get; set; } = new();
        }

        private class PermissionKey
        {
            public string Resource { get; set; } = string.Empty;
            public string Action { get; set; } = string.Empty;
        }
    }
}