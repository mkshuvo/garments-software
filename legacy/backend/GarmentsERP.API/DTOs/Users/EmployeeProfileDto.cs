using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.DTOs.Users
{
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
}
