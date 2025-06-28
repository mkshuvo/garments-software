import { apiService } from './apiService';

export interface Company {
  id: string;
  companyName: string;
  legalName: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCompanyDto {
  companyName: string;
  legalName: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
}

export interface UpdateCompanyDto {
  companyName: string;
  legalName: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
}

export const companyService = {
  async getAll(): Promise<Company[]> {
    return await apiService.get<Company[]>('/api/company');
  },

  async getById(id: string): Promise<Company> {
    return await apiService.get<Company>(`/api/company/${id}`);
  },

  async create(data: CreateCompanyDto): Promise<Company> {
    return await apiService.post<Company>('/api/company', data);
  },

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    return await apiService.put<Company>(`/api/company/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/company/${id}`);
  },

  async getActive(): Promise<Company[]> {
    return await apiService.get<Company[]>('/api/company/active');
  },
};
