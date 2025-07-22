import { apiService } from './apiService';

interface Company {
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

interface CreateCompanyData {
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
  getCompanies: async (): Promise<Company[]> => {
    return await apiService.get<Company[]>('/api/Company');
  },
  
  getCompany: async (id: string): Promise<Company> => {
    return await apiService.get<Company>(`/api/Company/${id}`);
  },
  
  createCompany: async (company: CreateCompanyData): Promise<Company> => {
    return await apiService.post<Company>('/api/Company', company);
  },
  
  updateCompany: async (id: string, company: Partial<Company>): Promise<Company> => {
    return await apiService.put<Company>(`/api/Company/${id}`, company);
  },
  
  deleteCompany: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/api/Company/${id}`);
  }
};