import { create } from "zustand";
import { electronicInvoiceSequenceService } from "../infrastructure/api/electronicInvoiceSequenceService";
import type {
  ElectronicInvoiceSequence,
  RangeAnnulmentResult,
  SaveElectronicInvoiceSequenceRequest,
} from "../domain/types";

interface ElectronicInvoiceSequenceStore {
  sequences: ElectronicInvoiceSequence[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchSequences: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getSequenceById: (id: string) => Promise<ElectronicInvoiceSequence | null>;
  addSequence: (
    data: SaveElectronicInvoiceSequenceRequest,
  ) => Promise<ElectronicInvoiceSequence>;
  updateSequence: (
    id: string,
    data: SaveElectronicInvoiceSequenceRequest,
  ) => Promise<ElectronicInvoiceSequence>;
  annulSequence: (id: string) => Promise<RangeAnnulmentResult>;
  setError: (error: string | null) => void;
}

export const useElectronicInvoiceSequenceStore =
  create<ElectronicInvoiceSequenceStore>((set) => ({
    sequences: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,

    fetchSequences: async (pageNumber = 1, pageSize = 10) => {
      set({ loading: true, error: null });
      try {
        const result = await electronicInvoiceSequenceService.getSequences(
          pageNumber,
          pageSize,
        );
        set({
          sequences: result.items,
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
              : "Failed to fetch electronic invoice sequences",
        });
      }
    },

    getSequenceById: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const sequence = await electronicInvoiceSequenceService.getSequenceById(
          id,
        );
        set({ loading: false });
        return sequence;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch electronic invoice sequence",
        });
        return null;
      }
    },

    addSequence: async (data: SaveElectronicInvoiceSequenceRequest) => {
      set({ loading: true, error: null });
      try {
        const sequence = await electronicInvoiceSequenceService.createSequence(
          data,
        );
        set((state) => ({
          sequences: [...state.sequences, sequence],
          totalCount: state.totalCount + 1,
          loading: false,
        }));
        return sequence;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create electronic invoice sequence",
        });
        throw error;
      }
    },

    updateSequence: async (
      id: string,
      data: SaveElectronicInvoiceSequenceRequest,
    ) => {
      set({ loading: true, error: null });
      try {
        const sequence = await electronicInvoiceSequenceService.updateSequence(
          id,
          data,
        );
        set((state) => ({
          sequences: state.sequences.map((current) =>
            current.id === id ? { ...current, ...sequence } : current,
          ),
          loading: false,
        }));
        return sequence;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update electronic invoice sequence",
        });
        throw error;
      }
    },

    annulSequence: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const result = await electronicInvoiceSequenceService.annulSequence(id);
        set((state) => ({
          sequences: state.sequences.filter((current) => current.id !== id),
          totalCount: Math.max(state.totalCount - 1, 0),
          loading: false,
        }));
        return result;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to annul electronic invoice sequence",
        });
        throw error;
      }
    },

    setError: (error: string | null) => set({ error }),
  }));
