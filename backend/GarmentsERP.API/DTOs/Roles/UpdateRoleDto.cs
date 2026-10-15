using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Roles
{
    /// <summary>
    /// DTO for updating an existing role
    /// </summary>
    public class UpdateRoleDto
    {
        /// <summary>
        /// Role name
        /// </summary>
        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Role description
        /// </summary>
        [StringLength(200)]
        public string? Description { get; set; }
    }
}
