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

        // SIMPLIFIED APPROACH - MINIMAL NAVIGATION PROPERTIES
        // Only keep essential Identity-related navigation properties
        // Other relationships are handled via foreign key IDs only
        
        // Keep essential Identity navigation properties
        public virtual ICollection<IdentityUserRole<Guid>> UserRoles { get; set; } = new List<IdentityUserRole<Guid>>();
        
        // Remove complex navigation properties to avoid FK conflicts
        // Use services to fetch related data when needed
    }
}
