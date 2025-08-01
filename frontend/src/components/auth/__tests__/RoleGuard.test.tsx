/**
 * RoleGuard Component Tests
 * 
 * Tests for the RoleGuard component that controls access based on user roles.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '../RoleGuard';
import { useAuthStore } from '../../../stores/authStore';

// Mock the auth store
jest.mock('../../../stores/authStore');

const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('RoleGuard', () => {
  const mockAuthState = {
    isAuthenticated: true,
    isInitialized: true,
    isLoading: false,
    hasRole: jest.fn(),
    hasAnyRole: jest.fn(),
    hasAllRoles: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue(mockAuthState as any);
  });

  test('renders children when user has required role', () => {
    mockAuthState.hasRole.mockReturnValue(true);

    render(
      <RoleGuard role="Admin">
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  test('renders fallback when user lacks required role', () => {
    mockAuthState.hasRole.mockReturnValue(false);

    render(
      <RoleGuard role="Admin" fallback={<div>Access Required</div>}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Access Required')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('renders nothing when user lacks role and no fallback provided', () => {
    mockAuthState.hasRole.mockReturnValue(false);

    const { container } = render(
      <RoleGuard role="Admin">
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(container.firstChild).toBeNull();
  });

  test('shows loading state when not initialized', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isInitialized: false,
    } as any);

    render(
      <RoleGuard role="Admin">
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows loading state when loading is true', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isLoading: true,
    } as any);

    render(
      <RoleGuard role="Admin">
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('does not show loading state when showLoading is false', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isLoading: true,
    } as any);
    mockAuthState.hasRole.mockReturnValue(true);

    render(
      <RoleGuard role="Admin" showLoading={false}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  test('renders fallback when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      ...mockAuthState,
      isAuthenticated: false,
    } as any);

    render(
      <RoleGuard role="Admin" fallback={<div>Please log in</div>}>
        <div>Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Please log in')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('works with multiple roles (requireAll=false)', () => {
    mockAuthState.hasAnyRole.mockReturnValue(true);

    render(
      <RoleGuard roles={['Admin', 'Manager']} requireAll={false}>
        <div>Management Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Management Content')).toBeInTheDocument();
    expect(mockAuthState.hasAnyRole).toHaveBeenCalledWith(['Admin', 'Manager']);
  });

  test('works with multiple roles (requireAll=true)', () => {
    mockAuthState.hasAllRoles.mockReturnValue(true);

    render(
      <RoleGuard roles={['Admin', 'SuperUser']} requireAll={true}>
        <div>Super Admin Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Super Admin Content')).toBeInTheDocument();
    expect(mockAuthState.hasAllRoles).toHaveBeenCalledWith(['Admin', 'SuperUser']);
  });
});

