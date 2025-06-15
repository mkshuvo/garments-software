using GarmentsERP.API.DTOs.Users;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.Services.Interfaces
{
    public interface IUserManagementService
    {
        Task<(bool Success, string Message, UserResponseDto? User)> CreateUserAsync(CreateUserRequestDto request, string createdBy);
        Task<(bool Success, string Message, UserResponseDto? User)> GetUserByIdAsync(Guid userId);
        Task<(bool Success, string Message, List<UserResponseDto> Users)> GetUsersByTypeAsync(UserType userType, int page = 1, int pageSize = 10);
        Task<(bool Success, string Message)> DeactivateUserAsync(Guid userId, string deactivatedBy);
        Task<(bool Success, string Message)> ReactivateUserAsync(Guid userId, string reactivatedBy);
        Task<(bool Success, string Message, LoginResponseDto? Response)> LoginAsync(LoginRequestDto request);
        Task<bool> ValidateUserPermissionsAsync(Guid userId, string requiredRole);
        (bool IsValid, string ErrorMessage) ValidateUserCreationRules(CreateUserRequestDto request, List<string> currentUserRoles);
        bool CanUserAccessProfile(Guid requestingUserId, Guid targetUserId, List<string> userRoles);
    }
}