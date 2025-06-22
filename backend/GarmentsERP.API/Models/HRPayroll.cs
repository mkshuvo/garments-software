using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GarmentsERP.API.Models
{    public class Employee
    {
        [Key]
        public Guid EmployeeId { get; set; } = Guid.NewGuid();

        [ForeignKey("ApplicationUser")]
        public Guid? UserId { get; set; }

        // Employee personal information (to match migration schema)
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(15)]
        public string? Phone { get; set; }

        // HR-specific fields
        [MaxLength(500)]
        public string? Address { get; set; }

        public DateTime HireDate { get; set; }
        public DateTime? TerminationDate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Salary { get; set; }

        [MaxLength(100)]
        public string? Department { get; set; }

        [MaxLength(100)]
        public string? Position { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ApplicationUser? User { get; set; }
        public virtual ICollection<Payroll> Payrolls { get; set; } = new List<Payroll>();

        // Convenience properties (computed from basic fields)
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}".Trim();

        [NotMapped]
        public string? ContactNumber => User?.ContactNumber;
    }

    public class Payroll
    {
        [Key]
        public Guid PayrollId { get; set; } = Guid.NewGuid();

        [ForeignKey("Employee")]
        public Guid EmployeeId { get; set; }

        public DateTime PayPeriodStart { get; set; }
        public DateTime PayPeriodEnd { get; set; }

        [Range(0, double.MaxValue)]
        public decimal GrossSalary { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Deductions { get; set; }

        [Range(0, double.MaxValue)]
        public decimal NetSalary { get; set; }

        public PayrollStatus Status { get; set; } = PayrollStatus.Draft;

        public DateTime ProcessedDate { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Employee Employee { get; set; } = null!;
    }

    public enum PayrollStatus
    {
        Draft,
        Approved,
        Processed,
        Paid
    }
}
