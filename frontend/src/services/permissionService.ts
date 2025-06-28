import { apiService } from './apiService';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

export interface UpdatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

export interface UserPermissionsDto {
  userId: string;
  userName: string;
  permissions: Permission[];
}

export interface RolePermissionsDto {
  roleId: string;
  roleName: string;
  permissions: Permission[];
}

export interface AssignRolePermissionDto {
  roleId: string;
  permissionIds: string[];
}

export interface AssignUserPermissionDto {
  userId: string;
  permissionIds: string[];
}

export const permissionService = {
  // Permission CRUD
  async getAllPermissions(): Promise<Permission[]> {
    return await apiService.get<Permission[]>('/api/permission');
  },

  async getPermissionById(id: string): Promise<Permission> {
    return await apiService.get<Permission>(`/api/permission/${id}`);
  },

  async createPermission(data: CreatePermissionDto): Promise<Permission> {
    return await apiService.post<Permission>('/api/permission', data);
  },

  async updatePermission(id: string, data: UpdatePermissionDto): Promise<Permission> {
    return await apiService.put<Permission>(`/api/permission/${id}`, data);
  },

  async deletePermission(id: string): Promise<void> {
    await apiService.delete(`/api/permission/${id}`);
  },

  async getActivePermissions(): Promise<Permission[]> {
    return await apiService.get<Permission[]>('/api/permission/active');
  },

  // Role permissions
  async assignPermissionsToRole(data: AssignRolePermissionDto): Promise<void> {
    await apiService.post('/api/permission/role-permissions', data);
  },

  async getRolePermissions(roleId: string): Promise<RolePermissionsDto> {
    return await apiService.get<RolePermissionsDto>(`/api/permission/role/${roleId}`);
  },

  async getAllRolePermissions(): Promise<RolePermissionsDto[]> {
    return await apiService.get<RolePermissionsDto[]>('/api/permission/role-permissions');
  },

  // User permissions
  async assignPermissionsToUser(data: AssignUserPermissionDto): Promise<void> {
    await apiService.post('/api/permission/user-permissions', data);
  },

  async getUserPermissions(userId: string): Promise<UserPermissionsDto> {
    return await apiService.get<UserPermissionsDto>(`/api/permission/user/${userId}`);
  },

  async getAllUserPermissions(): Promise<UserPermissionsDto[]> {
    return await apiService.get<UserPermissionsDto[]>('/api/permission/user-permissions');
  },

  // Permission checking
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    return await apiService.get<boolean>(`/api/permission/check/${userId}/${resource}/${action}`);
  },

  async getUserEffectivePermissions(userId: string): Promise<Permission[]> {
    return await apiService.get<Permission[]>(`/api/permission/effective/${userId}`);
  },
};
