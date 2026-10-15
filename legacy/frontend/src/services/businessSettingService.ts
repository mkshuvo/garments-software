import { apiService } from './apiService';

export interface BusinessSettingDto {
  id: string;
  settingKey: string;
  value: string;
  category: string;
  description?: string;
  dataType: string;
  isSystem: boolean;
  isActive: boolean;
  validationRules?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBusinessSettingDto {
  settingKey: string;
  value: string;
  category: string;
  description?: string;
  dataType: string;
  isSystem: boolean;
  isActive: boolean;
  validationRules?: string;
}

export interface UpdateBusinessSettingDto {
  settingKey: string;
  value: string;
  category: string;
  description?: string;
  dataType: string;
  isSystem: boolean;
  isActive: boolean;
  validationRules?: string;
}

export const businessSettingService = {
  async getAll(): Promise<BusinessSettingDto[]> {
    return apiService.get<BusinessSettingDto[]>('/api/BusinessSetting');
  },

  async getById(id: string): Promise<BusinessSettingDto> {
    return apiService.get<BusinessSettingDto>(`/api/BusinessSetting/${id}`);
  },

  async getByKey(key: string): Promise<BusinessSettingDto> {
    return apiService.get<BusinessSettingDto>(`/api/BusinessSetting/by-key/${key}`);
  },

  async getByCategory(category: string): Promise<BusinessSettingDto[]> {
    return apiService.get<BusinessSettingDto[]>(`/api/BusinessSetting/by-category/${category}`);
  },

  async getSettingValue(key: string): Promise<string> {
    return apiService.get<string>(`/api/BusinessSetting/value/${key}`);
  },

  async create(data: CreateBusinessSettingDto): Promise<BusinessSettingDto> {
    return apiService.post<BusinessSettingDto>('/api/BusinessSetting', data);
  },

  async update(id: string, data: UpdateBusinessSettingDto): Promise<BusinessSettingDto> {
    return apiService.put<BusinessSettingDto>(`/api/BusinessSetting/${id}`, data);
  },

  async updateSettingValue(key: string, value: string): Promise<void> {
    return apiService.put<void>(`/api/BusinessSetting/value/${key}`, value, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(`/api/BusinessSetting/${id}`);
  }
};
