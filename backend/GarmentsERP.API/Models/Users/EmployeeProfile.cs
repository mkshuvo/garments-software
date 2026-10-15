using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models.Users
{
    public class EmployeeProfile : BaseUserProfile
    {
        [Required]
        [MaxLength(20)]
        public string EmployeeId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Department { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Position { get; set; } = string.Empty;

        [Required]
        public DateTime HireDate { get; set; }

        public DateTime? TerminationDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Salary { get; set; }

        [MaxLength(50)]
        public string? EmploymentType { get; set; } // Full-time, Part-time, Contract

        [MaxLength(100)]
        public string? ReportsTo { get; set; } // Manager/Supervisor

        [MaxLength(50)]
        public string? ShiftType { get; set; } // Morning, Evening, Night

        public bool IsManager { get; set; } = false;
    }
}
