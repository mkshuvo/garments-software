using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Roles
{
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
