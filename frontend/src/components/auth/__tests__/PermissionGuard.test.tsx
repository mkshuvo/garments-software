import React from 'react';
import { render, screen } from '@testing-library/react';
import { PermissionGuard } from '../PermissionGuard';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('PermissionGuard', () => {
  const mockAuthState = {
    hasPermission: jest.fn(),
    hasAnyPermission: jest.fn(),
    hasAllPermissions: jest.fn(),
    isAuthenticated: true,
    isInitialized: true,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue(mockAuthState as ReturnType<typeof useAuthStore>);
  });

  it('renders children when user has required permission', () => {
    mockAuthState.hasPermission.mockReturnValue(true);

    render(
      <PermissionGuard resource="Category" action="View">
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockAuthState.hasPermission).toHaveBeenCalledWith('Category', 'View');
  });

  it('renders fallback when user lacks required permission', () => {
    mockAuthState.hasPermission.mockReturnValue(false);

    render(
      <PermissionGuard 
        resource="Category" 
        action="Create"
        fallback={<div>Access Denied</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders nothing when user lacks permission and no fallback provided', () => {
    mockAuthState.hasPermission.mockReturnValue(false);

    const { container } = render(
      <PermissionGuard resource="Category" action="Create">
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows loading state when not initialized', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isInitialized: false,
    } as ReturnType<typeof useAuthStore>);

    render(
      <PermissionGuard resource="Category" action="View">
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders fallback when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isAuthenticated: false,
    } as ReturnType<typeof useAuthStore>);

    render(
      <PermissionGuard 
        resource="Category" 
        action="View"
        fallback={<div>Please log in</div>}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Please log in')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('works with multiple permissions (requireAll=false)', () => {
    mockAuthState.hasAnyPermission.mockReturnValue(true);

    render(
      <PermissionGuard 
        permissions={[
          { resource: "Category", action: "Create" },
          { resource: "Category", action: "Update" }
        ]}
        requireAll={false}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockAuthState.hasAnyPermission).toHaveBeenCalledWith([
      { resource: "Category", action: "Create" },
      { resource: "Category", action: "Update" }
    ]);
  });

  it('works with multiple permissions (requireAll=true)', () => {
    mockAuthState.hasAllPermissions.mockReturnValue(true);

    render(
      <PermissionGuard 
        permissions={[
          { resource: "User", action: "View" },
          { resource: "User", action: "Update" }
        ]}
        requireAll={true}
      >
        <div>Protected Content</div>
      </PermissionGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockAuthState.hasAllPermissions).toHaveBeenCalledWith([
      { resource: "User", action: "View" },
      { resource: "User", action: "Update" }
    ]);
  });
});