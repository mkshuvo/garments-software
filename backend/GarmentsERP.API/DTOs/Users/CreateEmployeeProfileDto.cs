using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.DTOs.Users
{
    public class CreateEmployeeProfileDto
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

        public decimal Salary { get; set; }

        [MaxLength(50)]
        public string? EmploymentType { get; set; } = "Full-time";

        [MaxLength(100)]
        public string? ReportsTo { get; set; }

        [MaxLength(50)]
        public string? ShiftType { get; set; } = "Morning";

        public bool IsManager { get; set; } = false;

        // Address fields
        [MaxLength(100)]
        public string? Address { get; set; }

        [MaxLength(50)]
        public string? City { get; set; }

        [MaxLength(50)]
        public string? State { get; set; }

        [MaxLength(10)]
        public string? ZipCode { get; set; }

        [MaxLength(50)]
        public string? Country { get; set; }
    }
}
