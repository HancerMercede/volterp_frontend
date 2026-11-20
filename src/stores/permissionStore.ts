import { create } from 'zustand';
import { permissionService } from '../infrastructure/api/permissionService';

type PermissionStatus = 'idle' | 'loading' | 'ready' | 'error';

interface PermissionStore {
  /** The permissions the caller has, as the keys the API answers. */
  permissions: Set<string>;
  status: PermissionStatus;
  load: () => Promise<void>;
  reset: () => void;
}

// The permissions of the caller come from the API: the server resolves the
// union of the permissions of the roles. Until they arrive, the caller may
// do nothing (the gate fails closed).
export const usePermissionStore = create<PermissionStore>()((set) => ({
  permissions: new Set<string>(),
  status: 'idle',

  load: async () => {
    set({ status: 'loading' });

    try {
      const me = await permissionService.getMyPermissions();
      set({ permissions: new Set(me.permissions), status: 'ready' });
    } catch {
      set({ permissions: new Set<string>(), status: 'error' });
    }
  },

  reset: () => set({ permissions: new Set<string>(), status: 'idle' }),
}));
