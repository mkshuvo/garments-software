using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Users
{
    public class UserPermissionsDto
    {
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public List<PermissionResponseDto> Permissions { get; set; } = new List<PermissionResponseDto>();
    }
}
