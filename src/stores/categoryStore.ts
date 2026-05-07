import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import {
  categoryService,
  type CategoryDto,
} from "../infrastructure/api/categoryService";

interface CategoryStore {
  categories: CategoryDto[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchCategories: (pageNumber: number, pageSize: number) => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: [],
      loading: false,
      error: null,
      totalCount: 0,
      pageCount: 0,

      fetchCategories: async (pageNumber, pageSize) => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: "No authenticated" });
          return;
        }
        set({ loading: true, error: null });
        try {
          const result = await categoryService.getCategories(
            pageNumber,
            pageSize,
          );

          set({
            categories: result.items,
            totalCount: result.rowCount,
            pageCount: result.pageCount,
            loading: false,
          });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "category-storage",
      partialize: (state) => ({ categories: state.categories }),
    },
  ),
);
