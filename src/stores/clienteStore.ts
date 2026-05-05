import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cliente } from '../data/mockData';
import { clientes as initialClientes } from '../data/mockData';

interface ClienteStore {
  clientes: Cliente[];
  loading: boolean;
  error: string | null;
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (id: string, data: Partial<Cliente>) => void;
  deleteCliente: (id: string) => void;
}

export const useClienteStore = create<ClienteStore>()(
  persist(
    (set) => ({
      clientes: initialClientes,
      loading: false,
      error: null,

      setClientes: (clientes) => set({ clientes }),

      addCliente: (cliente) =>
        set((state) => ({
          clientes: [...state.clientes, cliente],
        })),

      updateCliente: (id, data) =>
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCliente: (id) =>
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        })),
    }),
    {
      name: 'cliente-storage',
    }
  )
);