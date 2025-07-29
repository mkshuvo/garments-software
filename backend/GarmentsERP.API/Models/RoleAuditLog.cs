using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models
{
    /// <summary>
    /// Model for tracking role permission changes
    /// </summary>
    public class RoleAuditLog
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string RoleId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string RoleName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Action { get; set; } = string.Empty; // CREATE, UPDATE, DELETE, ASSIGN_PERMISSIONS, REMOVE_PERMISSIONS

        [StringLength(1000)]
        public string? Details { get; set; }

        [Required]
        public string PerformedBy { get; set; } = string.Empty; // User ID who performed the action

        [Required]
        public DateTime PerformedAt { get; set; } = DateTime.UtcNow;
    }
}