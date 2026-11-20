import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTokenExpiry } from '../utils/jwt';
import { usePermissionStore } from './permissionStore';
import { roleFromBackend } from '../domain/constants/roles';

export interface User {
  username: string;
  email: string;
  fullName: string;
  // The roles the user holds. The permissions of the user are the union of
  // the permissions of its roles.
  roles: string[];
  companyId: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
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
      hasHydrated: false,

      login: (userData: User, token: string, rememberMe = true) => {
        localStorage.setItem("auth-remember", String(rememberMe));
        const expiresAt = getTokenExpiry(token);
        set({ user: userData, token, expiresAt, isAuthenticated: true });

        // The permissions of the caller come from the API: they are asked
        // once, here, and not on every screen that needs them.
        void usePermissionStore.getState().load();
      },

      logout: () => {
        localStorage.removeItem("auth-remember");
        set({ user: null, token: null, expiresAt: null, isAuthenticated: false });
        usePermissionStore.getState().reset();
      },

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: authStorage,
      // A session persisted before the multi-role contract carries a single
      // `role`: it is migrated to the `roles` it became.
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as {
          user?: { role?: string; roles?: string[] };
        };

        if (version < 2 && state?.user && !state.user.roles && state.user.role) {
          return { ...state, user: { ...state.user, roles: [state.user.role] } };
        }

        return state;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.expiresAt && Date.now() > state.expiresAt) {
          state.logout();
        } else if (
          state?.user?.roles?.some((role) => !roleFromBackend(role))
        ) {
          // A session persisted before the rename of the roles carries names
          // the catalog no longer knows: the user has to log in again.
          state.logout();
        }
        state?.setHasHydrated(true);
      },
    }
  )
);