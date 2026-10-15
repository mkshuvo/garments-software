using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? ContactNumber { get; set; }
    }
}
