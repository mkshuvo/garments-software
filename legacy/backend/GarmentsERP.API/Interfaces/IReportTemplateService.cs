using GarmentsERP.API.DTOs.Reports;
using GarmentsERP.API.Models.Reports;

namespace GarmentsERP.API.Interfaces
{
    public interface IReportTemplateService
    {
        Task<IEnumerable<ReportTemplateDto>> GetAllReportTemplatesAsync();
        Task<ReportTemplateDto?> GetReportTemplateByIdAsync(Guid id);
        Task<ReportTemplateDto> CreateReportTemplateAsync(CreateReportTemplateDto createDto, Guid userId);
        Task<ReportTemplateDto?> UpdateReportTemplateAsync(Guid id, UpdateReportTemplateDto updateDto);
        Task<bool> DeleteReportTemplateAsync(Guid id);
        Task<IEnumerable<ReportTemplateDto>> GetActiveReportTemplatesAsync();
        Task<IEnumerable<ReportTemplateDto>> GetReportTemplatesByTypeAsync(ReportType reportType);
        Task<IEnumerable<ReportTemplateDto>> GetReportTemplatesByUserAsync(Guid userId);
    }
}
