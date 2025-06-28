namespace GarmentsERP.API.DTOs.Settings
{
    public class CreateCompanyDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Fax { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Logo { get; set; }
        public DateTime FinancialYearStart { get; set; }
        public DateTime FinancialYearEnd { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateCompanyDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Fax { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Logo { get; set; }
        public DateTime FinancialYearStart { get; set; }
        public DateTime FinancialYearEnd { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class CompanyResponseDto
    {
        public Guid Id { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
        public string? Fax { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? TaxNumber { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Logo { get; set; }
        public DateTime FinancialYearStart { get; set; }
        public DateTime FinancialYearEnd { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
