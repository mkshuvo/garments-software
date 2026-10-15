import { apiService } from './apiService';

export interface ReportTemplateDto {
  id: string;
  templateName: string;
  reportType: string;
  templateContent: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  createdBy: string;
  createdByName?: string;
  parameters?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReportTemplateDto {
  templateName: string;
  reportType: string;
  templateContent: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  parameters?: string;
}

export interface UpdateReportTemplateDto {
  templateName: string;
  reportType: string;
  templateContent: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  parameters?: string;
}

export const reportTemplateService = {
  async getAll(): Promise<ReportTemplateDto[]> {
    return apiService.get<ReportTemplateDto[]>('/api/ReportTemplate');
  },

  async getById(id: string): Promise<ReportTemplateDto> {
    return apiService.get<ReportTemplateDto>(`/api/ReportTemplate/${id}`);
  },

  async getActive(): Promise<ReportTemplateDto[]> {
    return apiService.get<ReportTemplateDto[]>('/api/ReportTemplate/active');
  },

  async getByType(reportType: string): Promise<ReportTemplateDto[]> {
    return apiService.get<ReportTemplateDto[]>(`/api/ReportTemplate/by-type/${reportType}`);
  },

  async getByUser(userId: string): Promise<ReportTemplateDto[]> {
    return apiService.get<ReportTemplateDto[]>(`/api/ReportTemplate/by-user/${userId}`);
  },

  async getMyTemplates(): Promise<ReportTemplateDto[]> {
    return apiService.get<ReportTemplateDto[]>('/api/ReportTemplate/my-templates');
  },

  async create(data: CreateReportTemplateDto): Promise<ReportTemplateDto> {
    return apiService.post<ReportTemplateDto>('/api/ReportTemplate', data);
  },

  async update(id: string, data: UpdateReportTemplateDto): Promise<ReportTemplateDto> {
    return apiService.put<ReportTemplateDto>(`/api/ReportTemplate/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(`/api/ReportTemplate/${id}`);
  }
};
