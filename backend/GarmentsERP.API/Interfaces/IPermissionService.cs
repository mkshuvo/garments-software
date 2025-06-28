using GarmentsERP.API.DTOs.Users;

namespace GarmentsERP.API.Interfaces
{
    public interface IPermissionService
    {
        Task<IEnumerable<PermissionResponseDto>> GetAllPermissionsAsync();
        Task<PermissionResponseDto?> GetPermissionByIdAsync(Guid id);
        Task<PermissionResponseDto> CreatePermissionAsync(CreatePermissionDto createDto);
        Task<PermissionResponseDto?> UpdatePermissionAsync(Guid id, UpdatePermissionDto updateDto);
        Task<bool> DeletePermissionAsync(Guid id);
        Task<IEnumerable<PermissionResponseDto>> GetActivePermissionsAsync();
        
        // Role Permission Management
        Task<bool> AssignPermissionsToRoleAsync(AssignRolePermissionDto assignDto);
        Task<bool> RemovePermissionsFromRoleAsync(string roleId, List<Guid> permissionIds);
        Task<RolePermissionsDto?> GetRolePermissionsAsync(string roleId);
        Task<IEnumerable<RolePermissionsDto>> GetAllRolePermissionsAsync();
        
        // User Permission Management
        Task<bool> AssignPermissionsToUserAsync(AssignUserPermissionDto assignDto);
        Task<bool> RemovePermissionsFromUserAsync(string userId, List<Guid> permissionIds);
        Task<UserPermissionsDto?> GetUserPermissionsAsync(string userId);
        Task<IEnumerable<UserPermissionsDto>> GetAllUserPermissionsAsync();
        
        // Permission Checking
        Task<bool> HasPermissionAsync(string userId, string resource, string action);
        Task<IEnumerable<PermissionResponseDto>> GetUserEffectivePermissionsAsync(string userId);
    }
}
