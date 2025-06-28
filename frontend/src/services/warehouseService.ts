import { apiService } from './apiService';

export interface WarehouseResponseDto {
  id: string;
  warehouseName: string;
  warehouseCode: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWarehouseDto {
  warehouseName: string;
  warehouseCode: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isActive: boolean;
  description?: string;
}

export interface UpdateWarehouseDto {
  warehouseName: string;
  warehouseCode: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isActive: boolean;
  description?: string;
}

export const warehouseService = {
  async getAll(): Promise<WarehouseResponseDto[]> {
    return apiService.get<WarehouseResponseDto[]>('/api/Warehouse');
  },

  async getById(id: string): Promise<WarehouseResponseDto> {
    return apiService.get<WarehouseResponseDto>(`/api/Warehouse/${id}`);
  },

  async getActive(): Promise<WarehouseResponseDto[]> {
    return apiService.get<WarehouseResponseDto[]>('/api/Warehouse/active');
  },

  async create(data: CreateWarehouseDto): Promise<WarehouseResponseDto> {
    return apiService.post<WarehouseResponseDto>('/api/Warehouse', data);
  },

  async update(id: string, data: UpdateWarehouseDto): Promise<WarehouseResponseDto> {
    return apiService.put<WarehouseResponseDto>(`/api/Warehouse/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiService.delete<void>(`/api/Warehouse/${id}`);
  }
};
