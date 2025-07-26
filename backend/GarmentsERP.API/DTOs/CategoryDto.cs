using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.DTOs
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public CategoryType Type { get; set; }
        public string TypeName { get; set; } = string.Empty; // "Credit" or "Debit"
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public int UsageCount { get; set; } // Number of transactions using this category
    }
}