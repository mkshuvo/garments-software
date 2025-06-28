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
                .Include(rt => rt.CreatedBy)
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
                    CreatedByUserName = rt.CreatedBy != null ? rt.CreatedBy.FullName : null,
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
                .Include(rt => rt.CreatedBy)
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
                    CreatedByUserName = rt.CreatedBy != null ? rt.CreatedBy.FullName : null,
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
                CreatedByUserId = userId
            };

            _context.ReportTemplates.Add(reportTemplate);
            await _context.SaveChangesAsync();

            return await GetReportTemplateByIdAsync(reportTemplate.Id) ?? 
                   throw new InvalidOperationException("Failed to retrieve created report template");
        }

        public async Task<ReportTemplateDto?> UpdateReportTemplateAsync(Guid id, UpdateReportTemplateDto updateDto)
        {
            var reportTemplate = await _context.ReportTemplates.FindAsync(id);
            if (reportTemplate == null)
                return null;

            reportTemplate.TemplateName = updateDto.TemplateName;
            reportTemplate.ReportType = updateDto.ReportType;
            reportTemplate.Description = updateDto.Description;
            reportTemplate.TemplateContent = updateDto.TemplateContent;
            reportTemplate.IsActive = updateDto.IsActive;
            reportTemplate.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return await GetReportTemplateByIdAsync(id);
        }

        public async Task<bool> DeleteReportTemplateAsync(Guid id)
        {
            var reportTemplate = await _context.ReportTemplates.FindAsync(id);
            if (reportTemplate == null)
                return false;

            _context.ReportTemplates.Remove(reportTemplate);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ReportTemplateDto>> GetActiveReportTemplatesAsync()
        {
            return await _context.ReportTemplates
                .Include(rt => rt.CreatedBy)
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
                    CreatedByUserName = rt.CreatedBy != null ? rt.CreatedBy.FullName : null,
                    CreatedAt = rt.CreatedAt,
                    UpdatedAt = rt.UpdatedAt
                })
                .OrderBy(rt => rt.ReportType)
                .ThenBy(rt => rt.TemplateName)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReportTemplateDto>> GetReportTemplatesByTypeAsync(ReportType reportType)
        {
            return await _context.ReportTemplates
                .Include(rt => rt.CreatedBy)
                .Where(rt => rt.ReportType == reportType)
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
                    CreatedByUserName = rt.CreatedBy != null ? rt.CreatedBy.FullName : null,
                    CreatedAt = rt.CreatedAt,
                    UpdatedAt = rt.UpdatedAt
                })
                .OrderBy(rt => rt.TemplateName)
                .ToListAsync();
        }

        public async Task<IEnumerable<ReportTemplateDto>> GetReportTemplatesByUserAsync(Guid userId)
        {
            return await _context.ReportTemplates
                .Include(rt => rt.CreatedBy)
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
                    CreatedByUserName = rt.CreatedBy != null ? rt.CreatedBy.FullName : null,
                    CreatedAt = rt.CreatedAt,
                    UpdatedAt = rt.UpdatedAt
                })
                .OrderBy(rt => rt.CreatedAt)
                .ToListAsync();
        }
    }
}
