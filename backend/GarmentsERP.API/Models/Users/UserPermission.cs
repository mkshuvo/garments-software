using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Users
{
    public class UserPermission
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid PermissionId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // SIMPLIFIED APPROACH - NO NAVIGATION PROPERTIES
        // Relationships are handled via foreign key IDs only
    }
}
