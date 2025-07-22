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
    return await apiService.post<LoginResponse>('/api/auth/login', credentials);
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
    return await apiService.post('/api/auth/refresh', {});
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