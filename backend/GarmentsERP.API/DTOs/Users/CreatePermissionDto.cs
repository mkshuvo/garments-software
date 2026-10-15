using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.Users
{
    public class CreatePermissionDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Resource { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
