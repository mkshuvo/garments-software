import { apiService } from './apiService'
import { API_CONFIG } from '@/config/api'

// Types matching backend DTOs
export interface LoginDto {
  emailOrUsername: string
  password: string
}

export interface RegisterDto {
  username: string
  email: string
  fullName: string
  contactNumber: string
  password: string
  confirmPassword: string
  role: string
}

export interface UserInfoDto {
  id: string
  username: string
  email: string
  fullName: string
  contactNumber: string
  roles: string[]
  isActive: boolean
  createdAt: string
}

export interface LoginResponseDto {
  token: string
  expiration: string
  user: UserInfoDto
}

export interface UpdateProfileDto {
  fullName: string
  contactNumber: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface RoleInfoDto {
  id: string
  name: string
  description: string
}

// Auth Service Class
class AuthService {
  /**
   * Login user with email/username and password
   */
  async login(loginData: LoginDto): Promise<LoginResponseDto> {
    try {
      const response = await apiService.post<LoginResponseDto>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        loginData
      )
      
      // Store token if login successful
      if (response.token) {
        apiService.setToken(response.token)
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Register new user (Admin/Manager only)
   */
  async register(registerData: RegisterDto): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        registerData
      )
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserInfoDto> {
    try {
      const response = await apiService.get<UserInfoDto>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE
      )
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updateData: UpdateProfileDto): Promise<{ message: string }> {
    try {
      const response = await apiService.put<{ message: string }>(
        API_CONFIG.ENDPOINTS.AUTH.PROFILE,
        updateData
      )
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: ChangePasswordDto): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>(
        API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD,
        passwordData
      )
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Get available roles (Admin/Manager only)
   */
  async getRoles(): Promise<RoleInfoDto[]> {
    try {
      const response = await apiService.get<RoleInfoDto[]>(
        API_CONFIG.ENDPOINTS.AUTH.ROLES
      )
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    apiService.removeToken()
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('auth_token')
    return !!token
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }
}

// Export singleton instance
export const authService = new AuthService()
