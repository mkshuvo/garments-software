import { apiService } from './apiService';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

// Cache for user permissions
let permissionCache: Permission[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
    return await apiService.get<Permission[]>(`/api/permission/user/${userId}`);
  },

  getMyPermissions: async (): Promise<Permission[]> => {
    return await apiService.get<Permission[]>('/api/permission/my-permissions');
  },

  getMyPermissionsCached: async (forceRefresh: boolean = false): Promise<Permission[]> => {
    const now = Date.now();
    
    // Return cached permissions if they're still valid and not forcing refresh
    if (!forceRefresh && permissionCache.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
      return permissionCache;
    }
    
    try {
      // Fetch fresh permissions
      const permissions = await apiService.get<Permission[]>('/api/permission/my-permissions');
      
      // Update cache
      permissionCache = permissions;
      cacheTimestamp = now;
      
      return permissions;
    } catch (error) {
      // If fetch fails and we have cached data, return it
      if (permissionCache.length > 0) {
        console.warn('Failed to fetch fresh permissions, using cached data:', error);
        return permissionCache;
      }
      throw error;
    }
  },

  clearPermissionCache: () => {
    permissionCache = [];
    cacheTimestamp = 0;
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