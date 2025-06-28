using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.Models
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<IdentityUserRole<Guid>> UserRoles { get; set; } = new List<IdentityUserRole<Guid>>();
        public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    }

    public enum UserRoles
    {
        Admin,
        Manager,
        Employee,
        Vendor,
        Customer
    }
}
