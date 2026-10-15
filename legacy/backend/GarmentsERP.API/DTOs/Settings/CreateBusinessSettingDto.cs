using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Settings;

namespace GarmentsERP.API.DTOs.Settings
{
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
}
