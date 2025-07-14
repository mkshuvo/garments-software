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
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (loginData: LoginDto) => {
        console.log('Auth store: Starting login process')
        set((state) => ({ ...state, isLoading: true })) // Preserve existing error state
        try {
          const response: LoginResponseDto = await authService.login(loginData)
          console.log('Auth store: Login successful')
          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null, // Only clear error on successful login
          })
        } catch (error: unknown) {
          // Extract error message from API response
          let errorMessage = 'Login failed'
          
          if (error && typeof error === 'object') {
            const err = error as {
              message?: string
              response?: { data?: { message?: string } }
              data?: { message?: string }
            }
            if (err.message) {
              errorMessage = err.message
            } else if (err.response?.data?.message) {
              errorMessage = err.response.data.message
            } else if (err.data?.message) {
              errorMessage = err.data.message
            }
          }
          
          console.log('Auth store: Login failed, setting error:', errorMessage)
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
          })
          console.log('Auth store: Error state set, throwing error')
          // Throw the error so the form can handle it
          throw new Error(errorMessage)
        }
      },

      logout: () => {
        authService.logout()
        set({
          isAuthenticated: false,
          user: null,
          token: null,
        })
      },

      setUser: (user: UserInfoDto) => {
        set({ user, isAuthenticated: true })
      },

      clearError: () => {
        console.log('Auth store: clearError called')
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      checkAuth: async () => {
        console.log('Auth store: checkAuth called')
        if (!authService.isAuthenticated()) {
          console.log('Auth store: Not authenticated, skipping checkAuth')
          set((state) => ({ ...state, isAuthenticated: false, user: null, token: null }))
          return
        }
        console.log('Auth store: Checking auth for authenticated user')
        set({ isLoading: true })
        try {
          const user = await authService.getProfile()
          const token = authService.getToken()
          set({
            isAuthenticated: true,
            user,
            token,
            isLoading: false,
            // Don't clear error here - only clear it on successful login or explicit clearError
          })
        } catch {
          // Token might be expired or invalid
          authService.logout()
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            // Don't clear error here - only clear it on successful login or explicit clearError
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
        // Don't persist errors - they should be transient
      }),
    }
  )
)
