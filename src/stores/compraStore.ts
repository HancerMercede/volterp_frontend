import { create } from 'zustand';
import { purchaseService } from '../infrastructure/api/purchaseService';
import type { PurchaseDto, CreatePurchaseRequest } from '../domain/types';

interface CompraStore {
  compras: PurchaseDto[];
  loading: boolean;
  error: string | null;
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
  };
  
  fetchCompras: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getCompraById: (id: number) => Promise<PurchaseDto | null>;
  addCompra: (compra: CreatePurchaseRequest) => Promise<PurchaseDto>;
  updateCompra: (id: number, data: Partial<PurchaseDto>) => Promise<PurchaseDto>;
  deleteCompra: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useCompraStore = create<CompraStore>((set) => ({
  compras: [],
  loading: false,
  error: null,
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
  },

  fetchCompras: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await purchaseService.getPurchases(pageNumber, pageSize);
      set({
        compras: result.items,
        pagination: {
          pageNumber: result.pageNumber,
          pageSize: result.pageSize,
          totalCount: result.rowCount,
        },
        loading: false,
      });
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch purchases' 
      });
    }
  },

  getCompraById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const purchase = await purchaseService.getPurchase(id);
      set({ loading: false });
      return purchase;
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch purchase' 
      });
      return null;
    }
  },

  addCompra: async (compra: CreatePurchaseRequest) => {
    set({ loading: true, error: null });
    try {
      const newPurchase = await purchaseService.createPurchase(compra as any);
      set((state) => ({
        compras: [...state.compras, newPurchase],
        pagination: {
          ...state.pagination,
          totalCount: state.pagination.totalCount + 1,
        },
        loading: false,
      }));
      return newPurchase;
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to create purchase' 
      });
      throw error;
    }
  },

  updateCompra: async (id: number, data: Partial<PurchaseDto>) => {
    set({ loading: true, error: null });
    try {
      const updatedPurchase = await purchaseService.updatePurchase(id, data);
      set((state) => ({
        compras: state.compras.map((c) =>
          c.id === id ? { ...c, ...updatedPurchase } : c
        ),
        loading: false,
      }));
      return updatedPurchase;
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to update purchase' 
      });
      throw error;
    }
  },

  deleteCompra: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await purchaseService.deletePurchase(id);
      set((state) => ({
        compras: state.compras.filter((c) => c.id !== id),
        pagination: {
          ...state.pagination,
          totalCount: state.pagination.totalCount - 1,
        },
        loading: false,
      }));
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete purchase' 
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
