using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models
{
    public class ApplicationRole : IdentityRole<Guid>
    {
        [MaxLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<IdentityUserRole<Guid>> UserRoles { get; set; } = new List<IdentityUserRole<Guid>>();
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
