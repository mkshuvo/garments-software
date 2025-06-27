using System.ComponentModel.DataAnnotations;

namespace GarmentsERP.API.Models.Settings
{
    public class BusinessSetting
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string SettingKey { get; set; } = string.Empty;

        [Required]
        public string SettingValue { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public SettingCategory Category { get; set; }

        public bool IsSystem { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }

    public enum SettingCategory
    {
        General,
        Accounting,
        Inventory,
        Taxation,
        Security,
        Notification,
        Reporting
    }
}
