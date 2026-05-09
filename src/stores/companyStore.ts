import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import {
  companyService,
  type CompanyDto,
  type CompanyRequest,
} from "../infrastructure/api/companyService";

interface CompanyStore {
  companies: CompanyDto[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchCompanies: (pageNumber: number, pageSize: number) => Promise<void>;
  addCompany: (data: CompanyRequest) => Promise<void>;
  updateCompany: (id: number, data: CompanyRequest) => Promise<void>;
  deleteCompany: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      companies: [],
      loading: false,
      error: null,
      totalCount: 0,
      pageCount: 0,

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

      addCompany: async (data: CompanyRequest) => {
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

      updateCompany: async (id: number, data: CompanyRequest) => {
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
