using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Users
{
    public class AssignRolePermissionDto
    {
        [Required]
        public string RoleId { get; set; } = string.Empty;

        [Required]
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }
}
