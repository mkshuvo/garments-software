import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService, LoginDto, UserInfoDto, LoginResponseDto } from '@/services/authService'

interface AuthState {
  isAuthenticated: boolean
  user: UserInfoDto | null
  token: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (loginData: LoginDto) => Promise<void>
  logout: () => void
  setUser: (user: UserInfoDto) => void
  clearError: () => void
  checkAuth: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (loginData: LoginDto) => {
        set({ isLoading: true, error: null })
        
        try {
          const response: LoginResponseDto = await authService.login(loginData)
          
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: error.message || 'Login failed',
          })
          throw error
        }
      },

      logout: () => {
        authService.logout()
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        })
      },

      setUser: (user: UserInfoDto) => {
        set({ user, isAuthenticated: true })
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      checkAuth: async () => {
        if (!authService.isAuthenticated()) {
          set({ isAuthenticated: false, user: null, token: null })
          return
        }

        set({ isLoading: true })
        
        try {
          const user = await authService.getProfile()
          const token = authService.getToken()
          
          set({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
            error: null,
          })
        } catch (error: any) {
          // Token might be expired or invalid
          authService.logout()
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: null,
          })
        }
      },
    }),
    {
      name: 'garments-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
