import { create } from "zustand";
import { companyEmissionModeService } from "../infrastructure/api/companyEmissionModeService";
import type {
  CompanyEmissionModeDto,
  UpdateCompanyContingencyRequest,
  UpdateCompanyEmissionModeRequest,
} from "../domain/types";

interface CompanyEmissionModeStore {
  emissionMode: CompanyEmissionModeDto | null;
  loading: boolean;
  error: string | null;
  fetchEmissionMode: () => Promise<void>;
  updateEmissionMode: (
    data: UpdateCompanyEmissionModeRequest,
  ) => Promise<CompanyEmissionModeDto>;
  updateContingency: (
    data: UpdateCompanyContingencyRequest,
  ) => Promise<CompanyEmissionModeDto>;
  setError: (error: string | null) => void;
}

export const useCompanyEmissionModeStore = create<CompanyEmissionModeStore>(
  (set) => ({
    emissionMode: null,
    loading: false,
    error: null,

    fetchEmissionMode: async () => {
      set({ loading: true, error: null });
      try {
        const emissionMode = await companyEmissionModeService.getEmissionMode();
        set({ emissionMode, loading: false });
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch company emission mode",
        });
      }
    },

    updateEmissionMode: async (data: UpdateCompanyEmissionModeRequest) => {
      set({ loading: true, error: null });
      try {
        const emissionMode = await companyEmissionModeService.updateEmissionMode(
          data,
        );
        set({ emissionMode, loading: false });
        return emissionMode;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update company emission mode",
        });
        throw error;
      }
    },

    updateContingency: async (data: UpdateCompanyContingencyRequest) => {
      set({ loading: true, error: null });
      try {
        const emissionMode = await companyEmissionModeService.updateContingency(
          data,
        );
        set({ emissionMode, loading: false });
        return emissionMode;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update company contingency",
        });
        throw error;
      }
    },

    setError: (error: string | null) => set({ error }),
  }),
);
