using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Settings;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Settings;

namespace GarmentsERP.API.Services
{
    public class BusinessSettingService : IBusinessSettingService
    {
        private readonly ApplicationDbContext _context;

        public BusinessSettingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BusinessSettingDto>> GetAllBusinessSettingsAsync()
        {
            return await _context.BusinessSettings
                .Select(bs => new BusinessSettingDto
                {
                    Id = bs.Id,
                    SettingKey = bs.SettingKey,
                    SettingValue = bs.SettingValue,
                    Description = bs.Description,
                    Category = bs.Category,
                    CategoryName = bs.Category.ToString(),
                    IsSystem = bs.IsSystem,
                    CreatedAt = bs.CreatedAt,
                    UpdatedAt = bs.UpdatedAt
                })
                .OrderBy(bs => bs.Category)
                .ThenBy(bs => bs.SettingKey)
                .ToListAsync();
        }

        public async Task<BusinessSettingDto?> GetBusinessSettingByIdAsync(Guid id)
        {
            return await _context.BusinessSettings
                .Where(bs => bs.Id == id)
                .Select(bs => new BusinessSettingDto
                {
                    Id = bs.Id,
                    SettingKey = bs.SettingKey,
                    SettingValue = bs.SettingValue,
                    Description = bs.Description,
                    Category = bs.Category,
                    CategoryName = bs.Category.ToString(),
                    IsSystem = bs.IsSystem,
                    CreatedAt = bs.CreatedAt,
                    UpdatedAt = bs.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<BusinessSettingDto?> GetBusinessSettingByKeyAsync(string key)
        {
            return await _context.BusinessSettings
                .Where(bs => bs.SettingKey == key)
                .Select(bs => new BusinessSettingDto
                {
                    Id = bs.Id,
                    SettingKey = bs.SettingKey,
                    SettingValue = bs.SettingValue,
                    Description = bs.Description,
                    Category = bs.Category,
                    CategoryName = bs.Category.ToString(),
                    IsSystem = bs.IsSystem,
                    CreatedAt = bs.CreatedAt,
                    UpdatedAt = bs.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<BusinessSettingDto> CreateBusinessSettingAsync(CreateBusinessSettingDto createDto)
        {
            // Check if key already exists
            var existingSetting = await _context.BusinessSettings
                .FirstOrDefaultAsync(bs => bs.SettingKey == createDto.SettingKey);
            
            if (existingSetting != null)
                throw new InvalidOperationException($"Setting with key '{createDto.SettingKey}' already exists");

            var businessSetting = new BusinessSetting
            {
                SettingKey = createDto.SettingKey,
                SettingValue = createDto.SettingValue,
                Description = createDto.Description,
                Category = createDto.Category,
                IsSystem = createDto.IsSystem
            };

            _context.BusinessSettings.Add(businessSetting);
            await _context.SaveChangesAsync();

            return await GetBusinessSettingByIdAsync(businessSetting.Id) ?? 
                   throw new InvalidOperationException("Failed to retrieve created business setting");
        }

        public async Task<BusinessSettingDto?> UpdateBusinessSettingAsync(Guid id, UpdateBusinessSettingDto updateDto)
        {
            var businessSetting = await _context.BusinessSettings.FindAsync(id);
            if (businessSetting == null)
                return null;

            // Prevent updating system settings
            if (businessSetting.IsSystem)
                throw new InvalidOperationException("Cannot update system settings");

            businessSetting.SettingValue = updateDto.SettingValue;
            businessSetting.Description = updateDto.Description;
            businessSetting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetBusinessSettingByIdAsync(id);
        }

        public async Task<bool> DeleteBusinessSettingAsync(Guid id)
        {
            var businessSetting = await _context.BusinessSettings.FindAsync(id);
            if (businessSetting == null)
                return false;

            // Prevent deleting system settings
            if (businessSetting.IsSystem)
                throw new InvalidOperationException("Cannot delete system settings");

            _context.BusinessSettings.Remove(businessSetting);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<BusinessSettingDto>> GetBusinessSettingsByCategoryAsync(SettingCategory category)
        {
            return await _context.BusinessSettings
                .Where(bs => bs.Category == category)
                .Select(bs => new BusinessSettingDto
                {
                    Id = bs.Id,
                    SettingKey = bs.SettingKey,
                    SettingValue = bs.SettingValue,
                    Description = bs.Description,
                    Category = bs.Category,
                    CategoryName = bs.Category.ToString(),
                    IsSystem = bs.IsSystem,
                    CreatedAt = bs.CreatedAt,
                    UpdatedAt = bs.UpdatedAt
                })
                .OrderBy(bs => bs.SettingKey)
                .ToListAsync();
        }

        public async Task<string?> GetSettingValueAsync(string key)
        {
            return await _context.BusinessSettings
                .Where(bs => bs.SettingKey == key)
                .Select(bs => bs.SettingValue)
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateSettingValueAsync(string key, string value)
        {
            var businessSetting = await _context.BusinessSettings
                .FirstOrDefaultAsync(bs => bs.SettingKey == key);
            
            if (businessSetting == null)
                return false;

            // Prevent updating system settings
            if (businessSetting.IsSystem)
                throw new InvalidOperationException("Cannot update system settings");

            businessSetting.SettingValue = value;
            businessSetting.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
