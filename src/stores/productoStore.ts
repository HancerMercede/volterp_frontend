import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { productService } from "../infrastructure/api/productService";
import type { ProductDto, ProductRequest } from "../domain/types";

interface ProductoStore {
  productos: ProductDto[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchProductos: (pageNumber: number, pageSize: number) => Promise<void>;
  createProducto: (data: ProductRequest) => Promise<void>;
  updateProducto: (id: number, data: ProductRequest) => Promise<void>;
  deleteProducto: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useProductoStore = create<ProductoStore>()(
  persist(
    (set, get) => ({
      productos: [],
      loading: false,
      error: null,
      totalCount: 0,
      pageCount: 0,

      fetchProductos: async (pageNumber = 1, pageSize = 10) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const result = await productService.getProducts(pageNumber, pageSize);
          set({
            productos: result.items,
            totalCount: result.rowCount,
            pageCount: result.pageCount,
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      createProducto: async (data) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const dto = await productService.createProduct(data);
          set({
            productos: [...get().productos, dto],
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      updateProducto: async (id, data) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const dto = await productService.updateProduct(id, data);
          set({
            productos: get().productos.map((p) =>
              p.id === id ? dto : p,
            ),
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      deleteProducto: async (id) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          await productService.deleteProduct(id);
          set({
            productos: get().productos.filter((p) => p.id !== id),
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
      name: "producto-storage",
      partialize: (state) => ({ productos: state.productos }),
    },
  ),
);
