using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs
{
    public class UpdateChartOfAccountRequest
    {
        [Required]
        [MaxLength(200)]
        public string AccountName { get; set; } = string.Empty;
        
        public Guid? ParentAccountId { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [MaxLength(100)]
        public string? CategoryGroup { get; set; }
        
        public int SortOrder { get; set; } = 0;
        
        public bool AllowTransactions { get; set; } = true;
    }
}