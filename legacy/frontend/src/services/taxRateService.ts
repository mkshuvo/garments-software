import { apiService } from './apiService';

export interface TaxRate {
  id: string;
  taxName: string;
  taxPercentage: number;
  taxType: string;
  description?: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
}

export interface CreateTaxRateDto {
  taxName: string;
  taxPercentage: number;
  taxType: string;
  description?: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface UpdateTaxRateDto {
  taxName: string;
  taxPercentage: number;
  taxType: string;
  description?: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

export const taxRateService = {
  async getAll(): Promise<TaxRate[]> {
    return await apiService.get<TaxRate[]>('/api/taxrate');
  },

  async getById(id: string): Promise<TaxRate> {
    return await apiService.get<TaxRate>(`/api/taxrate/${id}`);
  },

  async create(data: CreateTaxRateDto): Promise<TaxRate> {
    return await apiService.post<TaxRate>('/api/taxrate', data);
  },

  async update(id: string, data: UpdateTaxRateDto): Promise<TaxRate> {
    return await apiService.put<TaxRate>(`/api/taxrate/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/taxrate/${id}`);
  },

  async getActive(): Promise<TaxRate[]> {
    return await apiService.get<TaxRate[]>('/api/taxrate/active');
  },
};
