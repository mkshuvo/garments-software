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
}
