import React from 'react';
import { useAuthStore } from '../../stores/authStore';

interface BasePermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

interface SinglePermissionProps extends BasePermissionGuardProps {
  resource: string;
  action: string;
  permissions?: never;
  requireAll?: never;
}

interface MultiplePermissionProps extends BasePermissionGuardProps {
  resource?: never;
  action?: never;
  permissions: Array<{ resource: string; action: string }>;
  requireAll?: boolean; // If true, user must have ALL permissions. If false, user needs ANY permission.
}

type PermissionGuardProps = SinglePermissionProps | MultiplePermissionProps;

/**
 * PermissionGuard component that conditionally renders children based on user permissions
 * 
 * Single permission mode:
 * @param resource - The resource name (e.g., "Category", "User")
 * @param action - The action name (e.g., "View", "Create", "Update", "Delete")
 * 
 * Multiple permissions mode:
 * @param permissions - Array of permission objects with resource and action
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission (default: false)
 * 
 * Common props:
 * @param children - Content to render when user has permission
 * @param fallback - Content to render when user lacks permission (optional)
 * @param showLoading - Whether to show loading state while permissions are being checked (default: true)
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  showLoading = true,
}) => {
  const { 
    hasPermission, 
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated, 
    isInitialized, 
    isLoading 
  } = useAuthStore();

  // Show loading state while auth is being initialized or permissions are loading
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

  let hasRequiredPermission = false;

  // Check permissions based on the mode
  if (permissions && permissions.length > 0) {
    // Multiple permissions mode
    if (requireAll) {
      hasRequiredPermission = hasAllPermissions(permissions);
    } else {
      hasRequiredPermission = hasAnyPermission(permissions);
    }
  } else if (resource && action) {
    // Single permission mode
    hasRequiredPermission = hasPermission(resource, action);
  } else {
    // Invalid props - neither single nor multiple permission mode
    console.warn('PermissionGuard: Either provide resource+action or permissions array');
    return <>{fallback}</>;
  }

  // Render children if user has permission, otherwise render fallback
  return hasRequiredPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;