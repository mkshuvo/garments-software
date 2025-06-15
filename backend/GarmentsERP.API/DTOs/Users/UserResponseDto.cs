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

    public class EmployeeProfileDto
    {
        public Guid Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public DateTime? TerminationDate { get; set; }
        public decimal Salary { get; set; }
        public string? EmploymentType { get; set; }
        public string? ReportsTo { get; set; }
        public string? ShiftType { get; set; }
        public bool IsManager { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }

    public class CustomerProfileDto
    {
        public Guid Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPersonName { get; set; }
        public string? Industry { get; set; }
        public string? TaxId { get; set; }
        public string CustomerType { get; set; } = string.Empty;
        public decimal CreditLimit { get; set; }
        public decimal CurrentBalance { get; set; }
        public string PaymentTerms { get; set; } = string.Empty;
        public DateTime? LastOrderDate { get; set; }
        public bool IsBlacklisted { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }

    public class VendorProfileDto
    {
        public Guid Id { get; set; }
        public string VendorId { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? ContactPersonName { get; set; }
        public string? Industry { get; set; }
        public string? TaxId { get; set; }
        public string VendorType { get; set; } = string.Empty;
        public string PaymentTerms { get; set; } = string.Empty;
        public decimal CurrentBalance { get; set; }
        public DateTime? LastPurchaseDate { get; set; }
        public string? BankAccount { get; set; }
        public string? BankName { get; set; }
        public bool IsPreferred { get; set; }
        public bool IsBlacklisted { get; set; }
        public int QualityRating { get; set; }
        public int DeliveryRating { get; set; }
        public int ServiceRating { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? ZipCode { get; set; }
        public string? Country { get; set; }
    }

    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; } = false;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
        public UserResponseDto User { get; set; } = null!;
    }
}
