import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Producto } from '../data/mockData';
import { productos as initialProductos } from '../data/mockData';

interface ProductoStore {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  setProductos: (productos: Producto[]) => void;
  addProducto: (producto: Producto) => void;
  updateProducto: (id: string, data: Partial<Producto>) => void;
  deleteProducto: (id: string) => void;
}

export const useProductoStore = create<ProductoStore>()(
  persist(
    (set) => ({
      productos: initialProductos,
      loading: false,
      error: null,

      setProductos: (productos) => set({ productos }),

      addProducto: (producto) =>
        set((state) => ({
          productos: [...state.productos, producto],
        })),

      updateProducto: (id, data) =>
        set((state) => ({
          productos: state.productos.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteProducto: (id) =>
        set((state) => ({
          productos: state.productos.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'producto-storage',
    }
  )
);