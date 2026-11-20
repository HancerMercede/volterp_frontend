import { create } from "zustand";
import { companyIssuerService } from "../infrastructure/api/companyIssuerService";
import type {
  CompanyIssuer,
  CreateCompanyIssuerRequest,
  UpdateCompanyIssuerRequest,
} from "../domain/types";

interface CompanyIssuerStore {
  issuers: CompanyIssuer[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchIssuers: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getIssuerById: (id: string) => Promise<CompanyIssuer | null>;
  addIssuer: (data: CreateCompanyIssuerRequest) => Promise<CompanyIssuer>;
  updateIssuer: (
    id: string,
    data: UpdateCompanyIssuerRequest,
  ) => Promise<CompanyIssuer>;
  setError: (error: string | null) => void;
}

export const useCompanyIssuerStore = create<CompanyIssuerStore>((set) => ({
  issuers: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageCount: 0,

  fetchIssuers: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await companyIssuerService.getIssuers(pageNumber, pageSize);
      set({
        issuers: result.items,
        totalCount: result.rowCount,
        pageCount: result.pageCount,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch company issuers",
      });
    }
  },

  getIssuerById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const issuer = await companyIssuerService.getIssuerById(id);
      set({ loading: false });
      return issuer;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch company issuer",
      });
      return null;
    }
  },

  addIssuer: async (data: CreateCompanyIssuerRequest) => {
    set({ loading: true, error: null });
    try {
      const issuer = await companyIssuerService.createIssuer(data);
      set((state) => ({
        issuers: [...state.issuers, issuer],
        totalCount: state.totalCount + 1,
        loading: false,
      }));
      return issuer;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create company issuer",
      });
      throw error;
    }
  },

  updateIssuer: async (
    id: string,
    data: UpdateCompanyIssuerRequest,
  ) => {
    set({ loading: true, error: null });
    try {
      const issuer = await companyIssuerService.updateIssuer(id, data);
      set((state) => ({
        issuers: state.issuers.map((current) =>
          current.id === id ? { ...current, ...issuer } : current,
        ),
        loading: false,
      }));
      return issuer;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update company issuer",
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
