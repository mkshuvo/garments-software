import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook for role checking
 * Provides convenient methods for checking roles in components
 */
export const useRoles = () => {
  const {
    hasRole,
    hasAnyRole,
    hasAllRoles,
    isAuthenticated,
    isInitialized,
    isLoading,
    roles,
  } = useAuthStore();

  /**
   * Check if user has a specific role
   */
  const checkRole = (roleName: string): boolean => {
    return isAuthenticated && hasRole(roleName);
  };

  /**
   * Check if user has any of the specified roles
   */
  const checkAnyRole = (roleNames: string[]): boolean => {
    return isAuthenticated && hasAnyRole(roleNames);
  };

  /**
   * Check if user has all of the specified roles
   */
  const checkAllRoles = (roleNames: string[]): boolean => {
    return isAuthenticated && hasAllRoles(roleNames);
  };

  /**
   * Get all user roles
   */
  const getUserRoles = () => {
    return roles;
  };

  /**
   * Check if auth state is currently being loaded
   */
  const isRolesLoading = (): boolean => {
    return !isInitialized || isLoading;
  };

  /**
   * Check if user is an admin
   */
  const isAdmin = (): boolean => {
    return checkRole('Admin');
  };

  /**
   * Check if user is a manager
   */
  const isManager = (): boolean => {
    return checkRole('Manager');
  };

  /**
   * Check if user is an employee
   */
  const isEmployee = (): boolean => {
    return checkRole('Employee');
  };

  /**
   * Check if user has admin or manager role
   */
  const isAdminOrManager = (): boolean => {
    return checkAnyRole(['Admin', 'Manager']);
  };

  return {
    checkRole,
    checkAnyRole,
    checkAllRoles,
    getUserRoles,
    isRolesLoading,
    isAdmin,
    isManager,
    isEmployee,
    isAdminOrManager,
    isAuthenticated,
    isInitialized,
  };
};

export default useRoles;