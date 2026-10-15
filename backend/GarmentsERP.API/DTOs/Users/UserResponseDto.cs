using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.DTOs.Users
{
    public class UserResponseDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? ContactNumber { get; set; }
        public UserType UserType { get; set; }
        public string UserTypeName => UserType.ToString();
        public List<string> Roles { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public bool IsActive { get; set; }

        // Profile data (only one will be populated based on UserType)
        public EmployeeProfileDto? EmployeeProfile { get; set; }
        public CustomerProfileDto? CustomerProfile { get; set; }
        public VendorProfileDto? VendorProfile { get; set; }
    }
}
