using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.Models
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? ContactNumber { get; set; }

        [Required]
        public UserType UserType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        public bool IsActive { get; set; } = true;

        // Navigation properties - One user can have only one profile type
        public virtual EmployeeProfile? EmployeeProfile { get; set; }
        public virtual CustomerProfile? CustomerProfile { get; set; }
        public virtual VendorProfile? VendorProfile { get; set; }

        public virtual ICollection<IdentityUserRole<Guid>> UserRoles { get; set; } = new List<IdentityUserRole<Guid>>();
    }
}
