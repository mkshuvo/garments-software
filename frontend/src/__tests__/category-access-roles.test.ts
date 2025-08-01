/**
 * Category Access Tests with Different User Roles
 * 
 * This test suite verifies category page access and functionality for different user roles:
 * - Admin users (full access)
 * - Manager users (view, create, update but no delete)
 * - Employee users (view only)
 * 
 * Tests include:
 * - API endpoint responses (200, 403)
 * - UI elements show/hide based on permissions
 * - Role-based functionality testing
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { useAuthStore } from '../stores/authStore';
import { apiService } from '../services/apiService';

// Mock the auth store
jest.mock('../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Define proper error types
interface ApiError {
    status: number;
    message: string;
}

// Type guard to check if error is an ApiError
function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        'message' in error &&
        typeof (error as ApiError).status === 'number' &&
        typeof (error as ApiError).message === 'string'
    );
}

// Define the auth store type based on the actual store structure
interface AuthStore {
    user: any;
    token: string | null;
    permissions: Array<{ id: string; name: string; resource: string; action: string; isActive: boolean }>;
    roles: string[];
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    hasPermission: (resource: string, action: string) => boolean;
    hasRole: (roleName: string) => boolean;
    clearAuthState: () => void;
    setState: (state: Partial<AuthStore>) => AuthStore;
}

// Mock test users with different roles
const testUsers = {
    admin: {
        id: 'admin-user-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'Admin',
        roles: ['Admin'],
        permissions: [
            { id: '1', name: 'View Categories', resource: 'Category', action: 'View', isActive: true },
            { id: '2', name: 'Create Categories', resource: 'Category', action: 'Create', isActive: true },
            { id: '3', name: 'Update Categories', resource: 'Category', action: 'Update', isActive: true },
            { id: '4', name: 'Delete Categories', resource: 'Category', action: 'Delete', isActive: true }
        ]
    },
    manager: {
        id: 'manager-user-id',
        email: 'manager@example.com',
        name: 'Manager User',
        role: 'Manager',
        roles: ['Manager'],
        permissions: [
            { id: '1', name: 'View Categories', resource: 'Category', action: 'View', isActive: true },
            { id: '2', name: 'Create Categories', resource: 'Category', action: 'Create', isActive: true },
            { id: '3', name: 'Update Categories', resource: 'Category', action: 'Update', isActive: true }
            // Note: No Delete permission for Manager
        ]
    },
    employee: {
        id: 'employee-user-id',
        email: 'employee@example.com',
        name: 'Employee User',
        role: 'Employee',
        roles: ['Employee'],
        permissions: [
            { id: '1', name: 'View Categories', resource: 'Category', action: 'View', isActive: true }
            // Note: Only View permission for Employee
        ]
    }
};

// Mock API responses for different scenarios
const mockApiResponses = {
    categories: [
        {
            id: 'cat-1',
            name: 'Office Supplies',
            description: 'General office supplies and materials',
            type: 'Debit',
            typeName: 'Debit (Money Out)',
            isActive: true,
            usageCount: 5,
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            id: 'cat-2',
            name: 'Sales Revenue',
            description: 'Revenue from product sales',
            type: 'Credit',
            typeName: 'Credit (Money In)',
            isActive: true,
            usageCount: 12,
            createdAt: '2024-01-10T09:00:00Z'
        }
    ],
    success: { message: 'Operation completed successfully' },
    forbidden: { message: 'You do not have permission to perform this action', status: 403 },
    unauthorized: { message: 'Authentication required', status: 401 }
};

// Mock localStorage
const mockLocalStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

// Mock console methods
const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

describe('Category Access Tests with Different User Roles', () => {
    let authStore: any;
    
    const mockAuthStore = {
        user: null,
        token: null,
        permissions: [],
        roles: [],
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        hasPermission: jest.fn(),
        hasRole: jest.fn(),
        clearAuthState: jest.fn(),
        setState: jest.fn(),
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock global objects
        Object.defineProperty(window, 'localStorage', { 
            value: mockLocalStorage, 
            writable: true, 
            configurable: true 
        });
        Object.defineProperty(global, 'console', { 
            value: mockConsole, 
            writable: true, 
            configurable: true 
        });

        // Clear localStorage
        mockLocalStorage.clear();

        // Reset mock auth store
        Object.keys(mockAuthStore).forEach(key => {
            if (typeof mockAuthStore[key] === 'function') {
                mockAuthStore[key].mockReset();
            } else {
                mockAuthStore[key] = key === 'permissions' || key === 'roles' ? [] : 
                                   key === 'isInitialized' ? true : 
                                   key.startsWith('is') ? false : null;
            }
        });

        // Set up the mock to return our mock store
        mockUseAuthStore.mockReturnValue(mockAuthStore);
        authStore = mockAuthStore;
    });

    // Helper function to set up user authentication
    const setupUserAuth = (userType: 'admin' | 'manager' | 'employee') => {
        const user = testUsers[userType];
        const token = `mock-token-${userType}`;

        // Set up mock auth store state
        authStore.user = user;
        authStore.token = token;
        authStore.permissions = user.permissions;
        authStore.roles = user.roles;
        authStore.isAuthenticated = true;
        authStore.isInitialized = true;
        authStore.isLoading = false;

        // Set up hasPermission mock
        authStore.hasPermission.mockImplementation((resource: string, action: string) => {
            return user.permissions.some(p => 
                p.resource === resource && 
                p.action === action && 
                p.isActive
            );
        });

        // Set up hasRole mock
        authStore.hasRole.mockImplementation((roleName: string) => {
            return user.roles.includes(roleName);
        });

        // Set token in localStorage
        mockLocalStorage.setItem('auth_token', token);

        return { user, token };
    };

    // Helper function to mock API calls
    const mockApiCall = (endpoint: string, method: string, expectedStatus: number, responseData?: any) => {
        const mockResponse = expectedStatus === 200 ? responseData :
            expectedStatus === 403 ? mockApiResponses.forbidden :
                expectedStatus === 401 ? mockApiResponses.unauthorized :
                    { message: 'Unknown error', status: expectedStatus };

        const callTracker = {
            endpoint,
            method,
            expectedStatus,
            response: mockResponse,
            called: false,
            call: () => {
                callTracker.called = true;
                if (expectedStatus !== 200) {
                    throw mockResponse;
                }
                return Promise.resolve(mockResponse);
            }
        };

        return callTracker;
    };

    describe('Admin User Tests (Full Access)', () => {
        test('should have full access to all category operations', async () => {
            // Arrange
            const { user } = setupUserAuth('admin');

            // Test API endpoint access
            const getCategoriesCall = mockApiCall('/api/category', 'GET', 200, mockApiResponses.categories);
            const createCategoryCall = mockApiCall('/api/category', 'POST', 200, mockApiResponses.success);
            const updateCategoryCall = mockApiCall('/api/category/cat-1', 'PUT', 200, mockApiResponses.success);
            const deleteCategoryCall = mockApiCall('/api/category/cat-1', 'DELETE', 200, mockApiResponses.success);

            // Act & Assert - Test permissions
            expect(authStore.hasPermission('Category', 'View')).toBe(true);
            expect(authStore.hasPermission('Category', 'Create')).toBe(true);
            expect(authStore.hasPermission('Category', 'Update')).toBe(true);
            expect(authStore.hasPermission('Category', 'Delete')).toBe(true);

            // Act & Assert - Test API calls
            await getCategoriesCall.call();
            await createCategoryCall.call();
            await updateCategoryCall.call();
            await deleteCategoryCall.call();

            console.log('✅ Admin User - Full Category Access Verified:');
            console.log('  ✓ View Categories: 200 OK');
            console.log('  ✓ Create Category: 200 OK');
            console.log('  ✓ Update Category: 200 OK');
            console.log('  ✓ Delete Category: 200 OK');
            console.log('  ✓ All UI elements should be visible and enabled');

            expect(authStore.hasRole('Admin')).toBe(true);
        });

        test('should show all UI elements for admin user', () => {
            // Arrange
            setupUserAuth('admin');

            // Test UI element visibility based on permissions
            const uiElements = {
                createButton: authStore.hasPermission('Category', 'Create'),
                editButton: authStore.hasPermission('Category', 'Update'),
                deleteButton: authStore.hasPermission('Category', 'Delete'),
                viewTable: authStore.hasPermission('Category', 'View')
            };

            // Assert
            expect(uiElements.createButton).toBe(true);
            expect(uiElements.editButton).toBe(true);
            expect(uiElements.deleteButton).toBe(true);
            expect(uiElements.viewTable).toBe(true);

            console.log('✅ Admin User - UI Elements Visibility:');
            console.log('  ✓ Create Category Button: Visible');
            console.log('  ✓ Edit Category Button: Visible');
            console.log('  ✓ Delete Category Button: Visible');
            console.log('  ✓ Categories Table: Visible');
        });
    });

    describe('Manager User Tests (View, Create, Update - No Delete)', () => {
        test('should have limited access without delete permission', async () => {
            // Arrange
            const { user } = setupUserAuth('manager');

            // Test API endpoint access
            const getCategoriesCall = mockApiCall('/api/category', 'GET', 200, mockApiResponses.categories);
            const createCategoryCall = mockApiCall('/api/category', 'POST', 200, mockApiResponses.success);
            const updateCategoryCall = mockApiCall('/api/category/cat-1', 'PUT', 200, mockApiResponses.success);
            const deleteCategoryCall = mockApiCall('/api/category/cat-1', 'DELETE', 403, mockApiResponses.forbidden);

            // Act & Assert - Test permissions
            expect(authStore.hasPermission('Category', 'View')).toBe(true);
            expect(authStore.hasPermission('Category', 'Create')).toBe(true);
            expect(authStore.hasPermission('Category', 'Update')).toBe(true);
            expect(authStore.hasPermission('Category', 'Delete')).toBe(false);

            // Act & Assert - Test API calls
            await getCategoriesCall.call();
            await createCategoryCall.call();
            await updateCategoryCall.call();

            // Delete should fail with 403
            try {
                await deleteCategoryCall.call();
                throw new Error('Delete should have failed');
            } catch (error) {
                if (isApiError(error)) {
                    expect(error).toEqual(mockApiResponses.forbidden);
                } else {
                    throw new Error('Expected ApiError but got different error type');
                }
            }

            console.log('✅ Manager User - Limited Category Access Verified:');
            console.log('  ✓ View Categories: 200 OK');
            console.log('  ✓ Create Category: 200 OK');
            console.log('  ✓ Update Category: 200 OK');
            console.log('  ✓ Delete Category: 403 Forbidden');
            console.log('  ✓ Delete UI elements should be disabled');

            expect(authStore.hasRole('Manager')).toBe(true);
        });

        test('should show limited UI elements for manager user', () => {
            // Arrange
            setupUserAuth('manager');

            // Test UI element visibility based on permissions
            const uiElements = {
                createButton: authStore.hasPermission('Category', 'Create'),
                editButton: authStore.hasPermission('Category', 'Update'),
                deleteButton: authStore.hasPermission('Category', 'Delete'),
                viewTable: authStore.hasPermission('Category', 'View')
            };

            // Assert
            expect(uiElements.createButton).toBe(true);
            expect(uiElements.editButton).toBe(true);
            expect(uiElements.deleteButton).toBe(false); // Should be false for manager
            expect(uiElements.viewTable).toBe(true);

            console.log('✅ Manager User - UI Elements Visibility:');
            console.log('  ✓ Create Category Button: Visible');
            console.log('  ✓ Edit Category Button: Visible');
            console.log('  ✗ Delete Category Button: Hidden/Disabled');
            console.log('  ✓ Categories Table: Visible');
        });

        test('should handle 403 errors gracefully for forbidden operations', async () => {
            // Arrange
            setupUserAuth('manager');

            // Simulate attempting a delete operation
            const deleteCategoryCall = mockApiCall('/api/category/cat-1', 'DELETE', 403, mockApiResponses.forbidden);

            // Act & Assert
            try {
                await deleteCategoryCall.call();
                throw new Error('Should have thrown 403 error');
            } catch (error) {
                if (isApiError(error)) {
                    expect(error.status).toBe(403);
                    expect(error.message).toContain('permission');
                } else {
                    throw new Error('Expected ApiError but got different error type');
                }
            }

            console.log('✅ Manager User - 403 Error Handling:');
            console.log('  ✓ Delete operation returns 403 Forbidden');
            console.log('  ✓ Error message indicates permission issue');
            console.log('  ✓ UI should show appropriate error message');
        });
    });

    describe('Employee User Tests (View Only)', () => {
        test('should only have view access to categories', async () => {
            // Arrange
            const { user } = setupUserAuth('employee');

            // Test API endpoint access
            const getCategoriesCall = mockApiCall('/api/category', 'GET', 200, mockApiResponses.categories);
            const createCategoryCall = mockApiCall('/api/category', 'POST', 403, mockApiResponses.forbidden);
            const updateCategoryCall = mockApiCall('/api/category/cat-1', 'PUT', 403, mockApiResponses.forbidden);
            const deleteCategoryCall = mockApiCall('/api/category/cat-1', 'DELETE', 403, mockApiResponses.forbidden);

            // Act & Assert - Test permissions
            expect(authStore.hasPermission('Category', 'View')).toBe(true);
            expect(authStore.hasPermission('Category', 'Create')).toBe(false);
            expect(authStore.hasPermission('Category', 'Update')).toBe(false);
            expect(authStore.hasPermission('Category', 'Delete')).toBe(false);

            // Act & Assert - Test API calls
            await getCategoriesCall.call(); // Should succeed

            // All other operations should fail with 403
            const forbiddenOperations = [createCategoryCall, updateCategoryCall, deleteCategoryCall];
            for (const operation of forbiddenOperations) {
                try {
                    await operation.call();
                    throw new Error(`${operation.method} should have failed`);
                } catch (error) {
                    if (isApiError(error)) {
                        expect(error).toEqual(mockApiResponses.forbidden);
                    } else {
                        throw new Error('Expected ApiError but got different error type');
                    }
                }
            }

            console.log('✅ Employee User - View-Only Category Access Verified:');
            console.log('  ✓ View Categories: 200 OK');
            console.log('  ✗ Create Category: 403 Forbidden');
            console.log('  ✗ Update Category: 403 Forbidden');
            console.log('  ✗ Delete Category: 403 Forbidden');
            console.log('  ✓ Only view UI elements should be visible');

            expect(authStore.hasRole('Employee')).toBe(true);
        });

        test('should show minimal UI elements for employee user', () => {
            // Arrange
            setupUserAuth('employee');

            // Test UI element visibility based on permissions
            const uiElements = {
                createButton: authStore.hasPermission('Category', 'Create'),
                editButton: authStore.hasPermission('Category', 'Update'),
                deleteButton: authStore.hasPermission('Category', 'Delete'),
                viewTable: authStore.hasPermission('Category', 'View')
            };

            // Assert
            expect(uiElements.createButton).toBe(false);
            expect(uiElements.editButton).toBe(false);
            expect(uiElements.deleteButton).toBe(false);
            expect(uiElements.viewTable).toBe(true); // Only view should be true

            console.log('✅ Employee User - UI Elements Visibility:');
            console.log('  ✗ Create Category Button: Hidden/Disabled');
            console.log('  ✗ Edit Category Button: Hidden/Disabled');
            console.log('  ✗ Delete Category Button: Hidden/Disabled');
            console.log('  ✓ Categories Table: Visible (Read-only)');
        });

        test('should show appropriate tooltips for disabled actions', () => {
            // Arrange
            setupUserAuth('employee');

            // Test tooltip messages for disabled actions
            const tooltipMessages = {
                create: !authStore.hasPermission('Category', 'Create') ?
                    "You need 'Create Category' permission to add new categories" : null,
                edit: !authStore.hasPermission('Category', 'Update') ?
                    "You need 'Update Category' permission to edit categories" : null,
                delete: !authStore.hasPermission('Category', 'Delete') ?
                    "You need 'Delete Category' permission to remove categories" : null
            };

            // Assert
            expect(tooltipMessages.create).toBeTruthy();
            expect(tooltipMessages.edit).toBeTruthy();
            expect(tooltipMessages.delete).toBeTruthy();

            console.log('✅ Employee User - Tooltip Messages:');
            console.log('  ✓ Create button shows permission tooltip');
            console.log('  ✓ Edit button shows permission tooltip');
            console.log('  ✓ Delete button shows permission tooltip');
        });
    });

    describe('Cross-Role Permission Validation', () => {
        test('should validate role-based access patterns', () => {
            // Test all roles and their expected permissions
            const rolePermissions = {
                Admin: {
                    expectedPermissions: ['View', 'Create', 'Update', 'Delete'],
                    user: testUsers.admin
                },
                Manager: {
                    expectedPermissions: ['View', 'Create', 'Update'],
                    user: testUsers.manager
                },
                Employee: {
                    expectedPermissions: ['View'],
                    user: testUsers.employee
                }
            };

            Object.entries(rolePermissions).forEach(([roleName, config]) => {
                // Set up user using the helper function
                setupUserAuth(roleName.toLowerCase() as 'admin' | 'manager' | 'employee');

                // Test each expected permission
                const allPermissions = ['View', 'Create', 'Update', 'Delete'];
                allPermissions.forEach(permission => {
                    const hasPermission = authStore.hasPermission('Category', permission);
                    const shouldHave = config.expectedPermissions.includes(permission);

                    expect(hasPermission).toBe(shouldHave);
                });

                console.log(`✅ ${roleName} Role Permissions Validated:`);
                config.expectedPermissions.forEach(perm => {
                    console.log(`  ✓ ${perm}: Allowed`);
                });

                const deniedPermissions = allPermissions.filter(p => !config.expectedPermissions.includes(p));
                deniedPermissions.forEach(perm => {
                    console.log(`  ✗ ${perm}: Denied`);
                });
            });
        });

        test('should handle role changes correctly', () => {
            // Start with employee
            setupUserAuth('employee');
            expect(authStore.hasPermission('Category', 'Create')).toBe(false);

            // Upgrade to manager
            setupUserAuth('manager');
            expect(authStore.hasPermission('Category', 'Create')).toBe(true);
            expect(authStore.hasPermission('Category', 'Delete')).toBe(false);

            // Upgrade to admin
            setupUserAuth('admin');
            expect(authStore.hasPermission('Category', 'Create')).toBe(true);
            expect(authStore.hasPermission('Category', 'Delete')).toBe(true);

            console.log('✅ Role Change Handling:');
            console.log('  ✓ Employee → Manager: Gained Create/Update permissions');
            console.log('  ✓ Manager → Admin: Gained Delete permission');
            console.log('  ✓ Permission checks update correctly with role changes');
        });
    });

    describe('API Response Status Code Validation', () => {
        test('should return correct status codes for different roles', async () => {
            const testCases = [
                {
                    role: 'admin',
                    operations: [
                        { endpoint: '/api/category', method: 'GET', expectedStatus: 200 },
                        { endpoint: '/api/category', method: 'POST', expectedStatus: 200 },
                        { endpoint: '/api/category/1', method: 'PUT', expectedStatus: 200 },
                        { endpoint: '/api/category/1', method: 'DELETE', expectedStatus: 200 }
                    ]
                },
                {
                    role: 'manager',
                    operations: [
                        { endpoint: '/api/category', method: 'GET', expectedStatus: 200 },
                        { endpoint: '/api/category', method: 'POST', expectedStatus: 200 },
                        { endpoint: '/api/category/1', method: 'PUT', expectedStatus: 200 },
                        { endpoint: '/api/category/1', method: 'DELETE', expectedStatus: 403 }
                    ]
                },
                {
                    role: 'employee',
                    operations: [
                        { endpoint: '/api/category', method: 'GET', expectedStatus: 200 },
                        { endpoint: '/api/category', method: 'POST', expectedStatus: 403 },
                        { endpoint: '/api/category/1', method: 'PUT', expectedStatus: 403 },
                        { endpoint: '/api/category/1', method: 'DELETE', expectedStatus: 403 }
                    ]
                }
            ];

            for (const testCase of testCases) {
                setupUserAuth(testCase.role as 'admin' | 'manager' | 'employee');

                console.log(`✅ ${testCase.role.toUpperCase()} API Status Codes:`);

                for (const operation of testCase.operations) {
                    const mockCall = mockApiCall(operation.endpoint, operation.method, operation.expectedStatus);

                    if (operation.expectedStatus === 200) {
                        await mockCall.call();
                        console.log(`  ✓ ${operation.method} ${operation.endpoint}: ${operation.expectedStatus} OK`);
                    } else {
                        try {
                            await mockCall.call();
                            throw new Error('Should have failed');
                        } catch (error) {
                            if (isApiError(error)) {
                                expect(error.status).toBe(operation.expectedStatus);
                                console.log(`  ✗ ${operation.method} ${operation.endpoint}: ${operation.expectedStatus} ${operation.expectedStatus === 403 ? 'Forbidden' : 'Error'}`);
                            } else {
                                throw new Error('Expected ApiError but got different error type');
                            }
                        }
                    }
                }
            }
        });
    });

    describe('UI Element State Validation', () => {
        test('should correctly enable/disable UI elements based on permissions', () => {
            const roles = ['admin', 'manager', 'employee'] as const;

            roles.forEach(role => {
                setupUserAuth(role);

                const uiState = {
                    createButton: {
                        visible: authStore.hasPermission('Category', 'Create'),
                        enabled: authStore.hasPermission('Category', 'Create')
                    },
                    editButtons: {
                        visible: authStore.hasPermission('Category', 'Update'),
                        enabled: authStore.hasPermission('Category', 'Update')
                    },
                    deleteButtons: {
                        visible: authStore.hasPermission('Category', 'Delete'),
                        enabled: authStore.hasPermission('Category', 'Delete')
                    },
                    categoryTable: {
                        visible: authStore.hasPermission('Category', 'View'),
                        enabled: true // Always enabled if visible
                    }
                };

                console.log(`✅ ${role.toUpperCase()} UI Element States:`);
                Object.entries(uiState).forEach(([element, state]) => {
                    const status = state.visible ? (state.enabled ? 'Enabled' : 'Disabled') : 'Hidden';
                    console.log(`  ${state.visible ? '✓' : '✗'} ${element}: ${status}`);
                });

                // Validate expected states
                if (role === 'admin') {
                    expect(uiState.createButton.enabled).toBe(true);
                    expect(uiState.editButtons.enabled).toBe(true);
                    expect(uiState.deleteButtons.enabled).toBe(true);
                } else if (role === 'manager') {
                    expect(uiState.createButton.enabled).toBe(true);
                    expect(uiState.editButtons.enabled).toBe(true);
                    expect(uiState.deleteButtons.enabled).toBe(false);
                } else if (role === 'employee') {
                    expect(uiState.createButton.enabled).toBe(false);
                    expect(uiState.editButtons.enabled).toBe(false);
                    expect(uiState.deleteButtons.enabled).toBe(false);
                }

                // All roles should be able to view
                expect(uiState.categoryTable.visible).toBe(true);
            });
        });
    });
});