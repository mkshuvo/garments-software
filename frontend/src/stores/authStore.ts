import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => void;
  clearAuthState: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setPermissions: (permissions: Permission[]) => void;
  setRoles: (roles: string[]) => void;
  checkAuth: () => Promise<void>;
  loadUserPermissions: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAllRoles: (roleNames: string[]) => boolean;
  hasAnyPermission: (permissionChecks: Array<{ resource: string; action: string }>) => boolean;
  hasAllPermissions: (permissionChecks: Array<{ resource: string; action: string }>) => boolean;
  refreshTokenIfNeeded: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissions: [],
      roles: [],
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      
      login: async (user: User, token: string) => {
        set({ isLoading: true });
        
        try {
          // Import apiService dynamically to avoid circular dependency
          const { apiService } = await import('../services/apiService');
          
          // Validate token before setting it
          const isValidToken = await apiService.validateCurrentToken() || token.split('.').length === 3;
          if (!isValidToken) {
            throw new Error('Invalid token format');
          }
          
          // Set token in both localStorage and apiService
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
          }
          apiService.setToken(token);
          
          // Extract roles from user object
          const userRoles = user.roles || (user.role ? [user.role] : []);
          
          // Update auth state
          set({
            user,
            token,
            roles: userRoles,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
          });
          
          // Load user permissions after successful login
          await get().loadUserPermissions();
        } catch (error) {
          console.error('Error during login:', error);
          // Clear any partial state on error
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({ 
            user: null,
            token: null,
            permissions: [],
            roles: [],
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false 
          });
          throw error;
        }
      },
      
      logout: () => {
        get().clearAuthState();
      },

      clearAuthState: async () => {
        try {
          // Remove token from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          
          // Import apiService dynamically to avoid circular dependency
          const { apiService } = await import('../services/apiService');
          apiService.removeToken();
          
          // Clear permission cache
          const { permissionService } = await import('../services/permissionService');
          permissionService.clearPermissionCache();
          
          set({
            user: null,
            token: null,
            permissions: [],
            roles: [],
            isAuthenticated: false,
            isInitialized: true, // Keep initialized state after logout
            isLoading: false, // Ensure loading state is cleared
          });
        } catch (error) {
          console.error('Error clearing auth state:', error);
          // Still clear the state even if there's an error
          set({
            user: null,
            token: null,
            permissions: [],
            roles: [],
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
          });
        }
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          const userRoles = updatedUser.roles || (updatedUser.role ? [updatedUser.role] : []);
          
          set({
            user: updatedUser,
            roles: userRoles,
          });
        }
      },
      
      setPermissions: (permissions: Permission[]) => {
        set({ permissions });
      },
      
      setRoles: (roles: string[]) => {
        set({ roles });
        // Refresh permissions when roles change
        get().loadUserPermissions();
      },
      
      checkAuth: async () => {
        const state = get();
        
        // Set loading state during initialization
        set({ isLoading: true });
        
        try {
          // If we have user and token from persistence, restore authentication
          if (state.user && state.token) {
            // Import apiService dynamically to avoid circular dependency
            const { apiService } = await import('../services/apiService');
            
            // Validate token before using it
            const isTokenValid = await apiService.validateCurrentToken() || 
                               (state.token.split('.').length === 3);
            
            if (!isTokenValid) {
              console.warn('Stored token is invalid, clearing auth state');
              throw new Error('Invalid stored token');
            }
            
            // Ensure token is properly synchronized
            if (typeof window !== 'undefined') {
              const storedToken = localStorage.getItem('auth_token');
              if (storedToken !== state.token) {
                localStorage.setItem('auth_token', state.token);
              }
            }
            
            // Set token in apiService
            apiService.setToken(state.token);
            
            // Verify token is still valid by making a test request
            try {
              const { authService } = await import('../services/authService');
              const currentUserResponse = await authService.getCurrentUser();
              
              // Update user data if it has changed, otherwise use stored user
              const updatedUser = (currentUserResponse && typeof currentUserResponse === 'object' && 'id' in currentUserResponse) 
                ? currentUserResponse as User 
                : state.user;
              const userRoles = updatedUser.roles || (updatedUser.role ? [updatedUser.role] : []);
              
              // Update authentication state
              set({ 
                user: updatedUser,
                isAuthenticated: true,
                roles: userRoles,
                isInitialized: true,
                isLoading: false,
              });
              
              // Load user permissions after successful auth restoration
              await get().loadUserPermissions();
            } catch (tokenError) {
              console.warn('Token validation failed during auth check:', tokenError);
              
              // Try to refresh token if available
              const refreshSuccess = await apiService.refreshToken();
              if (refreshSuccess) {
                // Retry with refreshed token
                const newToken = localStorage.getItem('auth_token');
                if (newToken) {
                  set({ token: newToken });
                  // Recursively call checkAuth with new token
                  return get().checkAuth();
                }
              }
              
              // Token refresh failed or not available, clear auth state
              throw tokenError;
            }
          } else {
            // No valid auth data, ensure we're logged out
            await get().clearAuthState();
          }
        } catch (error) {
          console.error('Error during auth check:', error);
          
          // On error, clear auth state completely
          await get().clearAuthState();
        }
      },
      
      loadUserPermissions: async () => {
        const state = get();
        
        if (!state.user || !state.isAuthenticated) {
          return;
        }
        
        try {
          // Check if token is still valid before making the request
          const { apiService } = await import('../services/apiService');
          const isTokenValid = await apiService.validateCurrentToken();
          
          if (!isTokenValid) {
            // Try to refresh token
            const refreshSuccess = await apiService.refreshToken();
            if (!refreshSuccess) {
              console.warn('Token expired and refresh failed, clearing auth state');
              await get().clearAuthState();
              return;
            }
            // Update token in state after refresh
            const newToken = localStorage.getItem('auth_token');
            if (newToken) {
              set({ token: newToken });
            }
          }
          
          const { permissionService } = await import('../services/permissionService');
          const permissions = await permissionService.getMyPermissionsCached();
          
          set({ permissions });
        } catch (error) {
          console.error('Error loading user permissions:', error);
          
          // Check if it's an auth error
          if (error && typeof error === 'object' && 'status' in error && 
              (error.status === 401 || error.status === 403)) {
            console.warn('Authentication error while loading permissions, clearing auth state');
            await get().clearAuthState();
          } else {
            // Don't fail the entire auth process if permissions can't be loaded
            // Just log the error and continue with empty permissions
            set({ permissions: [] });
          }
        }
      },

      refreshPermissions: async () => {
        const state = get();
        
        if (!state.user || !state.isAuthenticated) {
          return;
        }
        
        try {
          const { permissionService } = await import('../services/permissionService');
          const permissions = await permissionService.getMyPermissionsCached(true); // Force refresh
          
          set({ permissions });
        } catch (error) {
          console.error('Error refreshing user permissions:', error);
          
          // Check if it's an auth error
          if (error && typeof error === 'object' && 'status' in error && 
              (error.status === 401 || error.status === 403)) {
            console.warn('Authentication error while refreshing permissions, clearing auth state');
            await get().clearAuthState();
          }
        }
      },
      
      hasPermission: (resource: string, action: string) => {
        const { permissions, isAuthenticated } = get();
        
        // If not authenticated, no permissions
        if (!isAuthenticated) {
          return false;
        }
        
        // Check if user has the specific permission
        return permissions.some(p => 
          p.resource === resource && 
          p.action === action && 
          p.isActive
        );
      },
      
      hasRole: (roleName: string) => {
        const { roles } = get();
        return roles.includes(roleName);
      },

      hasAnyRole: (roleNames: string[]) => {
        const { roles } = get();
        return roleNames.some(role => roles.includes(role));
      },

      hasAllRoles: (roleNames: string[]) => {
        const { roles } = get();
        return roleNames.every(role => roles.includes(role));
      },

      hasAnyPermission: (permissionChecks: Array<{ resource: string; action: string }>) => {
        const { permissions, isAuthenticated } = get();
        
        if (!isAuthenticated) {
          return false;
        }
        
        return permissionChecks.some(({ resource, action }) =>
          permissions.some(p => 
            p.resource === resource && 
            p.action === action && 
            p.isActive
          )
        );
      },

      hasAllPermissions: (permissionChecks: Array<{ resource: string; action: string }>) => {
        const { permissions, isAuthenticated } = get();
        
        if (!isAuthenticated) {
          return false;
        }
        
        return permissionChecks.every(({ resource, action }) =>
          permissions.some(p => 
            p.resource === resource && 
            p.action === action && 
            p.isActive
          )
        );
      },

      // Method to handle automatic token refresh
      refreshTokenIfNeeded: async (): Promise<boolean> => {
        const state = get();
        
        if (!state.token || !state.isAuthenticated) {
          return false;
        }
        
        try {
          const { apiService } = await import('../services/apiService');
          const isTokenValid = await apiService.validateCurrentToken();
          
          if (!isTokenValid) {
            console.log('Token is invalid, attempting refresh...');
            const refreshSuccess = await apiService.refreshToken();
            
            if (refreshSuccess) {
              const newToken = localStorage.getItem('auth_token');
              if (newToken) {
                set({ token: newToken });
                console.log('Token refreshed successfully');
                return true;
              }
            }
            
            console.warn('Token refresh failed');
            await get().clearAuthState();
            return false;
          }
          
          return true;
        } catch (error) {
          console.error('Error during token refresh:', error);
          await get().clearAuthState();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        permissions: state.permissions,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
      }),
      // Add version for migration if needed in the future
      version: 1,
    }
  )
);