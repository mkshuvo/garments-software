using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Roles
{
    /// <summary>
    /// DTO for creating a new role
    /// </summary>
    public class CreateRoleDto
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
