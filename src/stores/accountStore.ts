import { create } from "zustand";
import { accountService } from "../infrastructure/api/accountService";
import type { Account, AccountRequest } from "../domain/types";

interface AccountStore {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchAccounts: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getAccountById: (id: string) => Promise<Account | null>;
  addAccount: (account: AccountRequest) => Promise<Account>;
  updateAccount: (id: string, data: AccountRequest) => Promise<Account>;
  deleteAccount: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageCount: 0,

  fetchAccounts: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await accountService.getAccounts(pageNumber, pageSize);
      set({
        accounts: result.items,
        totalCount: result.rowCount,
        pageCount: result.pageCount,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch accounts",
      });
    }
  },

  getAccountById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const account = await accountService.getAccountById(id);
      set({ loading: false });
      return account;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch account",
      });
      return null;
    }
  },

  addAccount: async (account: AccountRequest) => {
    set({ loading: true, error: null });
    try {
      const newAccount = await accountService.createAccount(account);
      set((state) => ({
        accounts: [...state.accounts, newAccount],
        totalCount: state.totalCount + 1,
        loading: false,
      }));
      return newAccount;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to create account",
      });
      throw error;
    }
  },

  updateAccount: async (id: string, data: AccountRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedAccount = await accountService.updateAccount(id, data);
      set((state) => ({
        accounts: state.accounts.map((account) =>
          account.id === id ? { ...account, ...updatedAccount } : account,
        ),
        loading: false,
      }));
      return updatedAccount;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to update account",
      });
      throw error;
    }
  },

  deleteAccount: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await accountService.deleteAccount(id);
      set((state) => ({
        accounts: state.accounts.filter((account) => account.id !== id),
        totalCount: state.totalCount - 1,
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete account",
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
