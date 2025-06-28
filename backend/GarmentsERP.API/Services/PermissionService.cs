using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Users;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;

        public PermissionService(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IEnumerable<PermissionResponseDto>> GetAllPermissionsAsync()
        {
            var permissions = await _context.Permissions
                .OrderBy(p => p.Resource)
                .ThenBy(p => p.Action)
                .ToListAsync();

            return permissions.Select(p => new PermissionResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Resource = p.Resource,
                Action = p.Action,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            });
        }

        public async Task<PermissionResponseDto?> GetPermissionByIdAsync(Guid id)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == id);

            if (permission == null)
                return null;

            return new PermissionResponseDto
            {
                Id = permission.Id,
                Name = permission.Name,
                Resource = permission.Resource,
                Action = permission.Action,
                Description = permission.Description,
                IsActive = permission.IsActive,
                CreatedAt = permission.CreatedAt
            };
        }

        public async Task<PermissionResponseDto> CreatePermissionAsync(CreatePermissionDto createDto)
        {
            // Check if permission already exists
            var existingPermission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Resource == createDto.Resource && p.Action == createDto.Action);

            if (existingPermission != null)
            {
                throw new InvalidOperationException($"Permission for {createDto.Resource}:{createDto.Action} already exists.");
            }

            var permission = new Permission
            {
                Name = createDto.Name,
                Resource = createDto.Resource,
                Action = createDto.Action,
                Description = createDto.Description,
                IsActive = createDto.IsActive
            };

            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();

            return new PermissionResponseDto
            {
                Id = permission.Id,
                Name = permission.Name,
                Resource = permission.Resource,
                Action = permission.Action,
                Description = permission.Description,
                IsActive = permission.IsActive,
                CreatedAt = permission.CreatedAt
            };
        }

        public async Task<PermissionResponseDto?> UpdatePermissionAsync(Guid id, UpdatePermissionDto updateDto)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == id);

            if (permission == null)
                return null;

            // Check if permission already exists (excluding current one)
            var existingPermission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Resource == updateDto.Resource && 
                                   p.Action == updateDto.Action && p.Id != id);

            if (existingPermission != null)
            {
                throw new InvalidOperationException($"Permission for {updateDto.Resource}:{updateDto.Action} already exists.");
            }

            permission.Name = updateDto.Name;
            permission.Resource = updateDto.Resource;
            permission.Action = updateDto.Action;
            permission.Description = updateDto.Description;
            permission.IsActive = updateDto.IsActive;

            await _context.SaveChangesAsync();

            return new PermissionResponseDto
            {
                Id = permission.Id,
                Name = permission.Name,
                Resource = permission.Resource,
                Action = permission.Action,
                Description = permission.Description,
                IsActive = permission.IsActive,
                CreatedAt = permission.CreatedAt
            };
        }

        public async Task<bool> DeletePermissionAsync(Guid id)
        {
            var permission = await _context.Permissions
                .FirstOrDefaultAsync(p => p.Id == id);

            if (permission == null)
                return false;

            // Check if permission is used in role or user permissions
            var isUsedInRoles = await _context.RolePermissions
                .AnyAsync(rp => rp.PermissionId == id);

            var isUsedInUsers = await _context.UserPermissions
                .AnyAsync(up => up.PermissionId == id);

            if (isUsedInRoles || isUsedInUsers)
            {
                throw new InvalidOperationException("Cannot delete permission as it is assigned to roles or users.");
            }

            _context.Permissions.Remove(permission);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<PermissionResponseDto>> GetActivePermissionsAsync()
        {
            var permissions = await _context.Permissions
                .Where(p => p.IsActive)
                .OrderBy(p => p.Resource)
                .ThenBy(p => p.Action)
                .ToListAsync();

            return permissions.Select(p => new PermissionResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Resource = p.Resource,
                Action = p.Action,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            });
        }

        public async Task<bool> AssignPermissionsToRoleAsync(AssignRolePermissionDto assignDto)
        {
            var role = await _roleManager.FindByIdAsync(assignDto.RoleId);
            if (role == null)
                return false;

            var roleGuid = role.Id;

            // Remove existing permissions for this role
            var existingRolePermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleGuid)
                .ToListAsync();

            _context.RolePermissions.RemoveRange(existingRolePermissions);

            // Add new permissions
            var newRolePermissions = assignDto.PermissionIds.Select(permissionId => new RolePermission
            {
                RoleId = roleGuid,
                PermissionId = permissionId
            });

            _context.RolePermissions.AddRange(newRolePermissions);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemovePermissionsFromRoleAsync(string roleId, List<Guid> permissionIds)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null)
                return false;

            var roleGuid = role.Id;

            var rolePermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleGuid && permissionIds.Contains(rp.PermissionId))
                .ToListAsync();

            _context.RolePermissions.RemoveRange(rolePermissions);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<RolePermissionsDto?> GetRolePermissionsAsync(string roleId)
        {
            var role = await _roleManager.FindByIdAsync(roleId);
            if (role == null)
                return null;

            var roleGuid = role.Id;

            var permissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleGuid)
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission)
                .ToListAsync();

            return new RolePermissionsDto
            {
                RoleId = roleId,
                RoleName = role.Name!,
                Permissions = permissions.Select(p => new PermissionResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Resource = p.Resource,
                    Action = p.Action,
                    Description = p.Description,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                }).ToList()
            };
        }

        public async Task<IEnumerable<RolePermissionsDto>> GetAllRolePermissionsAsync()
        {
            var roles = await _roleManager.Roles.ToListAsync();
            var result = new List<RolePermissionsDto>();

            foreach (var role in roles)
            {
                var rolePermissions = await GetRolePermissionsAsync(role.Id.ToString());
                if (rolePermissions != null)
                {
                    result.Add(rolePermissions);
                }
            }

            return result;
        }

        public async Task<bool> AssignPermissionsToUserAsync(AssignUserPermissionDto assignDto)
        {
            var user = await _userManager.FindByIdAsync(assignDto.UserId);
            if (user == null)
                return false;

            var userGuid = user.Id;

            // Remove existing permissions for this user
            var existingUserPermissions = await _context.UserPermissions
                .Where(up => up.UserId == userGuid)
                .ToListAsync();

            _context.UserPermissions.RemoveRange(existingUserPermissions);

            // Add new permissions
            var newUserPermissions = assignDto.PermissionIds.Select(permissionId => new UserPermission
            {
                UserId = userGuid,
                PermissionId = permissionId
            });

            _context.UserPermissions.AddRange(newUserPermissions);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemovePermissionsFromUserAsync(string userId, List<Guid> permissionIds)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return false;

            var userGuid = user.Id;

            var userPermissions = await _context.UserPermissions
                .Where(up => up.UserId == userGuid && permissionIds.Contains(up.PermissionId))
                .ToListAsync();

            _context.UserPermissions.RemoveRange(userPermissions);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<UserPermissionsDto?> GetUserPermissionsAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return null;

            var userGuid = user.Id;

            var permissions = await _context.UserPermissions
                .Where(up => up.UserId == userGuid)
                .Include(up => up.Permission)
                .Select(up => up.Permission)
                .ToListAsync();

            return new UserPermissionsDto
            {
                UserId = userId,
                UserName = user.UserName!,
                Permissions = permissions.Select(p => new PermissionResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Resource = p.Resource,
                    Action = p.Action,
                    Description = p.Description,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                }).ToList()
            };
        }

        public async Task<IEnumerable<UserPermissionsDto>> GetAllUserPermissionsAsync()
        {
            var users = await _userManager.Users.ToListAsync();
            var result = new List<UserPermissionsDto>();

            foreach (var user in users)
            {
                var userPermissions = await GetUserPermissionsAsync(user.Id.ToString());
                if (userPermissions != null)
                {
                    result.Add(userPermissions);
                }
            }

            return result;
        }

        public async Task<bool> HasPermissionAsync(string userId, string resource, string action)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return false;

            var userGuid = user.Id;

            // Check direct user permissions
            var hasDirectPermission = await _context.UserPermissions
                .Include(up => up.Permission)
                .AnyAsync(up => up.UserId == userGuid && 
                           up.Permission.Resource == resource && 
                           up.Permission.Action == action && 
                           up.Permission.IsActive);

            if (hasDirectPermission)
                return true;

            // Check role-based permissions
            var userRoles = await _userManager.GetRolesAsync(user);
            var roleIds = await _roleManager.Roles
                .Where(r => userRoles.Contains(r.Name!))
                .Select(r => r.Id)
                .ToListAsync();

            var hasRolePermission = await _context.RolePermissions
                .Include(rp => rp.Permission)
                .AnyAsync(rp => roleIds.Contains(rp.RoleId) && 
                           rp.Permission.Resource == resource && 
                           rp.Permission.Action == action && 
                           rp.Permission.IsActive);

            return hasRolePermission;
        }

        public async Task<IEnumerable<PermissionResponseDto>> GetUserEffectivePermissionsAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return new List<PermissionResponseDto>();

            var userGuid = user.Id;

            // Get direct permissions
            var directPermissions = await _context.UserPermissions
                .Where(up => up.UserId == userGuid)
                .Include(up => up.Permission)
                .Select(up => up.Permission)
                .Where(p => p.IsActive)
                .ToListAsync();

            // Get role-based permissions
            var userRoles = await _userManager.GetRolesAsync(user);
            var roleIds = await _roleManager.Roles
                .Where(r => userRoles.Contains(r.Name!))
                .Select(r => r.Id)
                .ToListAsync();

            var rolePermissions = await _context.RolePermissions
                .Where(rp => roleIds.Contains(rp.RoleId))
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission)
                .Where(p => p.IsActive)
                .ToListAsync();

            // Combine and deduplicate permissions
            var allPermissions = directPermissions.Concat(rolePermissions)
                .GroupBy(p => new { p.Resource, p.Action })
                .Select(g => g.First())
                .OrderBy(p => p.Resource)
                .ThenBy(p => p.Action)
                .ToList();

            return allPermissions.Select(p => new PermissionResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Resource = p.Resource,
                Action = p.Action,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            });
        }
    }
}
