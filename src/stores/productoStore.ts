import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { productService } from '../infrastructure/api/productService';
import type { ProductDto, CreateProductRequest, UpdateProductRequest } from '../infrastructure/api/types';
import type { Producto } from '../data/mockData';

interface ProductoStore {
  productos: Producto[];
  loading: boolean;
  error: string | null;
  fetchProductos: () => Promise<void>;
  createProducto: (data: Omit<Producto, 'id'>) => Promise<void>;
  updateProducto: (id: string, data: Partial<Producto>) => Promise<void>;
  deleteProducto: (id: string) => Promise<void>;
  clearError: () => void;
}

function mapDtoToProducto(dto: ProductDto): Producto {
  return {
    id: String(dto.id),
    nombre: dto.name,
    categoria: dto.category,
    categoriaId: dto.categoryId,
    stock: dto.stock,
    precio: dto.price,
    imagen: dto.imageUrl || 'https://via.placeholder.com/200?text=Producto',
    descripcion: dto.description || '',
    proveedor: '',
    isActive: dto.isActive,
  };
}

function mapToCreateRequest(data: Omit<Producto, 'id'>): CreateProductRequest {
  return {
    name: data.nombre,
    category: data.categoria,
    description: data.descripcion || null,
    stock: data.stock,
    price: data.precio,
    categoryId: data.categoriaId ?? null,
    companyId: 1,
    imageUrl: data.imagen || null,
  };
}

function mapToUpdateRequest(data: Partial<Producto>): UpdateProductRequest {
  return {
    name: data.nombre ?? '',
    category: data.categoria ?? '',
    description: data.descripcion ?? null,
    stock: data.stock ?? 0,
    price: data.precio ?? 0,
    categoryId: data.categoriaId ?? null,
    isActive: data.isActive ?? true,
    imageUrl: data.imagen || null,
  };
}

export const useProductoStore = create<ProductoStore>()(
  persist(
    (set, get) => ({
      productos: [],
      loading: false,
      error: null,

      fetchProductos: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          const dtos = await productService.getProducts();
          set({ productos: dtos.map(mapDtoToProducto), loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      createProducto: async (data) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          const requestData = mapToCreateRequest(data);
          console.log('mapToCreateRequest result:', requestData);
          const dto = await productService.createProduct(requestData);
          set({ productos: [...get().productos, mapDtoToProducto(dto)], loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      updateProducto: async (id, data) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          const dto = await productService.updateProduct(parseInt(id), mapToUpdateRequest(data));
          set({
            productos: get().productos.map(p => p.id === id ? mapDtoToProducto(dto) : p),
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
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          await productService.deleteProduct(parseInt(id));
          set({ productos: get().productos.filter(p => p.id !== id), loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'producto-storage',
      partialize: (state) => ({ productos: state.productos }),
    }
  )
);