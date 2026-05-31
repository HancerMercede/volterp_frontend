import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductoStore } from '../../stores/productoStore';
import { useAuthStore } from '../../stores/authStore';

// Mock productService
vi.mock('../../infrastructure/api/productService', () => ({
  productService: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

// Mock authStore token
vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ token: 'mock-token' })),
  },
}));

import { productService } from '../../infrastructure/api/productService';

const mockProductService = productService as ReturnType<typeof vi.fn>;

beforeEach(() => {
  useProductoStore.setState({
    productos: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  vi.clearAllMocks();
});

describe('useProductoStore', () => {
  describe('initial state', () => {
    it('starts with empty productos array', () => {
      expect(useProductoStore.getState().productos).toEqual([]);
    });

    it('starts with loading false', () => {
      expect(useProductoStore.getState().loading).toBe(false);
    });

    it('starts with null error', () => {
      expect(useProductoStore.getState().error).toBeNull();
    });

    it('starts with totalCount 0', () => {
      expect(useProductoStore.getState().totalCount).toBe(0);
    });

    it('starts with pageCount 0', () => {
      expect(useProductoStore.getState().pageCount).toBe(0);
    });
  });

  describe('fetchProductos', () => {
    it('loads products successfully', async () => {
      const mockResponse = {
        items: [
          { id: 1, name: 'Product 1', category: 'Cat1', price: 100, stock: 10 },
          { id: 2, name: 'Product 2', category: 'Cat2', price: 200, stock: 20 },
        ],
        rowCount: 2,
        pageCount: 1,
      };
      mockProductService.getProducts.mockResolvedValue(mockResponse);

      await useProductoStore.getState().fetchProductos(1, 10);

      expect(useProductoStore.getState().productos).toEqual(mockResponse.items);
      expect(useProductoStore.getState().totalCount).toBe(2);
      expect(useProductoStore.getState().pageCount).toBe(1);
      expect(useProductoStore.getState().loading).toBe(false);
      expect(useProductoStore.getState().error).toBeNull();
    });

    it('sets error on failure', async () => {
      mockProductService.getProducts.mockRejectedValue(new Error('Network error'));

      await useProductoStore.getState().fetchProductos(1, 10);

      expect(useProductoStore.getState().error).toBe('Network error');
      expect(useProductoStore.getState().loading).toBe(false);
    });

    it('sets error when no token', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValueOnce({ token: null });

      await useProductoStore.getState().fetchProductos(1, 10);

      expect(useProductoStore.getState().error).toBe('No authenticated');
      expect(mockProductService.getProducts).not.toHaveBeenCalled();
    });
  });

  describe('createProducto', () => {
    it('adds product to list on success', async () => {
      const newProduct = {
        id: 1,
        name: 'New Product',
        category: 'Electronics',
        description: null,
        price: 150,
        stock: 5,
        categoryId: null,
        categoryName: null,
        companyId: 1,
        isActive: true,
        imageUrl: null,
        createdAt: '2024-01-01',
        updatedAt: null,
      };
      mockProductService.createProduct.mockResolvedValue(newProduct);

      const data = {
        name: 'New Product',
        category: 'Electronics',
        description: null,
        price: 150,
        stock: 5,
        categoryId: null,
        companyId: 1,
      };

      await useProductoStore.getState().createProducto(data);

      expect(useProductoStore.getState().productos).toContainEqual(newProduct);
      expect(useProductoStore.getState().loading).toBe(false);
    });

    it('sets error on failure and throws', async () => {
      mockProductService.createProduct.mockRejectedValue(new Error('Creation failed'));

      const data = {
        name: 'Fail Product',
        category: 'Test',
        description: null,
        price: 100,
        stock: 5,
        categoryId: null,
        companyId: 1,
      };

      await expect(useProductoStore.getState().createProducto(data)).rejects.toThrow('Creation failed');
      expect(useProductoStore.getState().error).toBe('Creation failed');
      expect(useProductoStore.getState().loading).toBe(false);
    });

    it('sets error when no token', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValueOnce({ token: null });

      const data = {
        name: 'New Product',
        category: 'Test',
        description: null,
        price: 100,
        stock: 5,
        categoryId: null,
        companyId: 1,
      };

      await useProductoStore.getState().createProducto(data);

      expect(useProductoStore.getState().error).toBe('No authenticated');
      expect(mockProductService.createProduct).not.toHaveBeenCalled();
    });
  });

  describe('updateProducto', () => {
    it('updates product in list on success', async () => {
      const updatedProduct = {
        id: 1,
        name: 'Updated Product',
        category: 'Electronics',
        description: null,
        price: 200,
        stock: 15,
        categoryId: null,
        categoryName: null,
        companyId: 1,
        isActive: true,
        imageUrl: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
      };
      mockProductService.updateProduct.mockResolvedValue(updatedProduct);

      // Set initial state
      useProductoStore.setState({
        productos: [
          { id: 1, name: 'Old Product', category: 'Old', description: null, price: 100, stock: 10, categoryId: null, categoryName: null, companyId: 1, isActive: true, imageUrl: null, createdAt: '2024-01-01', updatedAt: null },
        ],
      });

      const data = {
        name: 'Updated Product',
        category: 'Electronics',
        description: null,
        price: 200,
        stock: 15,
        categoryId: null,
        isActive: true,
      };

      await useProductoStore.getState().updateProducto(1, data);

      expect(useProductoStore.getState().productos[0].name).toBe('Updated Product');
      expect(useProductoStore.getState().productos[0].price).toBe(200);
      expect(useProductoStore.getState().loading).toBe(false);
    });

    it('sets error on failure and throws', async () => {
      mockProductService.updateProduct.mockRejectedValue(new Error('Update failed'));

      useProductoStore.setState({
        productos: [
          { id: 1, name: 'Product', category: 'Cat', description: null, price: 100, stock: 10, categoryId: null, categoryName: null, companyId: 1, isActive: true, imageUrl: null, createdAt: '2024-01-01', updatedAt: null },
        ],
      });

      const data = {
        name: 'Updated',
        category: 'Cat',
        description: null,
        price: 100,
        stock: 10,
        categoryId: null,
        isActive: true,
      };

      await expect(useProductoStore.getState().updateProducto(1, data)).rejects.toThrow('Update failed');
      expect(useProductoStore.getState().error).toBe('Update failed');
      expect(useProductoStore.getState().loading).toBe(false);
    });
  });

  describe('deleteProducto', () => {
    it('removes product from list on success', async () => {
      mockProductService.deleteProduct.mockResolvedValue(undefined);

      useProductoStore.setState({
        productos: [
          { id: 1, name: 'Product 1', category: 'Cat1', description: null, price: 100, stock: 10, categoryId: null, categoryName: null, companyId: 1, isActive: true, imageUrl: null, createdAt: '2024-01-01', updatedAt: null },
          { id: 2, name: 'Product 2', category: 'Cat2', description: null, price: 200, stock: 20, categoryId: null, categoryName: null, companyId: 1, isActive: true, imageUrl: null, createdAt: '2024-01-01', updatedAt: null },
        ],
      });

      await useProductoStore.getState().deleteProducto(1);

      expect(useProductoStore.getState().productos).toHaveLength(1);
      expect(useProductoStore.getState().productos[0].id).toBe(2);
      expect(useProductoStore.getState().loading).toBe(false);
    });

    it('sets error on failure and throws', async () => {
      mockProductService.deleteProduct.mockRejectedValue(new Error('Delete failed'));

      useProductoStore.setState({
        productos: [
          { id: 1, name: 'Product 1', category: 'Cat1', description: null, price: 100, stock: 10, categoryId: null, categoryName: null, companyId: 1, isActive: true, imageUrl: null, createdAt: '2024-01-01', updatedAt: null },
        ],
      });

      await expect(useProductoStore.getState().deleteProducto(1)).rejects.toThrow('Delete failed');
      expect(useProductoStore.getState().error).toBe('Delete failed');
      expect(useProductoStore.getState().loading).toBe(false);
    });

    it('does not remove product when no token', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValueOnce({ token: null });

      useProductoStore.setState({
        productos: [
          { id: 1, name: 'Product 1', category: 'Cat1', description: null, price: 100, stock: 10, categoryId: null, categoryName: null, companyId: 1, isActive: true, imageUrl: null, createdAt: '2024-01-01', updatedAt: null },
        ],
      });

      await useProductoStore.getState().deleteProducto(1);

      expect(useProductoStore.getState().error).toBe('No authenticated');
      expect(useProductoStore.getState().productos).toHaveLength(1);
      expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
    });
  });

  describe('clearError', () => {
    it('clears error state', () => {
      useProductoStore.setState({ error: 'Some error' });

      useProductoStore.getState().clearError();

      expect(useProductoStore.getState().error).toBeNull();
    });
  });
});
