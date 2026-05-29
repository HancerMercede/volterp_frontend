import { create } from "zustand";
import { clientService } from "../infrastructure/api/clientService";
import type { Client, ClientRequest } from "../domain/types";

interface ClienteStore {
  clientes: Client[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;

  fetchClientes: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getClienteById: (id: number) => Promise<Client | null>;
  addCliente: (cliente: ClientRequest) => Promise<Client>;
  updateCliente: (id: number, data: ClientRequest) => Promise<Client>;
  deleteCliente: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useClienteStore = create<ClienteStore>((set) => ({
  clientes: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageCount: 0,

  fetchClientes: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await clientService.getClients(pageNumber, pageSize);
      set({
        clientes: result.items,
        totalCount: result.rowCount,
        pageCount: result.pageCount,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch clients",
      });
    }
  },

  getClienteById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const client = await clientService.getClientById(id);
      set({ loading: false });
      return client;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch client",
      });
      return null;
    }
  },

  addCliente: async (cliente: ClientRequest) => {
    set({ loading: true, error: null });
    try {
      const newClient = await clientService.createClient(cliente as any);
      set((state) => ({
        clientes: [...state.clientes, newClient],
        totalCount: state.totalCount + 1,
        loading: false,
      }));
      return newClient;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to create client",
      });
      throw error;
    }
  },

  updateCliente: async (id: number, data: ClientRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedClient = await clientService.updateClient(id, data);
      set((state) => ({
        clientes: state.clientes.map((c) =>
          c.id === id ? { ...c, ...updatedClient } : c,
        ),
        loading: false,
      }));
      return updatedClient;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to update client",
      });
      throw error;
    }
  },

  deleteCliente: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await clientService.deleteClient(id);
      set((state) => ({
        clientes: state.clientes.filter((c) => c.id !== id),
        totalCount: state.totalCount - 1,
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete client",
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
