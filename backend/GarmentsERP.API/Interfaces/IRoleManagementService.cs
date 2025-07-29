using GarmentsERP.API.DTOs.Roles;
using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Interfaces
{
    public interface IRoleManagementService
    {
        Task<IEnumerable<RoleDetailsDto>> GetAllRolesAsync();
        Task<RoleDetailsDto?> GetRoleByIdAsync(string roleId);
        Task<RoleDetailsDto> CreateRoleAsync(CreateRoleDto createDto, string performedBy);
        Task<RoleDetailsDto?> UpdateRoleAsync(string roleId, UpdateRoleDto updateDto, string performedBy);
        Task<bool> DeleteRoleAsync(string roleId, string performedBy);
        Task<bool> ModifyRolePermissionsAsync(string roleId, ModifyRolePermissionsDto modifyDto, string performedBy);
        Task<IEnumerable<RoleAuditLogDto>> GetRoleAuditLogsAsync(string? roleId = null, int limit = 100);
        Task<bool> ValidateRolePermissionsAsync(List<Guid> permissionIds);
    }
}