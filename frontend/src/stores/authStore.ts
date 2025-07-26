import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user: User, token: string) => {
        // Import apiService dynamically to avoid circular dependency
        import('../services/apiService').then(({ apiService }) => {
          apiService.setToken(token);
        });
        
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        // Import apiService dynamically to avoid circular dependency
        import('../services/apiService').then(({ apiService }) => {
          apiService.removeToken();
        });
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
      
      checkAuth: () => {
        const state = get();
        // Update isAuthenticated based on whether we have a user and token
        if (state.user && state.token && !state.isAuthenticated) {
          // Set token in apiService if we have it
          import('../services/apiService').then(({ apiService }) => {
            apiService.setToken(state.token!);
          });
          set({ isAuthenticated: true });
        } else if ((!state.user || !state.token) && state.isAuthenticated) {
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);