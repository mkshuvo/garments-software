import { apiService } from './apiService';

export interface Currency {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCurrencyDto {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
}

export interface UpdateCurrencyDto {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
}

export const currencyService = {
  async getAll(): Promise<Currency[]> {
    return await apiService.get<Currency[]>('/api/currency');
  },

  async getById(id: string): Promise<Currency> {
    return await apiService.get<Currency>(`/api/currency/${id}`);
  },

  async create(data: CreateCurrencyDto): Promise<Currency> {
    return await apiService.post<Currency>('/api/currency', data);
  },

  async update(id: string, data: UpdateCurrencyDto): Promise<Currency> {
    return await apiService.put<Currency>(`/api/currency/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/currency/${id}`);
  },

  async getActive(): Promise<Currency[]> {
    return await apiService.get<Currency[]>('/api/currency/active');
  },
};
