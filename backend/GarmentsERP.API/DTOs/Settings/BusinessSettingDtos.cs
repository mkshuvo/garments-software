using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Settings;

namespace GarmentsERP.API.DTOs.Settings
{
    public class BusinessSettingDto
    {
        public Guid Id { get; set; }
        public string SettingKey { get; set; } = string.Empty;
        public string SettingValue { get; set; } = string.Empty;
        public string? Description { get; set; }
        public SettingCategory Category { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public bool IsSystem { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateBusinessSettingDto
    {
        [Required]
        [MaxLength(100)]
        public string SettingKey { get; set; } = string.Empty;

        [Required]
        public string SettingValue { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        public SettingCategory Category { get; set; }

        public bool IsSystem { get; set; } = false;
    }

    public class UpdateBusinessSettingDto
    {
        [Required]
        public string SettingValue { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
