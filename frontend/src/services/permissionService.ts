import { apiService } from './apiService';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePermissionDto {
  name?: string;
  resource?: string;
  action?: string;
  description?: string;
  isActive?: boolean;
}

interface PermissionCheckResponse {
  hasPermission: boolean;
}

export const permissionService = {
  getUserPermissions: async (userId: string): Promise<Permission[]> => {
    return await apiService.get<Permission[]>(`/api/permissions/user/${userId}`);
  },
  
  checkPermission: async (userId: string, resource: string, action: string): Promise<boolean> => {
    const response = await apiService.get<PermissionCheckResponse>(`/api/permissions/check/${userId}/${resource}/${action}`);
    return response.hasPermission;
  },
  
  getAllPermissions: async (): Promise<Permission[]> => {
    return await apiService.get<Permission[]>('/api/permissions');
  },
  
  createPermission: async (permission: CreatePermissionDto): Promise<Permission> => {
    return await apiService.post<Permission>('/api/permissions', permission);
  },
  
  updatePermission: async (id: string, permission: UpdatePermissionDto): Promise<Permission> => {
    return await apiService.put<Permission>(`/api/permissions/${id}`, permission);
  },
  
  deletePermission: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/api/permissions/${id}`);
  },
  
  assignPermission: async (userId: string, permission: string) => {
    return await apiService.post('/api/permissions/assign', { userId, permission });
  },
  
  revokePermission: async (userId: string, permission: string) => {
    return await apiService.delete(`/api/permissions/revoke/${userId}/${permission}`);
  }
};