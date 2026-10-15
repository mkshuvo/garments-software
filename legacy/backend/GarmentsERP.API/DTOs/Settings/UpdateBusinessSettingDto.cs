using System.ComponentModel.DataAnnotations;
using GarmentsERP.API.Models.Settings;

namespace GarmentsERP.API.DTOs.Settings
{
    public class UpdateBusinessSettingDto
    {
        [Required]
        public string SettingValue { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }
    }
}
