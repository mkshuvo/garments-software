using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Accounting;

namespace GarmentsERP.API.DTOs
{
    public class CreateChartOfAccountRequest
    {
        [Required]
        [MaxLength(200)]
        public string AccountName { get; set; } = string.Empty;
        
        [Required]
        public AccountType AccountType { get; set; }
        
        public Guid? ParentAccountId { get; set; }
        
        [MaxLength(500)]
        public string? Description { get; set; }
        
        [MaxLength(100)]
        public string? CategoryGroup { get; set; }
        
        public int SortOrder { get; set; } = 0;
        
        public bool AllowTransactions { get; set; } = true;
    }
}