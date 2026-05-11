import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import {
  saleService,
  type SaleDto,
  type CreateSaleRequest,
  type UpdateSaleRequest,
} from "../infrastructure/api/saleService";

interface VentaStore {
  ventas: SaleDto[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;

  fetchVentas: (pageNumber?: number, pageSize?: number) => Promise<void>;
  fetchVentasPendientes: (
    pageNumber?: number,
    pageSize?: number,
  ) => Promise<void>;
  fetchVentasCompletadas: (
    pageNumber?: number,
    pageSize?: number,
  ) => Promise<void>;
  createVenta: (data: CreateSaleRequest) => Promise<void>;
  updateVenta: (id: number, data: UpdateSaleRequest) => Promise<void>;
  completeVenta: (id: number) => Promise<void>;
  deleteVenta: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useVentaStore = create<VentaStore>()(
  persist(
    (set) => ({
      ventas: [],
      loading: false,
      error: null,
      totalCount: 0,
      pageCount: 0,

      clearError: () => set({ error: null }),

      fetchVentas: async (pageNumber = 1, pageSize = 10) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No autenticado" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const result = await saleService.getSales(pageNumber, pageSize);
          console.log(result.items);
          set({
            ventas: result.items,
            totalCount: result.rowCount,
            pageCount: result.pageCount,
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      fetchVentasPendientes: async (pageNumber = 1, pageSize = 10) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No autenticado" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const result = await saleService.getPendingSales(
            pageNumber,
            pageSize,
          );
          set({
            ventas: result.items,
            totalCount: result.rowCount,
            pageCount: result.pageCount,
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      fetchVentasCompletadas: async (pageNumber = 1, pageSize = 10) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No autenticado" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const result = await saleService.getSalesByStatus(
            "Completed",
            pageNumber,
            pageSize,
          );
          set({
            ventas: result.items,
            totalCount: result.rowCount,
            pageCount: result.pageCount,
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      createVenta: async (data: CreateSaleRequest) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No autenticado" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const nuevaVenta = await saleService.createSale(data);
          set((state) => ({
            ventas: [nuevaVenta, ...state.ventas],
            totalCount: state.totalCount + 1,
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      updateVenta: async (id: number, data: UpdateSaleRequest) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No autenticado" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const actualizada = await saleService.updateSale(id, data);
          set((state) => ({
            ventas: state.ventas.map((v) => (v.id === id ? actualizada : v)),
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      completeVenta: async (id: number) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No autenticado" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const completada = await saleService.completeSale(id);
          set((state) => ({
            ventas: state.ventas.map((v) => (v.id === id ? completada : v)),
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      deleteVenta: async (id: number) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No autenticado" });
          return;
        }
        set({ loading: true, error: null });
        try {
          await saleService.deleteSale(id);
          set((state) => ({
            ventas: state.ventas.filter((v) => v.id !== id),
            totalCount: state.totalCount - 1,
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },
    }),
    {
      name: "venta-storage",
      partialize: (state) => ({ ventas: state.ventas }),
    },
  ),
);
