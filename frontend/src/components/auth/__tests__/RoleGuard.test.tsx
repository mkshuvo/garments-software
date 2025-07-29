import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '../RoleGuard';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');
const mockUseAuthStore = jest.mocked(useAuthStore);

describe('RoleGuard', () => {
  const mockAuthState = {
    hasRole: jest.fn(),
    hasAnyRole: jest.fn(),
    hasAllRoles: jest.fn(),
    isAuthenticated: true,
    isInitialized: true,
    isLoading: false,
    // Add other required properties from the auth store
    user: null,
    token: null,
    permissions: [],
    roles: [],
    login: jest.fn(),
    logout: jest.fn(),
    clearAuthState: jest.fn(),
    updateUser: jest.fn(),
    setPermissions: jest.fn(),
    setRoles: jest.fn(),
    checkAuth: jest.fn(),
    loadUserPermissions: jest.fn(),
    refreshPermissions: jest.fn(),
    hasPermission: jest.fn(),
    hasAnyPermission: jest.fn(),
    hasAllPermissions: jest.fn(),
    refreshTokenIfNeeded: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue(mockAuthState as ReturnType<typeof useAuthStore>);
  });

  it('renders children when user has required role', () => {
    mockAuthState.hasRole.mockReturnValue(true);

    render(
      <RoleGuard role="Admin">
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(mockAuthState.hasRole).toHaveBeenCalledWith('Admin');
  });

  it('renders fallback when user lacks required role', () => {
    mockAuthState.hasRole.mockReturnValue(false);

    render(
      <RoleGuard
        role="Admin"
        fallback={<div>Admin Access Required</div>}
      >
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Access Required')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders nothing when user lacks role and no fallback provided', () => {
    mockAuthState.hasRole.mockReturnValue(false);

    const { container } = render(
      <RoleGuard role="Admin">
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(container.firstChild).toBeNull();
  });

  it('shows loading state when not initialized', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isInitialized: false,
    } as ReturnType<typeof useAuthStore>);

    render(
      <RoleGuard role="Admin">
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isLoading: true,
    } as ReturnType<typeof useAuthStore>);

    render(
      <RoleGuard role="Admin">
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('does not show loading state when showLoading is false', () => {
    mockAuthState.hasRole.mockReturnValue(true);
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isLoading: true,
    } as ReturnType<typeof useAuthStore>);

    render(
      <RoleGuard role="Admin" showLoading={false}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders fallback when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isAuthenticated: false,
    } as ReturnType<typeof useAuthStore>);

    render(
      <RoleGuard
        role="Admin"
        fallback={<div>Please log in</div>}
      >
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Please log in')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('works with multiple roles (requireAll=false)', () => {
    mockAuthState.hasAnyRole.mockReturnValue(true);

    render(
      <RoleGuard
        roles={["Admin", "Manager"]}
        requireAll={false}
      >
        <div>Management Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Management Content')).toBeInTheDocument();
    expect(mockAuthState.hasAnyRole).toHaveBeenCalledWith(["Admin", "Manager"]);
  });

  it('works with multiple roles (requireAll=true)', () => {
    mockAuthState.hasAllRoles.mockReturnValue(true);

    render(
      <RoleGuard
        roles={["Admin", "SuperUser"]}
        requireAll={true}
      >
        <div>Super Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Super Admin Content')).toBeInTheDocument();
    expect(mockAuthState.hasAllRoles).toHaveBeenCalledWith(["Admin", "SuperUser"]);
  });

  it('handles invalid props gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

    render(
      <RoleGuard fallback={<div>Invalid Props</div>}>
        <div>Should Not Render</div>
      </RoleGuard>
    );

    expect(screen.getByText('Invalid Props')).toBeInTheDocument();
    expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('RoleGuard: Either provide role or roles array');

    consoleSpy.mockRestore();
  });

  it('works with empty roles array', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

    render(
      <RoleGuard
        roles={[]}
        fallback={<div>Empty Roles</div>}
      >
        <div>Should Not Render</div>
      </RoleGuard>
    );

    expect(screen.getByText('Empty Roles')).toBeInTheDocument();
    expect(screen.queryByText('Should Not Render')).not.toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('RoleGuard: Either provide role or roles array');

    consoleSpy.mockRestore();
  });

  it('defaults requireAll to false for multiple roles', () => {
    mockAuthState.hasAnyRole.mockReturnValue(true);

    render(
      <RoleGuard roles={["Admin", "Manager"]}>
        <div>Management Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Management Content')).toBeInTheDocument();
    expect(mockAuthState.hasAnyRole).toHaveBeenCalledWith(["Admin", "Manager"]);
    expect(mockAuthState.hasAllRoles).not.toHaveBeenCalled();
  });

  it('renders nothing when user lacks multiple roles and no fallback provided', () => {
    mockAuthState.hasAnyRole.mockReturnValue(false);

    const { container } = render(
      <RoleGuard roles={["Admin", "Manager"]}>
        <div>Management Content</div>
      </RoleGuard>
    );

    expect(container.firstChild).toBeNull();
  });
});