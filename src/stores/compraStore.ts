import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Compra } from '../data/mockData';
import { compras as initialCompras } from '../data/mockData';

interface CompraStore {
  compras: Compra[];
  loading: boolean;
  error: string | null;
  setCompras: (compras: Compra[]) => void;
  addCompra: (compra: Compra) => void;
  updateCompra: (id: string, data: Partial<Compra>) => void;
  deleteCompra: (id: string) => void;
}

export const useCompraStore = create<CompraStore>()(
  persist(
    (set) => ({
      compras: initialCompras,
      loading: false,
      error: null,

      setCompras: (compras) => set({ compras }),

      addCompra: (compra) =>
        set((state) => ({
          compras: [...state.compras, compra],
        })),

      updateCompra: (id, data) =>
        set((state) => ({
          compras: state.compras.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCompra: (id) =>
        set((state) => ({
          compras: state.compras.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'compra-storage',
    }
  )
);