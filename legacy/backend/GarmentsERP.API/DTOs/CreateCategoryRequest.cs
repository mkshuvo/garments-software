using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.DTOs
{
    public class CreateCategoryRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [Required]
        public CategoryType Type { get; set; }
    }
}