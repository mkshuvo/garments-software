import { apiService } from './apiService';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    roles?: string[];
  };
  token: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  contactNumber: string;
  role?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // Transform the credentials to match backend DTO
      const loginData = {
        EmailOrUsername: credentials.email,
        Password: credentials.password
      };

      console.log('Sending login request with:', loginData);

      const response = await apiService.post<{
        token: string;
        expiration: string;
        user: {
          id: string;
          username: string;
          email: string;
          fullName: string;
          contactNumber: string | null;
          roles: string[];
          isActive: boolean;
          createdAt: string;
        };
      }>('/api/auth/login', loginData);

      console.log('Received login response:', response);

      // The backend returns the actual login data in the response directly for successful login
      // Transform the response to match frontend expectations
      const transformedResponse = {
        user: {
          id: response.user.id,
          email: response.user.email,
          name: response.user.fullName,
          role: response.user.roles[0] || 'Employee',
          roles: response.user.roles
        },
        token: response.token
      };

      console.log('Transformed response:', transformedResponse);

      return transformedResponse;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    return await apiService.post('/api/auth/register', userData);
  },

  registerUser: async (userData: RegisterData) => {
    return await apiService.post('/api/auth/register', userData);
  },

  logout: async () => {
    return await apiService.post('/api/auth/logout', {});
  },

  refreshToken: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      throw new Error('No token available for refresh');
    }
    return await apiService.post('/api/auth/refresh', { token });
  },

  getCurrentUser: async () => {
    return await apiService.get('/api/auth/me');
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return await apiService.post('/api/auth/change-password', {
      oldPassword,
      newPassword
    });
  },

  forgotPassword: async (email: string) => {
    return await apiService.post('/api/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return await apiService.post('/api/auth/reset-password', {
      token,
      newPassword
    });
  }
};