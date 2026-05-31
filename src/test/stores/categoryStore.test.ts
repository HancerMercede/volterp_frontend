import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCategoryStore } from '../../stores/categoryStore';
import { useAuthStore } from '../../stores/authStore';

// Mock categoryService
vi.mock('../../infrastructure/api/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn(),
    getCategory: vi.fn(),
    createCategory: vi.fn(),
    deleteCategory: vi.fn(),
  },
}));

// Mock authStore
vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ token: 'mock-token' })),
  },
}));

import { categoryService } from '../../infrastructure/api/categoryService';

const mockCategoryService = categoryService as ReturnType<typeof vi.fn>;

beforeEach(() => {
  useCategoryStore.setState({
    categories: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  vi.clearAllMocks();
});

describe('useCategoryStore', () => {
  describe('initial state', () => {
    it('starts with empty categories array', () => {
      expect(useCategoryStore.getState().categories).toEqual([]);
    });

    it('starts with loading false', () => {
      expect(useCategoryStore.getState().loading).toBe(false);
    });

    it('starts with null error', () => {
      expect(useCategoryStore.getState().error).toBeNull();
    });
  });

  describe('fetchCategories', () => {
    it('loads categories successfully from API', async () => {
      const mockResponse = {
        items: [
          { id: 1, name: 'Electronics', description: 'Electronic items', companyId: 1, isActive: true, createdAt: '2024-01-01' },
          { id: 2, name: 'Office', description: 'Office supplies', companyId: 1, isActive: true, createdAt: '2024-01-02' },
        ],
        rowCount: 2,
        pageCount: 1,
      };
      mockCategoryService.getCategories.mockResolvedValue(mockResponse);

      await useCategoryStore.getState().fetchCategories(1, 10);

      expect(useCategoryStore.getState().categories).toEqual(mockResponse.items);
      expect(useCategoryStore.getState().totalCount).toBe(2);
      expect(useCategoryStore.getState().pageCount).toBe(1);
      expect(useCategoryStore.getState().loading).toBe(false);
    });

    it('sets error on API failure', async () => {
      mockCategoryService.getCategories.mockRejectedValue(new Error('Network error'));

      await useCategoryStore.getState().fetchCategories(1, 10);

      expect(useCategoryStore.getState().error).toBe('Network error');
      expect(useCategoryStore.getState().loading).toBe(false);
    });

    it('sets error when no token', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValueOnce({ token: null });

      await useCategoryStore.getState().fetchCategories(1, 10);

      expect(useCategoryStore.getState().error).toBe('No authenticated');
    });
  });

  describe('clearError', () => {
    it('clears error state', () => {
      useCategoryStore.setState({ error: 'Some error' });
      useCategoryStore.getState().clearError();
      expect(useCategoryStore.getState().error).toBeNull();
    });
  });
});
