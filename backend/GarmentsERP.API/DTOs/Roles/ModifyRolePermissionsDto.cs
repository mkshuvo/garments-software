using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Roles
{
    /// <summary>
    /// DTO for role permission modification
    /// </summary>
    public class ModifyRolePermissionsDto
    {
        /// <summary>
        /// List of permission IDs to assign to the role
        /// </summary>
        [Required]
        public List<Guid> PermissionIds { get; set; } = new List<Guid>();
    }
}
