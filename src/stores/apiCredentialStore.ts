import { create } from "zustand";
import { apiCredentialService } from "../infrastructure/api/apiCredentialService";
import type { ApiCredential, IssuedApiCredentialDto } from "../domain/types";

interface ApiCredentialStore {
  credentials: ApiCredential[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchCredentials: (pageNumber?: number, pageSize?: number) => Promise<void>;
  createCredential: (
    name: string,
    expiresAt: string | null,
  ) => Promise<IssuedApiCredentialDto>;
  deleteCredential: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useApiCredentialStore = create<ApiCredentialStore>((set) => ({
  credentials: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageCount: 0,

  fetchCredentials: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await apiCredentialService.getCredentials(
        pageNumber,
        pageSize,
      );
      set({
        credentials: result.items,
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
            : "Failed to fetch API credentials",
      });
    }
  },

  createCredential: async (name: string, expiresAt: string | null) => {
    set({ loading: true, error: null });
    try {
      const issued = await apiCredentialService.createCredential(name, expiresAt);
      set((state) => ({
        credentials: [
          ...state.credentials,
          {
            id: issued.id,
            name: issued.name,
            keyId: issued.keyId,
            status: "Active",
            expiresAt: issued.expiresAt,
            updatedAt: null,
            isExpired: false,
            createdAt: new Date().toISOString(),
          },
        ],
        totalCount: state.totalCount + 1,
        loading: false,
      }));
      return issued;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create API credential",
      });
      throw error;
    }
  },

  deleteCredential: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiCredentialService.deleteCredential(id);
      set((state) => ({
        credentials: state.credentials.filter(
          (credential) => credential.id !== id,
        ),
        totalCount: Math.max(state.totalCount - 1, 0),
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete API credential",
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
