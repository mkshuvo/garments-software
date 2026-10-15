using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.DTOs.User
{
    public class UpdateUserDto
    {
        [StringLength(100)]
        public string? FullName { get; set; }

        [Phone]
        public string? PhoneNumber { get; set; }

        public string? Department { get; set; }
        public string? Position { get; set; }
        public DateTime? HireDate { get; set; }
        public decimal? Salary { get; set; }
        public bool? IsActive { get; set; }
    }
}
