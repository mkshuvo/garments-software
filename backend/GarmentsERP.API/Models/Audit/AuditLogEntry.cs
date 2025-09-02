using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Audit
{
    [Table("AuditLogs")]
    public class AuditLogEntry
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Operation { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ResourceType { get; set; } = string.Empty;

        public Guid? ResourceId { get; set; }

        [Required]
        [MaxLength(450)]
        public string UserId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? UserName { get; set; }

        [MaxLength(100)]
        public string? UserEmail { get; set; }

        [MaxLength(100)]
        public string? IPAddress { get; set; }

        [MaxLength(100)]
        public string? UserAgent { get; set; }

        [Required]
        [MaxLength(500)]
        public string Details { get; set; } = string.Empty;

        public bool Success { get; set; } = true;

        [MaxLength(500)]
        public string? ErrorMessage { get; set; }

        [MaxLength(100)]
        public string? SessionId { get; set; }

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? Module { get; set; }

        [MaxLength(100)]
        public string? SubModule { get; set; }

        public int? DurationMs { get; set; }

        [MaxLength(100)]
        public string? RequestId { get; set; }

        // Navigation properties
        public virtual ApplicationUser? User { get; set; }
    }
}
