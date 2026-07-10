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
  login: (user: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
}

const authStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name) || sessionStorage.getItem(name);
    return raw ? JSON.parse(raw) : null;
  },
  setItem: (name: string, value: unknown): void => {
    const remember = localStorage.getItem("auth-remember") === "true";
    (remember ? localStorage : sessionStorage).setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,

      login: (userData: User, token: string, rememberMe = true) => {
        localStorage.setItem("auth-remember", String(rememberMe));
        const expiresAt = getTokenExpiry(token);
        set({ user: userData, token, expiresAt, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("auth-remember");
        set({ user: null, token: null, expiresAt: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: authStorage,
    }
  )
);