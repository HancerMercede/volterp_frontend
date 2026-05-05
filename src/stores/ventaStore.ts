import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Venta } from '../data/mockData';
import { ventas as initialVentas } from '../data/mockData';

interface VentaStore {
  ventas: Venta[];
  loading: boolean;
  error: string | null;
  setVentas: (ventas: Venta[]) => void;
  addVenta: (venta: Venta) => void;
  updateVenta: (id: string, data: Partial<Venta>) => void;
  deleteVenta: (id: string) => void;
}

export const useVentaStore = create<VentaStore>()(
  persist(
    (set) => ({
      ventas: initialVentas,
      loading: false,
      error: null,

      setVentas: (ventas) => set({ ventas }),

      addVenta: (venta) =>
        set((state) => ({
          ventas: [...state.ventas, venta],
        })),

      updateVenta: (id, data) =>
        set((state) => ({
          ventas: state.ventas.map((v) =>
            v.id === id ? { ...v, ...data } : v
          ),
        })),

      deleteVenta: (id) =>
        set((state) => ({
          ventas: state.ventas.filter((v) => v.id !== id),
        })),
    }),
    {
      name: 'venta-storage',
    }
  )
);