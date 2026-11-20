import { create } from "zustand";
import { companyCertificateService } from "../infrastructure/api/companyCertificateService";
import type {
  CompanyCertificate,
  CreateCompanyCertificateRequest,
} from "../domain/types";

interface CompanyCertificateStore {
  certificates: CompanyCertificate[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchCertificates: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getCertificateById: (id: string) => Promise<CompanyCertificate | null>;
  addCertificate: (
    data: CreateCompanyCertificateRequest,
  ) => Promise<CompanyCertificate>;
  setError: (error: string | null) => void;
}

export const useCompanyCertificateStore = create<CompanyCertificateStore>(
  (set) => ({
    certificates: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,

    fetchCertificates: async (pageNumber = 1, pageSize = 10) => {
      set({ loading: true, error: null });
      try {
        const result = await companyCertificateService.getCertificates(
          pageNumber,
          pageSize,
        );
        set({
          certificates: result.items,
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
              : "Failed to fetch company certificates",
        });
      }
    },

    getCertificateById: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const certificate = await companyCertificateService.getCertificateById(
          id,
        );
        set({ loading: false });
        return certificate;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch company certificate",
        });
        return null;
      }
    },

    addCertificate: async (data: CreateCompanyCertificateRequest) => {
      set({ loading: true, error: null });
      try {
        const certificate = await companyCertificateService.createCertificate(
          data,
        );
        set((state) => ({
          certificates: [...state.certificates, certificate],
          totalCount: state.totalCount + 1,
          loading: false,
        }));
        return certificate;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create company certificate",
        });
        throw error;
      }
    },

    setError: (error: string | null) => set({ error }),
  }),
);
