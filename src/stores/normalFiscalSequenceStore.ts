import { create } from "zustand";
import { normalFiscalSequenceService } from "../infrastructure/api/normalFiscalSequenceService";
import type {
  NormalFiscalSequence,
  SaveNormalFiscalSequenceRequest,
} from "../domain/types";

interface NormalFiscalSequenceStore {
  normalSequences: NormalFiscalSequence[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchNormalSequences: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getNormalSequenceById: (id: string) => Promise<NormalFiscalSequence | null>;
  addNormalSequence: (
    data: SaveNormalFiscalSequenceRequest,
  ) => Promise<NormalFiscalSequence>;
  updateNormalSequence: (
    id: string,
    data: SaveNormalFiscalSequenceRequest,
  ) => Promise<NormalFiscalSequence>;
  setError: (error: string | null) => void;
}

export const useNormalFiscalSequenceStore = create<NormalFiscalSequenceStore>(
  (set) => ({
    normalSequences: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,

    fetchNormalSequences: async (pageNumber = 1, pageSize = 10) => {
      set({ loading: true, error: null });
      try {
        const result = await normalFiscalSequenceService.getNormalSequences(
          pageNumber,
          pageSize,
        );
        set({
          normalSequences: result.items,
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
              : "Failed to fetch normal fiscal sequences",
        });
      }
    },

    getNormalSequenceById: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const sequence = await normalFiscalSequenceService.getNormalSequenceById(
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
              : "Failed to fetch normal fiscal sequence",
        });
        return null;
      }
    },

    addNormalSequence: async (data: SaveNormalFiscalSequenceRequest) => {
      set({ loading: true, error: null });
      try {
        const sequence = await normalFiscalSequenceService.createNormalSequence(
          data,
        );
        set((state) => ({
          normalSequences: [...state.normalSequences, sequence],
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
              : "Failed to create normal fiscal sequence",
        });
        throw error;
      }
    },

    updateNormalSequence: async (
      id: string,
      data: SaveNormalFiscalSequenceRequest,
    ) => {
      set({ loading: true, error: null });
      try {
        const sequence = await normalFiscalSequenceService.updateNormalSequence(
          id,
          data,
        );
        set((state) => ({
          normalSequences: state.normalSequences.map((current) =>
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
              : "Failed to update normal fiscal sequence",
        });
        throw error;
      }
    },

    setError: (error: string | null) => set({ error }),
  }),
);
