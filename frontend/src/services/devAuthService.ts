// Development Authentication Service
// This service provides mock authentication for development purposes

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: string;
  roles: string[];
}

interface MockPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  isActive: boolean;
}

const MOCK_USER: MockUser = {
  id: 'dev-user-001',
  email: 'developer@localhost',
  name: 'Development User',
  role: 'admin',
  roles: ['admin', 'user', 'developer', 'accounting_manager', 'super_admin']
};

const MOCK_PERMISSIONS: MockPermission[] = [
  // Accounting permissions
  { id: '1', name: 'View Accounting', resource: 'accounting', action: 'read', isActive: true },
  { id: '2', name: 'Create Transactions', resource: 'accounting', action: 'create', isActive: true },
  { id: '3', name: 'Edit Transactions', resource: 'accounting', action: 'update', isActive: true },
  { id: '4', name: 'Delete Transactions', resource: 'accounting', action: 'delete', isActive: true },
  
  // Category permissions
  { id: '5', name: 'View Categories', resource: 'categories', action: 'read', isActive: true },
  { id: '6', name: 'Manage Categories', resource: 'categories', action: 'write', isActive: true },
  
  // Admin permissions
  { id: '7', name: 'Admin Access', resource: 'admin', action: 'access', isActive: true },
  { id: '8', name: 'User Management', resource: 'users', action: 'manage', isActive: true },
  
  // System permissions
  { id: '9', name: 'System Settings', resource: 'system', action: 'configure', isActive: true },
];

class DevAuthService {
  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  getMockUser(): MockUser {
    return MOCK_USER;
  }

  getMockPermissions(): MockPermission[] {
    return MOCK_PERMISSIONS;
  }

  getMockToken(): string {
    // Create a simple mock JWT-like token for development
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: MOCK_USER.id,
      email: MOCK_USER.email,
      name: MOCK_USER.name,
      roles: MOCK_USER.roles,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
      iat: Math.floor(Date.now() / 1000),
      iss: 'dev-auth-service'
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  async bypassAuthentication(): Promise<{ user: MockUser; token: string; permissions: MockPermission[] }> {
    if (!this.isDevelopment()) {
      throw new Error('Development authentication bypass is only available in development mode');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      user: this.getMockUser(),
      token: this.getMockToken(),
      permissions: this.getMockPermissions()
    };
  }

  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/health`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      
      return response.ok;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  shouldBypassAuth(): boolean {
    return this.isDevelopment() && process.env.NEXT_PUBLIC_BYPASS_AUTH !== 'false';
  }

  getEnvironmentInfo() {
    return {
      isDevelopment: this.isDevelopment(),
      shouldBypassAuth: this.shouldBypassAuth(),
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      nodeEnv: process.env.NODE_ENV
    };
  }
}

export const devAuthService = new DevAuthService();
export type { MockUser, MockPermission };