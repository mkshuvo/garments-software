import { apiService } from './apiService';

export interface ProductCategory {
  id: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateProductCategoryDto {
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export interface UpdateProductCategoryDto {
  categoryName: string;
  description?: string;
  isActive: boolean;
}

export const productCategoryService = {
  async getAll(): Promise<ProductCategory[]> {
    return await apiService.get<ProductCategory[]>('/api/productcategory');
  },

  async getById(id: string): Promise<ProductCategory> {
    return await apiService.get<ProductCategory>(`/api/productcategory/${id}`);
  },

  async create(data: CreateProductCategoryDto): Promise<ProductCategory> {
    return await apiService.post<ProductCategory>('/api/productcategory', data);
  },

  async update(id: string, data: UpdateProductCategoryDto): Promise<ProductCategory> {
    return await apiService.put<ProductCategory>(`/api/productcategory/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/productcategory/${id}`);
  },

  async getActive(): Promise<ProductCategory[]> {
    return await apiService.get<ProductCategory[]>('/api/productcategory/active');
  },
};
