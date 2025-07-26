using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    public class UpdateCategoryRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
    }
}