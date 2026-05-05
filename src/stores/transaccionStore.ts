import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TransaccionContable } from '../data/mockData';
import { transaccionesContables as initialTransacciones } from '../data/mockData';

interface TransaccionStore {
  transacciones: TransaccionContable[];
  loading: boolean;
  error: string | null;
  setTransacciones: (transacciones: TransaccionContable[]) => void;
  addTransaccion: (transaccion: TransaccionContable) => void;
  updateTransaccion: (id: string, data: Partial<TransaccionContable>) => void;
  deleteTransaccion: (id: string) => void;
}

export const useTransaccionStore = create<TransaccionStore>()(
  persist(
    (set) => ({
      transacciones: initialTransacciones,
      loading: false,
      error: null,

      setTransacciones: (transacciones) => set({ transacciones }),

      addTransaccion: (transaccion) =>
        set((state) => ({
          transacciones: [...state.transacciones, transaccion],
        })),

      updateTransaccion: (id, data) =>
        set((state) => ({
          transacciones: state.transacciones.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        })),

      deleteTransaccion: (id) =>
        set((state) => ({
          transacciones: state.transacciones.filter((t) => t.id !== id),
        })),
    }),
    {
      name: 'transaccion-storage',
    }
  )
);