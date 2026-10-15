import React from 'react';
import { useAuthStore } from '../../stores/authStore';

interface BaseRoleGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

interface SingleRoleProps extends BaseRoleGuardProps {
  role: string;
  roles?: never;
  requireAll?: never;
}

interface MultipleRoleProps extends BaseRoleGuardProps {
  role?: never;
  roles: string[];
  requireAll?: boolean; // If true, user must have ALL roles. If false, user needs ANY role.
}

interface InvalidRoleProps extends BaseRoleGuardProps {
  role?: never;
  roles?: never;
  requireAll?: never;
}

type RoleGuardProps = SingleRoleProps | MultipleRoleProps | InvalidRoleProps;

/**
 * RoleGuard component that conditionally renders children based on user roles
 * 
 * Single role mode:
 * @param role - The role name (e.g., "Admin", "Manager", "Employee")
 * 
 * Multiple roles mode:
 * @param roles - Array of role names
 * @param requireAll - If true, user must have ALL roles. If false, user needs ANY role (default: false)
 * 
 * Common props:
 * @param children - Content to render when user has required role(s)
 * @param fallback - Content to render when user lacks required role(s) (optional)
 * @param showLoading - Whether to show loading state while auth is being checked (default: true)
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  roles,
  requireAll = false,
  children,
  fallback = null,
  showLoading = true,
}) => {
  const { 
    hasRole, 
    hasAnyRole,
    hasAllRoles,
    isAuthenticated, 
    isInitialized, 
    isLoading 
  } = useAuthStore();

  // Show loading state while auth is being initialized
  if (!isInitialized || (isLoading && showLoading)) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  // If not authenticated, don't render anything (or render fallback)
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  let hasRequiredRole = false;

  // Check roles based on the mode
  if (roles && roles.length > 0) {
    // Multiple roles mode
    if (requireAll) {
      hasRequiredRole = hasAllRoles(roles);
    } else {
      hasRequiredRole = hasAnyRole(roles);
    }
  } else if (role) {
    // Single role mode
    hasRequiredRole = hasRole(role);
  } else {
    // Invalid props - neither single nor multiple role mode
    console.warn('RoleGuard: Either provide role or roles array');
    return <>{fallback}</>;
  }

  // Render children if user has required role(s), otherwise render fallback
  return hasRequiredRole ? <>{children}</> : <>{fallback}</>;
};

export default RoleGuard;