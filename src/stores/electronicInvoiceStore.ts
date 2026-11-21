import { create } from "zustand";
import { electronicInvoiceService } from "../infrastructure/api/electronicInvoiceService";
import type {
  ElectronicInvoiceDto,
  ElectronicInvoiceStateCounts,
  ElectronicInvoiceStateDto,
} from "../domain/types";

interface ElectronicInvoiceStore {
  invoices: ElectronicInvoiceStateDto[];
  counts: ElectronicInvoiceStateCounts | null;
  loading: boolean;
  error: string | null;
  fetchStateSurface: (limit?: number) => Promise<void>;
  retryInvoice: (id: string) => Promise<ElectronicInvoiceDto>;
  getQrSvg: (id: string) => Promise<Blob>;
  getQrPng: (id: string) => Promise<Blob>;
  getPrintableInvoice: (id: string) => Promise<Blob>;
  setError: (error: string | null) => void;
}

export const useElectronicInvoiceStore = create<ElectronicInvoiceStore>((set) => ({
  invoices: [],
  counts: null,
  loading: false,
  error: null,

  fetchStateSurface: async (limit = 50) => {
    set({ loading: true, error: null });
    try {
      const surface = await electronicInvoiceService.getStateSurface(limit);
      set({
        invoices: surface.invoices,
        counts: surface.counts,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch electronic invoices",
      });
    }
  },

  retryInvoice: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const retried = await electronicInvoiceService.retryInvoice(id);
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice.id === id
            ? {
                ...invoice,
                status: retried.status,
                requiresReview: retried.requiresReview,
                verdictNote: retried.verdictNote,
              }
            : invoice,
        ),
        loading: false,
      }));
      return retried;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to retry invoice",
      });
      throw error;
    }
  },

  getQrSvg: async (id: string) => {
    try {
      return await electronicInvoiceService.getQrSvg(id);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load QR code",
      });
      throw error;
    }
  },

  getQrPng: async (id: string) => {
    try {
      return await electronicInvoiceService.getQrPng(id);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to load QR code",
      });
      throw error;
    }
  },

  getPrintableInvoice: async (id: string) => {
    try {
      return await electronicInvoiceService.getPrintableInvoice(id);
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load printable invoice",
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
