using GarmentsERP.API.DTOs;

namespace GarmentsERP.API.Services.Interfaces
{
    public interface IAuthService
    {
        Task<DTOs.AuthResult> RegisterAsync(RegisterDto registerDto);
        Task<DTOs.AuthResult> LoginAsync(LoginDto loginDto);
        Task<UserInfoDto?> GetProfileAsync(string userId);
        Task<DTOs.AuthResult> UpdateProfileAsync(string userId, UpdateProfileDto updateDto);
        Task<DTOs.AuthResult> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto);
        Task<List<RoleInfoDto>> GetRolesAsync();
        Task<List<UserInfoDto>> GetUsersByRoleAsync(string roleName);
    }
}
