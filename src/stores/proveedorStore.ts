import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Proveedor } from '../data/mockData';
import { proveedores as initialProveedores } from '../data/mockData';

interface ProveedorStore {
  proveedores: Proveedor[];
  loading: boolean;
  error: string | null;
  setProveedores: (proveedores: Proveedor[]) => void;
  addProveedor: (proveedor: Proveedor) => void;
  updateProveedor: (id: string, data: Partial<Proveedor>) => void;
  deleteProveedor: (id: string) => void;
}

export const useProveedorStore = create<ProveedorStore>()(
  persist(
    (set) => ({
      proveedores: initialProveedores,
      loading: false,
      error: null,

      setProveedores: (proveedores) => set({ proveedores }),

      addProveedor: (proveedor) =>
        set((state) => ({
          proveedores: [...state.proveedores, proveedor],
        })),

      updateProveedor: (id, data) =>
        set((state) => ({
          proveedores: state.proveedores.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteProveedor: (id) =>
        set((state) => ({
          proveedores: state.proveedores.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'proveedor-storage',
    }
  )
);