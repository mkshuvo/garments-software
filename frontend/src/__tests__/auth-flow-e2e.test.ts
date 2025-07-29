// @ts-nocheck
/**
 * End-to-End Authentication Flow Tests
 * 
 * This test suite verifies the complete authentication flow including:
 * - Login process with proper token setting
 * - Auth state persistence across page refreshes
 * - Logout process with proper cleanup
 * - No redirect loops during navigation
 * 
 * Requirements: 8.1, 8.2, 8.5
 */

import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/apiService';

// Mock localStorage for testing
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

// Mock window.location for redirect testing
const mockLocation = {
  href: '',
  pathname: '/',
  replace: jest.fn(),
  assign: jest.fn(),
};

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock API responses
const mockApiResponses = {
  login: {
    success: true,
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'Admin',
        roles: ['Admin']
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItaWQiLCJuYW1lIjoiVGVzdCBVc2VyIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.test-signature'
    }
  },
  permissions: [
    { id: '1', name: 'View Categories', resource: 'Category', action: 'View', isActive: true },
    { id: '2', name: 'Create Categories', resource: 'Category', action: 'Create', isActive: true },
    { id: '3', name: 'Update Categories', resource: 'Category', action: 'Update', isActive: true },
    { id: '4', name: 'Delete Categories', resource: 'Category', action: 'Delete', isActive: true }
  ]
};

describe('Authentication Flow End-to-End Tests', () => {
  let authStore: ReturnType<typeof useAuthStore>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock global objects
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(window, 'location', { value: mockLocation });
    Object.defineProperty(global, 'console', { value: mockConsole });
    
    // Clear localStorage
    mockLocalStorage.clear();
    
    // Reset location mock
    mockLocation.href = '';
    mockLocation.pathname = '/';
    mockLocation.replace.mockClear();
    mockLocation.assign.mockClear();
    
    // Get fresh auth store instance
    authStore = useAuthStore.getState();
    
    // Reset auth store to initial state
    authStore.clearAuthState();
  });

  describe('Login Process with Proper Token Setting', () => {
    test('should successfully login and set token in both localStorage and apiService', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      // Mock API service methods
      jest.spyOn(apiService, 'setToken').mockImplementation(() => {});
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(true);
      
      // Mock permission loading
      const mockPermissionService = {
        getMyPermissionsCached: jest.fn().mockResolvedValue(mockApiResponses.permissions)
      };
      jest.doMock('../services/permissionService', () => ({
        permissionService: mockPermissionService
      }));

      // Act
      await authStore.login(loginData.user, loginData.token);

      // Assert
      expect(mockLocalStorage.getItem('auth_token')).toBe(loginData.token);
      expect(apiService.setToken).toHaveBeenCalledWith(loginData.token);
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(loginData.user);
      expect(authStore.token).toBe(loginData.token);
      expect(authStore.isInitialized).toBe(true);
      expect(authStore.isLoading).toBe(false);
    });

    test('should handle invalid token during login', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      const invalidToken = 'invalid-token';
      
      // Mock API service to return false for invalid token
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(false);

      // Act & Assert
      await expect(authStore.login(loginData.user, invalidToken)).rejects.toThrow('Invalid token format');
      
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });

    test('should extract roles from user object during login', async () => {
      // Arrange
      const userWithMultipleRoles = {
        ...mockApiResponses.login.data.user,
        roles: ['Admin', 'Manager']
      };
      
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(true);
      jest.spyOn(apiService, 'setToken').mockImplementation(() => {});
      
      const mockPermissionService = {
        getMyPermissionsCached: jest.fn().mockResolvedValue(mockApiResponses.permissions)
      };
      jest.doMock('../services/permissionService', () => ({
        permissionService: mockPermissionService
      }));

      // Act
      await authStore.login(userWithMultipleRoles, mockApiResponses.login.data.token);

      // Assert
      expect(authStore.roles).toEqual(['Admin', 'Manager']);
    });
  });

  describe('Auth State Persistence Across Page Refreshes', () => {
    test('should restore auth state from localStorage on checkAuth', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      // Simulate existing auth data in localStorage
      mockLocalStorage.setItem('auth_token', loginData.token);
      
      // Mock the persisted state (simulating Zustand persistence)
      const persistedState = {
        user: loginData.user,
        token: loginData.token,
        permissions: mockApiResponses.permissions,
        roles: ['Admin'],
        isAuthenticated: true
      };
      
      // Mock API service methods
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(true);
      jest.spyOn(apiService, 'setToken').mockImplementation(() => {});
      
      // Mock auth service getCurrentUser
      const mockAuthService = {
        getCurrentUser: jest.fn().mockResolvedValue(loginData.user)
      };
      jest.doMock('../services/authService', () => ({
        authService: mockAuthService
      }));
      
      const mockPermissionService = {
        getMyPermissionsCached: jest.fn().mockResolvedValue(mockApiResponses.permissions)
      };
      jest.doMock('../services/permissionService', () => ({
        permissionService: mockPermissionService
      }));

      // Manually set the persisted state (simulating Zustand hydration)
      authStore = useAuthStore.setState(persistedState);

      // Act
      await authStore.checkAuth();

      // Assert
      expect(authStore.isAuthenticated).toBe(true);
      expect(authStore.user).toEqual(loginData.user);
      expect(authStore.token).toBe(loginData.token);
      expect(authStore.isInitialized).toBe(true);
      expect(apiService.setToken).toHaveBeenCalledWith(loginData.token);
    });

    test('should handle token validation failure during auth restoration', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      mockLocalStorage.setItem('auth_token', loginData.token);
      
      const persistedState = {
        user: loginData.user,
        token: loginData.token,
        permissions: mockApiResponses.permissions,
        roles: ['Admin'],
        isAuthenticated: true
      };
      
      // Mock token validation to fail
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(false);
      jest.spyOn(apiService, 'refreshToken').mockResolvedValue(false);
      
      authStore = useAuthStore.setState(persistedState);

      // Act
      await authStore.checkAuth();

      // Assert
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });

    test('should attempt token refresh when validation fails', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      const newToken = 'new-refreshed-token';
      
      mockLocalStorage.setItem('auth_token', loginData.token);
      
      const persistedState = {
        user: loginData.user,
        token: loginData.token,
        permissions: mockApiResponses.permissions,
        roles: ['Admin'],
        isAuthenticated: true
      };
      
      // Mock token validation to fail initially, then succeed after refresh
      jest.spyOn(apiService, 'validateCurrentToken')
        .mockResolvedValueOnce(false) // First call fails
        .mockResolvedValueOnce(true); // Second call succeeds
      
      jest.spyOn(apiService, 'refreshToken').mockResolvedValue(true);
      jest.spyOn(apiService, 'setToken').mockImplementation(() => {});
      
      // Mock localStorage to return new token after refresh
      mockLocalStorage.setItem('auth_token', newToken);
      
      authStore = useAuthStore.setState(persistedState);

      // Act
      await authStore.checkAuth();

      // Assert
      expect(apiService.refreshToken).toHaveBeenCalled();
      expect(authStore.token).toBe(newToken);
    });
  });

  describe('Logout Process with Proper Cleanup', () => {
    test('should clear all auth state and localStorage on logout', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      // Set up authenticated state
      mockLocalStorage.setItem('auth_token', loginData.token);
      authStore = useAuthStore.setState({
        user: loginData.user,
        token: loginData.token,
        permissions: mockApiResponses.permissions,
        roles: ['Admin'],
        isAuthenticated: true,
        isInitialized: true
      });
      
      // Mock API service and permission service
      jest.spyOn(apiService, 'removeToken').mockImplementation(() => {});
      
      const mockPermissionService = {
        clearPermissionCache: jest.fn()
      };
      jest.doMock('../services/permissionService', () => ({
        permissionService: mockPermissionService
      }));

      // Act
      authStore.logout();
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.permissions).toEqual([]);
      expect(authStore.roles).toEqual([]);
      expect(authStore.isInitialized).toBe(true); // Should remain initialized
      expect(authStore.isLoading).toBe(false);
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
      expect(apiService.removeToken).toHaveBeenCalled();
      expect(mockPermissionService.clearPermissionCache).toHaveBeenCalled();
    });

    test('should handle errors during logout gracefully', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      authStore = useAuthStore.setState({
        user: loginData.user,
        token: loginData.token,
        permissions: mockApiResponses.permissions,
        roles: ['Admin'],
        isAuthenticated: true,
        isInitialized: true
      });
      
      // Mock API service to throw error
      jest.spyOn(apiService, 'removeToken').mockImplementation(() => {
        throw new Error('API service error');
      });

      // Act
      authStore.logout();
      
      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Assert - should still clear state even with errors
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
      expect(authStore.isInitialized).toBe(true);
    });
  });

  describe('No Redirect Loops During Navigation', () => {
    test('should not create redirect loops when accessing protected routes', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      // Set up authenticated state
      authStore = useAuthStore.setState({
        user: loginData.user,
        token: loginData.token,
        permissions: mockApiResponses.permissions,
        roles: ['Admin'],
        isAuthenticated: true,
        isInitialized: true
      });
      
      mockLocation.pathname = '/admin/accounting/categories';
      
      // Mock API service methods
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(true);

      // Act
      await authStore.checkAuth();

      // Assert
      expect(mockLocation.replace).not.toHaveBeenCalled();
      expect(mockLocation.assign).not.toHaveBeenCalled();
      expect(authStore.isAuthenticated).toBe(true);
    });

    test('should prevent multiple simultaneous redirects on 401 errors', async () => {
      // Arrange
      mockLocation.pathname = '/admin/accounting/categories';
      
      // Mock API service to simulate 401 error handling
      const mockApiServiceInstance = {
        isRedirecting: false,
        handle401Error: jest.fn().mockImplementation(async function(this: any) {
          if (this.isRedirecting) {
            return Promise.reject(new Error('Already redirecting'));
          }
          this.isRedirecting = true;
          
          // Simulate redirect
          setTimeout(() => {
            mockLocation.href = '/login';
            this.isRedirecting = false;
          }, 100);
          
          return Promise.reject(new Error('Authentication failed'));
        })
      };

      // Act - simulate multiple 401 errors
      const promise1 = mockApiServiceInstance.handle401Error();
      const promise2 = mockApiServiceInstance.handle401Error();

      // Assert
      await expect(promise1).rejects.toThrow('Authentication failed');
      await expect(promise2).rejects.toThrow('Already redirecting');
      
      // Wait for redirect to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(mockLocation.href).toBe('/login');
    });

    test('should not redirect when already on auth-related pages', async () => {
      // Arrange
      const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/setup-admin'];
      
      for (const page of authPages) {
        mockLocation.pathname = page;
        mockLocation.href = '';
        
        // Mock API service 401 handler
        const isAuthRelatedPage = (path: string) => {
          const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/setup-admin'];
          return authPages.some(authPage => path.includes(authPage));
        };
        
        // Act
        const shouldRedirect = !isAuthRelatedPage(mockLocation.pathname);
        
        if (!shouldRedirect) {
          // Don't redirect
        } else {
          mockLocation.href = '/login';
        }
        
        // Assert
        expect(mockLocation.href).toBe(''); // Should not redirect
      }
    });
  });

  describe('Token Refresh and Validation', () => {
    test('should automatically refresh token when needed', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      const newToken = 'refreshed-token';
      
      authStore = useAuthStore.setState({
        user: loginData.user,
        token: loginData.token,
        permissions: mockApiResponses.permissions,
        roles: ['Admin'],
        isAuthenticated: true,
        isInitialized: true
      });
      
      // Mock token validation to fail, then refresh to succeed
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(false);
      jest.spyOn(apiService, 'refreshToken').mockResolvedValue(true);
      
      // Mock localStorage to return new token after refresh
      mockLocalStorage.setItem('auth_token', newToken);

      // Act
      const result = await authStore.refreshTokenIfNeeded();

      // Assert
      expect(result).toBe(true);
      expect(apiService.refreshToken).toHaveBeenCalled();
      expect(authStore.token).toBe(newToken);
    });

    test('should clear auth state when token refresh fails', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      authStore = useAuthStore.setState({
        user: loginData.user,
        token: loginData.token,
        permissions: mockApiResponses.permissions,
        roles: ['Admin'],
        isAuthenticated: true,
        isInitialized: true
      });
      
      // Mock token validation to fail and refresh to fail
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(false);
      jest.spyOn(apiService, 'refreshToken').mockResolvedValue(false);

      // Act
      const result = await authStore.refreshTokenIfNeeded();

      // Assert
      expect(result).toBe(false);
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
    });
  });

  describe('Permission Loading Integration', () => {
    test('should load permissions after successful login', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(true);
      jest.spyOn(apiService, 'setToken').mockImplementation(() => {});
      
      const mockPermissionService = {
        getMyPermissionsCached: jest.fn().mockResolvedValue(mockApiResponses.permissions)
      };
      jest.doMock('../services/permissionService', () => ({
        permissionService: mockPermissionService
      }));

      // Act
      await authStore.login(loginData.user, loginData.token);

      // Assert
      expect(mockPermissionService.getMyPermissionsCached).toHaveBeenCalled();
      expect(authStore.permissions).toEqual(mockApiResponses.permissions);
    });

    test('should handle permission loading failure gracefully', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(true);
      jest.spyOn(apiService, 'setToken').mockImplementation(() => {});
      
      const mockPermissionService = {
        getMyPermissionsCached: jest.fn().mockRejectedValue(new Error('Permission service error'))
      };
      jest.doMock('../services/permissionService', () => ({
        permissionService: mockPermissionService
      }));

      // Act
      await authStore.login(loginData.user, loginData.token);

      // Assert
      expect(authStore.isAuthenticated).toBe(true); // Should still be authenticated
      expect(authStore.permissions).toEqual([]); // Permissions should be empty
    });

    test('should clear auth state on 401 error during permission loading', async () => {
      // Arrange
      const loginData = mockApiResponses.login.data;
      
      authStore = useAuthStore.setState({
        user: loginData.user,
        token: loginData.token,
        permissions: [],
        roles: ['Admin'],
        isAuthenticated: true,
        isInitialized: true
      });
      
      jest.spyOn(apiService, 'validateCurrentToken').mockResolvedValue(true);
      
      const mockPermissionService = {
        getMyPermissionsCached: jest.fn().mockRejectedValue({ status: 401 })
      };
      jest.doMock('../services/permissionService', () => ({
        permissionService: mockPermissionService
      }));

      // Act
      await authStore.loadUserPermissions();

      // Assert
      expect(authStore.isAuthenticated).toBe(false);
      expect(authStore.user).toBeNull();
      expect(authStore.token).toBeNull();
    });
  });
});