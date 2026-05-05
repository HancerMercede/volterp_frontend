import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { categoryService, type CategoryDto } from '../infrastructure/api/categoryService';

interface CategoryStore {
  categories: CategoryDto[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: [],
      loading: false,
      error: null,

      fetchCategories: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ error: 'No authenticated' });
          return;
        }
        set({ loading: true, error: null });
        try {
          const dtos = await categoryService.getCategories();
          set({ categories: dtos, loading: false });
        } catch (err) {
          set({ error: (err as Error).message, loading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'category-storage',
      partialize: (state) => ({ categories: state.categories }),
    }
  )
);