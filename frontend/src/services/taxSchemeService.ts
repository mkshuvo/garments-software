import { apiService } from './apiService';

export interface TaxSchemeDto {
  id: string;
  schemeName: string;
  taxRateId: string;
  taxRateName?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTaxSchemeDto {
  schemeName: string;
  taxRateId: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateTaxSchemeDto {
  schemeName: string;
  taxRateId: string;
  description?: string;
  isActive: boolean;
}

export const taxSchemeService = {
  async getAll(): Promise<TaxSchemeDto[]> {
    return apiService.get<TaxSchemeDto[]>('/api/TaxScheme');
  },

  async getById(id: string): Promise<TaxSchemeDto> {
    return apiService.get<TaxSchemeDto>(`/api/TaxScheme/${id}`);
  },

  async getActive(): Promise<TaxSchemeDto[]> {
    return apiService.get<TaxSchemeDto[]>('/api/TaxScheme/active');
  },

  async getByTaxRate(taxRateId: string): Promise<TaxSchemeDto[]> {
    return apiService.get<TaxSchemeDto[]>(`/api/TaxScheme/by-tax-rate/${taxRateId}`);
  },

  async create(data: CreateTaxSchemeDto): Promise<TaxSchemeDto> {
    return apiService.post<TaxSchemeDto>('/api/TaxScheme', data);
  },

  async update(id: string, data: UpdateTaxSchemeDto): Promise<TaxSchemeDto> {
    return apiService.put<TaxSchemeDto>(`/api/TaxScheme/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(`/api/TaxScheme/${id}`);
  }
};
