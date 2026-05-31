import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { companyService } from "../infrastructure/api/companyService";
import type { CompanyDto, CreateCompanyRequest } from "../domain/types";

interface CompanyStore {
  companies: CompanyDto[];
  currentCompany: CompanyDto | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchCompanies: (pageNumber: number, pageSize: number) => Promise<void>;
  fetchCurrentCompany: (companyId: number) => Promise<void>;
  updateCurrentCompany: (data: CreateCompanyRequest) => Promise<void>;
  addCompany: (data: CreateCompanyRequest) => Promise<void>;
  updateCompany: (id: number, data: CreateCompanyRequest) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  clearError: () => void;
  clearCurrentCompany: () => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      companies: [],
      currentCompany: null,
      loading: false,
      error: null,
      totalCount: 0,
      pageCount: 0,

      clearCompanies: () => set({ companies: [], totalCount: 0, pageCount: 0 }),

      clearCurrentCompany: () => set({ currentCompany: null }),

      fetchCurrentCompany: async (companyId: number) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const company = await companyService.getCompany(companyId);
          set({ currentCompany: company, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      updateCurrentCompany: async (data: CreateCompanyRequest) => {
        const token = useAuthStore.getState().token;
        const currentCompany = useCompanyStore.getState().currentCompany;
        if (!token || !currentCompany) {
          set({ error: "No authenticated or no company selected" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const updated = await companyService.updateCompany(
            currentCompany.id,
            data,
          );
          set({ currentCompany: updated, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      fetchCompanies: async (pageNumber = 1, pageSize = 10) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const result = await companyService.getCompanies(
            pageNumber,
            pageSize,
          );
          set({
            companies: result.items,
            totalCount: result.rowCount,
            pageCount: result.pageCount,
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      addCompany: async (data: CreateCompanyRequest) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const newCompany = await companyService.createCompany(data);
          set((state) => ({
            companies: [...state.companies, newCompany],
            totalCount: state.totalCount + 1,
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      updateCompany: async (id: number, data: CreateCompanyRequest) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const updated = await companyService.updateCompany(id, data);
          set((state) => ({
            companies: state.companies.map((c) => (c.id === id ? updated : c)),
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      deleteCompany: async (id: number) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          await companyService.deleteCompany(id);
          set((state) => ({
            companies: state.companies.filter((c) => c.id !== id),
            totalCount: state.totalCount - 1,
            loading: false,
          }));
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "company-storage",
      partialize: (state) => ({ companies: state.companies }),
    },
  ),
);
