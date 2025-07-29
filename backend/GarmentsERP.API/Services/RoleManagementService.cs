using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Roles;
using GarmentsERP.API.DTOs;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;
using System.Text.Json;

namespace GarmentsERP.API.Services
{
    public class RoleManagementService : IRoleManagementService
    {
        private readonly ApplicationDbContext _context;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<RoleManagementService> _logger;

        public RoleManagementService(
            ApplicationDbContext context,
            RoleManager<ApplicationRole> roleManager,
            UserManager<ApplicationUser> userManager,
            ILogger<RoleManagementService> logger)
        {
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<IEnumerable<RoleDetailsDto>> GetAllRolesAsync()
        {
            try
            {
                var roles = await _roleManager.Roles.ToListAsync();
                var roleDetails = new List<RoleDetailsDto>();

                foreach (var role in roles)
                {
                    var userCount = await _userManager.GetUsersInRoleAsync(role.Name!);
                    var permissionCount = await _context.RolePermissions
                        .CountAsync(rp => rp.RoleId == role.Id);

                    roleDetails.Add(new RoleDetailsDto
                    {
                        Id = role.Id,
                        Name = role.Name!,
                        Description = role.Description,
                        CreatedAt = role.CreatedAt,
                        UserCount = userCount.Count,
                        PermissionCount = permissionCount
                    });
                }

                return roleDetails.OrderBy(r => r.Name);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all roles");
                throw;
            }
        }

        public async Task<RoleDetailsDto?> GetRoleByIdAsync(string roleId)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                    return null;

                var userCount = await _userManager.GetUsersInRoleAsync(role.Name!);
                var permissionCount = await _context.RolePermissions
                    .CountAsync(rp => rp.RoleId == role.Id);

                return new RoleDetailsDto
                {
                    Id = role.Id,
                    Name = role.Name!,
                    Description = role.Description,
                    CreatedAt = role.CreatedAt,
                    UserCount = userCount.Count,
                    PermissionCount = permissionCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching role by ID: {RoleId}", roleId);
                throw;
            }
        }

        public async Task<RoleDetailsDto> CreateRoleAsync(CreateRoleDto createDto, string performedBy)
        {
            try
            {
                // Check if role already exists
                var existingRole = await _roleManager.FindByNameAsync(createDto.Name);
                if (existingRole != null)
                {
                    throw new InvalidOperationException($"Role '{createDto.Name}' already exists.");
                }

                var role = new ApplicationRole
                {
                    Name = createDto.Name,
                    Description = createDto.Description,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await _roleManager.CreateAsync(role);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to create role: {errors}");
                }

                // Log the action
                await LogRoleActionAsync(role.Id.ToString(), role.Name, "CREATE", 
                    $"Role created with description: {createDto.Description}", performedBy);

                _logger.LogInformation("Role '{RoleName}' created successfully by user {UserId}", createDto.Name, performedBy);

                return new RoleDetailsDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    Description = role.Description,
                    CreatedAt = role.CreatedAt,
                    UserCount = 0,
                    PermissionCount = 0
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating role: {RoleName}", createDto.Name);
                throw;
            }
        }

        public async Task<RoleDetailsDto?> UpdateRoleAsync(string roleId, UpdateRoleDto updateDto, string performedBy)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                    return null;

                // Check if new name conflicts with existing role (excluding current role)
                if (role.Name != updateDto.Name)
                {
                    var existingRole = await _roleManager.FindByNameAsync(updateDto.Name);
                    if (existingRole != null && existingRole.Id != role.Id)
                    {
                        throw new InvalidOperationException($"Role '{updateDto.Name}' already exists.");
                    }
                }

                var oldName = role.Name;
                var oldDescription = role.Description;

                role.Name = updateDto.Name;
                role.Description = updateDto.Description;

                var result = await _roleManager.UpdateAsync(role);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to update role: {errors}");
                }

                // Log the action
                var changes = new List<string>();
                if (oldName != updateDto.Name) changes.Add($"Name: '{oldName}' → '{updateDto.Name}'");
                if (oldDescription != updateDto.Description) changes.Add($"Description: '{oldDescription}' → '{updateDto.Description}'");
                
                await LogRoleActionAsync(roleId, role.Name, "UPDATE", 
                    $"Role updated. Changes: {string.Join(", ", changes)}", performedBy);

                _logger.LogInformation("Role '{RoleName}' updated successfully by user {UserId}", updateDto.Name, performedBy);

                var userCount = await _userManager.GetUsersInRoleAsync(role.Name);
                var permissionCount = await _context.RolePermissions
                    .CountAsync(rp => rp.RoleId == role.Id);

                return new RoleDetailsDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    Description = role.Description,
                    CreatedAt = role.CreatedAt,
                    UserCount = userCount.Count,
                    PermissionCount = permissionCount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating role: {RoleId}", roleId);
                throw;
            }
        }

        public async Task<bool> DeleteRoleAsync(string roleId, string performedBy)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                    return false;

                // Check if role has users assigned
                var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
                if (usersInRole.Any())
                {
                    throw new InvalidOperationException($"Cannot delete role '{role.Name}' as it has {usersInRole.Count} users assigned.");
                }

                // Remove all role permissions first
                var rolePermissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == role.Id)
                    .ToListAsync();

                if (rolePermissions.Any())
                {
                    _context.RolePermissions.RemoveRange(rolePermissions);
                    await _context.SaveChangesAsync();
                }

                var result = await _roleManager.DeleteAsync(role);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to delete role: {errors}");
                }

                // Log the action
                await LogRoleActionAsync(roleId, role.Name!, "DELETE", 
                    $"Role deleted along with {rolePermissions.Count} permission assignments", performedBy);

                _logger.LogInformation("Role '{RoleName}' deleted successfully by user {UserId}", role.Name, performedBy);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting role: {RoleId}", roleId);
                throw;
            }
        }

        public async Task<bool> ModifyRolePermissionsAsync(string roleId, ModifyRolePermissionsDto modifyDto, string performedBy)
        {
            try
            {
                var role = await _roleManager.FindByIdAsync(roleId);
                if (role == null)
                    return false;

                // Validate all permission IDs exist
                var validPermissions = await _context.Permissions
                    .Where(p => modifyDto.PermissionIds.Contains(p.Id) && p.IsActive)
                    .ToListAsync();

                if (validPermissions.Count != modifyDto.PermissionIds.Count)
                {
                    var invalidIds = modifyDto.PermissionIds.Except(validPermissions.Select(p => p.Id));
                    throw new InvalidOperationException($"Invalid or inactive permission IDs: {string.Join(", ", invalidIds)}");
                }

                // Get current role permissions
                var currentRolePermissions = await _context.RolePermissions
                    .Where(rp => rp.RoleId == role.Id)
                    .ToListAsync();

                var currentPermissionIds = currentRolePermissions.Select(rp => rp.PermissionId).ToList();

                // Calculate changes
                var permissionsToAdd = modifyDto.PermissionIds.Except(currentPermissionIds).ToList();
                var permissionsToRemove = currentPermissionIds.Except(modifyDto.PermissionIds).ToList();

                // Remove permissions
                if (permissionsToRemove.Any())
                {
                    var permissionsToDelete = currentRolePermissions
                        .Where(rp => permissionsToRemove.Contains(rp.PermissionId))
                        .ToList();
                    
                    _context.RolePermissions.RemoveRange(permissionsToDelete);
                }

                // Add new permissions
                if (permissionsToAdd.Any())
                {
                    var newRolePermissions = permissionsToAdd.Select(permissionId => new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permissionId,
                        CreatedAt = DateTime.UtcNow
                    });

                    _context.RolePermissions.AddRange(newRolePermissions);
                }

                await _context.SaveChangesAsync();

                // Log the action
                var changeDetails = new List<string>();
                if (permissionsToAdd.Any())
                {
                    var addedPermissions = validPermissions.Where(p => permissionsToAdd.Contains(p.Id))
                        .Select(p => $"{p.Resource}.{p.Action}");
                    changeDetails.Add($"Added: {string.Join(", ", addedPermissions)}");
                }
                if (permissionsToRemove.Any())
                {
                    var removedPermissions = await _context.Permissions
                        .Where(p => permissionsToRemove.Contains(p.Id))
                        .Select(p => $"{p.Resource}.{p.Action}")
                        .ToListAsync();
                    changeDetails.Add($"Removed: {string.Join(", ", removedPermissions)}");
                }

                await LogRoleActionAsync(roleId, role.Name!, "MODIFY_PERMISSIONS", 
                    string.Join("; ", changeDetails), performedBy);

                _logger.LogInformation("Role permissions modified for '{RoleName}' by user {UserId}. Added: {AddedCount}, Removed: {RemovedCount}", 
                    role.Name, performedBy, permissionsToAdd.Count, permissionsToRemove.Count);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while modifying role permissions: {RoleId}", roleId);
                throw;
            }
        }

        public async Task<IEnumerable<RoleAuditLogDto>> GetRoleAuditLogsAsync(string? roleId = null, int limit = 100)
        {
            try
            {
                var query = _context.RoleAuditLogs.AsQueryable();

                if (!string.IsNullOrEmpty(roleId))
                {
                    query = query.Where(log => log.RoleId == roleId);
                }

                var logs = await query
                    .OrderByDescending(log => log.PerformedAt)
                    .Take(limit)
                    .ToListAsync();

                return logs.Select(log => new RoleAuditLogDto
                {
                    Id = log.Id,
                    RoleId = log.RoleId,
                    RoleName = log.RoleName,
                    Action = log.Action,
                    Details = log.Details,
                    PerformedBy = log.PerformedBy,
                    PerformedAt = log.PerformedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching role audit logs");
                throw;
            }
        }

        public async Task<bool> ValidateRolePermissionsAsync(List<Guid> permissionIds)
        {
            try
            {
                if (!permissionIds.Any())
                    return true;

                var validPermissionCount = await _context.Permissions
                    .CountAsync(p => permissionIds.Contains(p.Id) && p.IsActive);

                return validPermissionCount == permissionIds.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while validating role permissions");
                throw;
            }
        }

        private async Task LogRoleActionAsync(string roleId, string roleName, string action, string? details, string performedBy)
        {
            try
            {
                var auditLog = new RoleAuditLog
                {
                    RoleId = roleId,
                    RoleName = roleName,
                    Action = action,
                    Details = details,
                    PerformedBy = performedBy,
                    PerformedAt = DateTime.UtcNow
                };

                _context.RoleAuditLogs.Add(auditLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to log role action: {Action} for role {RoleName}", action, roleName);
                // Don't throw here as this is just logging
            }
        }
    }
}