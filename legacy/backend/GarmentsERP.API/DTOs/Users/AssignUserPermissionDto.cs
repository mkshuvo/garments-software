using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Users
{
    public class AssignUserPermissionDto
    {
        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }
}
