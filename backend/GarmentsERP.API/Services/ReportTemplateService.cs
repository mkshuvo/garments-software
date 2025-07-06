using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.DTOs.Reports;
using GarmentsERP.API.Interfaces;
using GarmentsERP.API.Models.Reports;

namespace GarmentsERP.API.Services
{
    public class ReportTemplateService : IReportTemplateService
    {
        private readonly ApplicationDbContext _context;

        public ReportTemplateService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReportTemplateDto>> GetAllReportTemplatesAsync()
        {
            return await _context.ReportTemplates
                .Select(rt => new ReportTemplateDto
                {
                    Id = rt.Id,
                    TemplateName = rt.TemplateName,
                    ReportType = rt.ReportType,
                    ReportTypeName = rt.ReportType.ToString(),
                    Description = rt.Description,
                    TemplateContent = rt.TemplateContent,
                    IsActive = rt.IsActive,
                    CreatedByUserId = rt.CreatedByUserId,
                    CreatedByUserName = null, // Use joins in services if needed
                    CreatedAt = rt.CreatedAt,
                    UpdatedAt = rt.UpdatedAt
                })
                .OrderBy(rt => rt.ReportType)
                .ThenBy(rt => rt.TemplateName)
                .ToListAsync();
        }

        public async Task<ReportTemplateDto?> GetReportTemplateByIdAsync(Guid id)
        {
            return await _context.ReportTemplates
                .Where(rt => rt.Id == id)
                .Select(rt => new ReportTemplateDto
                {
                    Id = rt.Id,
                    TemplateName = rt.TemplateName,
                    ReportType = rt.ReportType,
                    ReportTypeName = rt.ReportType.ToString(),
                    Description = rt.Description,
                    TemplateContent = rt.TemplateContent,
                    IsActive = rt.IsActive,
                    CreatedByUserId = rt.CreatedByUserId,
                    CreatedByUserName = null, // Use joins in services if needed
                    CreatedAt = rt.CreatedAt,
                    UpdatedAt = rt.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ReportTemplateDto> CreateReportTemplateAsync(CreateReportTemplateDto createDto, Guid userId)
        {
            var reportTemplate = new ReportTemplate
            {
                TemplateName = createDto.TemplateName,
                ReportType = createDto.ReportType,
                Description = createDto.Description,
                TemplateContent = createDto.TemplateContent,
                IsActive = createDto.IsActive,
                CreatedByUserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ReportTemplates.Add(reportTemplate);
            await _context.SaveChangesAsync();

            return new ReportTemplateDto
            {
                Id = reportTemplate.Id,
                TemplateName = reportTemplate.TemplateName,
                ReportType = reportTemplate.ReportType,
                ReportTypeName = reportTemplate.ReportType.ToString(),
                Description = reportTemplate.Description,
                TemplateContent = reportTemplate.TemplateContent,
                IsActive = reportTemplate.IsActive,
                CreatedByUserId = reportTemplate.CreatedByUserId,
                CreatedByUserName = null, // Use joins in services if needed
                CreatedAt = reportTemplate.CreatedAt,
                UpdatedAt = reportTemplate.UpdatedAt
            };
        }

        public async Task<ReportTemplateDto?> UpdateReportTemplateAsync(Guid id, UpdateReportTemplateDto updateDto)
        {
            var reportTemplate = await _context.ReportTemplates.FindAsync(id);
            if (reportTemplate == null)
            {
                return null;
            }

            reportTemplate.TemplateName = updateDto.TemplateName;
            reportTemplate.ReportType = updateDto.ReportType;
            reportTemplate.Description = updateDto.Description;
            reportTemplate.TemplateContent = updateDto.TemplateContent;
            reportTemplate.IsActive = updateDto.IsActive;
            reportTemplate.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ReportTemplateDto
            {
                Id = reportTemplate.Id,
                TemplateName = reportTemplate.TemplateName,
                ReportType = reportTemplate.ReportType,
                ReportTypeName = reportTemplate.ReportType.ToString(),
                Description = reportTemplate.Description,
                TemplateContent = reportTemplate.TemplateContent,
                IsActive = reportTemplate.IsActive,
                CreatedByUserId = reportTemplate.CreatedByUserId,
                CreatedByUserName = null, // Use joins in services if needed
                CreatedAt = reportTemplate.CreatedAt,
                UpdatedAt = reportTemplate.UpdatedAt
            };
        }

        public async Task<bool> DeleteReportTemplateAsync(Guid id)
        {
            var reportTemplate = await _context.ReportTemplates.FindAsync(id);
            if (reportTemplate == null)
            {
                return false;
            }

            _context.ReportTemplates.Remove(reportTemplate);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ReportTemplateDto>> GetReportTemplatesByTypeAsync(ReportType reportType)
        {
            return await _context.ReportTemplates
                .Where(rt => rt.ReportType == reportType && rt.IsActive)
                .Select(rt => new ReportTemplateDto
                {
                    Id = rt.Id,
                    TemplateName = rt.TemplateName,
                    ReportType = rt.ReportType,
                    ReportTypeName = rt.ReportType.ToString(),
                    Description = rt.Description,
                    TemplateContent = rt.TemplateContent,
                    IsActive = rt.IsActive,
                    CreatedByUserId = rt.CreatedByUserId,
                    CreatedByUserName = null, // Use joins in services if needed
                    CreatedAt = rt.CreatedAt,
                    UpdatedAt = rt.UpdatedAt
                })
                .OrderBy(rt => rt.TemplateName)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReportTemplateDto>> GetActiveReportTemplatesAsync()
        {
            return await _context.ReportTemplates
                .Where(rt => rt.IsActive)
                .Select(rt => new ReportTemplateDto
                {
                    Id = rt.Id,
                    TemplateName = rt.TemplateName,
                    ReportType = rt.ReportType,
                    ReportTypeName = rt.ReportType.ToString(),
                    Description = rt.Description,
                    TemplateContent = rt.TemplateContent,
                    IsActive = rt.IsActive,
                    CreatedByUserId = rt.CreatedByUserId,
                    CreatedByUserName = null, // Use joins in services if needed
                    CreatedAt = rt.CreatedAt,
                    UpdatedAt = rt.UpdatedAt
                })
                .OrderBy(rt => rt.ReportType)
                .ThenBy(rt => rt.TemplateName)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReportTemplateDto>> GetReportTemplatesByUserAsync(Guid userId)
        {
            return await _context.ReportTemplates
                .Where(rt => rt.CreatedByUserId == userId)
                .Select(rt => new ReportTemplateDto
                {
                    Id = rt.Id,
                    TemplateName = rt.TemplateName,
                    ReportType = rt.ReportType,
                    ReportTypeName = rt.ReportType.ToString(),
                    Description = rt.Description,
                    TemplateContent = rt.TemplateContent,
                    IsActive = rt.IsActive,
                    CreatedByUserId = rt.CreatedByUserId,
                    CreatedByUserName = null, // Use joins in services if needed
                    CreatedAt = rt.CreatedAt,
                    UpdatedAt = rt.UpdatedAt
                })
                .OrderBy(rt => rt.ReportType)
                .ThenBy(rt => rt.TemplateName)
                .ToListAsync();
        }
    }
}
