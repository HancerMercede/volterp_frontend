import { create } from 'zustand';
import { accountingTransactionService } from '../infrastructure/api/accountingTransactionService';
import type { AccountingTransactionDto, CreateAccountingTransactionRequest } from '../domain/types';

interface TransaccionStore {
  transacciones: AccountingTransactionDto[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  
  fetchTransacciones: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getTransaccionById: (id: number) => Promise<AccountingTransactionDto | null>;
  addTransaccion: (transaccion: CreateAccountingTransactionRequest) => Promise<AccountingTransactionDto>;
  updateTransaccion: (id: number, data: Partial<AccountingTransactionDto>) => Promise<AccountingTransactionDto>;
  deleteTransaccion: (id: number) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useTransaccionStore = create<TransaccionStore>((set) => ({
  transacciones: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageCount: 0,

  fetchTransacciones: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await accountingTransactionService.getTransactions(pageNumber, pageSize);
      set({
        transacciones: result.items,
        totalCount: result.rowCount,
        pageCount: result.pageCount,
        loading: false,
      });
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch transactions' 
      });
    }
  },

  getTransaccionById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const transaction = await accountingTransactionService.getTransaction(id);
      set({ loading: false });
      return transaction;
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch transaction' 
      });
      return null;
    }
  },

  addTransaccion: async (transaccion: CreateAccountingTransactionRequest) => {
    set({ loading: true, error: null });
    try {
      const newTransaction = await accountingTransactionService.createTransaction(transaccion as any);
      set((state) => ({
        transacciones: [...state.transacciones, newTransaction],
        totalCount: state.totalCount + 1,
        loading: false,
      }));
      return newTransaction;
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to create transaction' 
      });
      throw error;
    }
  },

  updateTransaccion: async (id: number, data: Partial<AccountingTransactionDto>) => {
    set({ loading: true, error: null });
    try {
      const updatedTransaction = await accountingTransactionService.updateTransaction(id, data);
      set((state) => ({
        transacciones: state.transacciones.map((t) =>
          t.id === id ? { ...t, ...updatedTransaction } : t
        ),
        loading: false,
      }));
      return updatedTransaction;
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to update transaction' 
      });
      throw error;
    }
  },

  deleteTransaccion: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await accountingTransactionService.deleteTransaction(id);
      set((state) => ({
        transacciones: state.transacciones.filter((t) => t.id !== id),
        totalCount: state.totalCount - 1,
        loading: false,
      }));
    } catch (error) {
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to delete transaction' 
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
