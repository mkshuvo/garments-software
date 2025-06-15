using GarmentsERP.API.DTOs;
using GarmentsERP.API.Services.Auth;

namespace GarmentsERP.API.Services.Interfaces
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
}
