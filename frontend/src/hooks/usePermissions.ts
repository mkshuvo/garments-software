import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook for permission checking
 * Provides convenient methods for checking permissions in components
 */
export const usePermissions = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated,
    isInitialized,
    isLoading,
    permissions,
  } = useAuthStore();

  /**
   * Check if user has a specific permission
   */
  const checkPermission = (resource: string, action: string): boolean => {
    return isAuthenticated && hasPermission(resource, action);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const checkAnyPermission = (permissionChecks: Array<{ resource: string; action: string }>): boolean => {
    return isAuthenticated && hasAnyPermission(permissionChecks);
  };

  /**
   * Check if user has all of the specified permissions
   */
  const checkAllPermissions = (permissionChecks: Array<{ resource: string; action: string }>): boolean => {
    return isAuthenticated && hasAllPermissions(permissionChecks);
  };

  /**
   * Get all user permissions
   */
  const getUserPermissions = () => {
    return permissions;
  };

  /**
   * Check if permissions are currently being loaded
   */
  const isPermissionsLoading = (): boolean => {
    return !isInitialized || isLoading;
  };

  return {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    getUserPermissions,
    isPermissionsLoading,
    isAuthenticated,
    isInitialized,
  };
};

export default usePermissions;