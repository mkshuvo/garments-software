using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.DTOs.Users
{
    public class CreateUserRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Phone]
        [MaxLength(15)]
        public string? ContactNumber { get; set; }

        [Required]
        public UserType UserType { get; set; }

        [Required]
        public string RoleName { get; set; } = string.Empty;

        // Profile-specific data (only one should be filled based on UserType)
        public CreateEmployeeProfileDto? EmployeeProfile { get; set; }
        public CreateCustomerProfileDto? CustomerProfile { get; set; }
        public CreateVendorProfileDto? VendorProfile { get; set; }
    }

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

    public class CreateCustomerProfileDto
    {
        [Required]
        [MaxLength(20)]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CompanyName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ContactPersonName { get; set; }

        [MaxLength(100)]
        public string? Industry { get; set; }

        [MaxLength(20)]
        public string? TaxId { get; set; }

        [MaxLength(50)]
        public string CustomerType { get; set; } = "Regular";

        public decimal CreditLimit { get; set; } = 0;

        [MaxLength(50)]
        public string PaymentTerms { get; set; } = "Net 30";

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

    public class CreateVendorProfileDto
    {
        [Required]
        [MaxLength(20)]
        public string VendorId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string CompanyName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ContactPersonName { get; set; }

        [MaxLength(100)]
        public string? Industry { get; set; }

        [MaxLength(20)]
        public string? TaxId { get; set; }

        [MaxLength(50)]
        public string VendorType { get; set; } = "Material";

        [MaxLength(50)]
        public string PaymentTerms { get; set; } = "Net 30";

        [MaxLength(20)]
        public string? BankAccount { get; set; }

        [MaxLength(50)]
        public string? BankName { get; set; }

        public bool IsPreferred { get; set; } = false;

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
