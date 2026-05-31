import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTokenExpiry } from '../utils/jwt';

export interface User {
  username: string;
  email: string;
  fullName: string;
  role: string;
  companyId: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,

      login: (userData: User, token: string) => {
        const expiresAt = getTokenExpiry(token);
        set({ user: userData, token, expiresAt, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, expiresAt: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);