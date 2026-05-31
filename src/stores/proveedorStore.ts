import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { supplierService } from '../infrastructure/api/supplierService';
import type { SupplierDto, CreateSupplierRequest } from '../domain/types';

interface ProveedorStore {
  proveedores: SupplierDto[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchProveedores: (pageNumber: number, pageSize: number) => Promise<void>;
  addProveedor: (data: CreateSupplierRequest) => Promise<void>;
  updateProveedor: (id: number, data: Partial<SupplierDto>) => Promise<void>;
  deleteProveedor: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useProveedorStore = create<ProveedorStore>()(
  persist(
    (set, get) => ({
      proveedores: [],
      loading: false,
      error: null,
      totalCount: 0,
      pageCount: 0,

      fetchProveedores: async (pageNumber = 1, pageSize = 10) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          const result = await supplierService.getSuppliers(pageNumber, pageSize);
          set({
            proveedores: result.items,
            totalCount: result.rowCount,
            pageCount: result.pageCount,
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      addProveedor: async (data) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          const dto = await supplierService.createSupplier(data);
          set({
            proveedores: [...get().proveedores, dto],
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      updateProveedor: async (id, data) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          const dto = await supplierService.updateSupplier(id, data);
          set({
            proveedores: get().proveedores.map((p) =>
              p.id === id ? dto : p
            ),
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      deleteProveedor: async (id) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          await supplierService.deleteSupplier(id);
          set({
            proveedores: get().proveedores.filter((p) => p.id !== id),
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'proveedor-storage',
      partialize: (state) => ({ proveedores: state.proveedores }),
    },
  )
);
