import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, Employee } from '../types';

interface AuthStore extends AuthState {
  login: (user: Employee) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);