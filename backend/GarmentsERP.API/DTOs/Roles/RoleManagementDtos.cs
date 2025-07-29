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

    /// <summary>
    /// DTO for role details response
    /// </summary>
    public class RoleDetailsDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UserCount { get; set; }
        public int PermissionCount { get; set; }
    }

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

    /// <summary>
    /// DTO for audit log entry
    /// </summary>
    public class RoleAuditLogDto
    {
        public Guid Id { get; set; }
        public string RoleId { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string PerformedBy { get; set; } = string.Empty;
        public DateTime PerformedAt { get; set; }
    }
}