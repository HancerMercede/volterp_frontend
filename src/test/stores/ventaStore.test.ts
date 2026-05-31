import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useVentaStore } from '../../stores/ventaStore';
import { useAuthStore } from '../../stores/authStore';

// Mock saleService
vi.mock('../../infrastructure/api/saleService', () => ({
  saleService: {
    getSales: vi.fn(),
    getPendingSales: vi.fn(),
    getSalesByStatus: vi.fn(),
    createSale: vi.fn(),
    updateSale: vi.fn(),
    completeSale: vi.fn(),
    deleteSale: vi.fn(),
  },
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ token: 'mock-token' })),
  },
}));

import { saleService } from '../../infrastructure/api/saleService';

const mockSaleService = saleService as ReturnType<typeof vi.fn>;

beforeEach(() => {
  useVentaStore.setState({
    ventas: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  vi.clearAllMocks();
});

describe('useVentaStore', () => {
  describe('initial state', () => {
    it('starts with empty ventas array', () => {
      expect(useVentaStore.getState().ventas).toEqual([]);
    });

    it('starts with loading false', () => {
      expect(useVentaStore.getState().loading).toBe(false);
    });

    it('starts with null error', () => {
      expect(useVentaStore.getState().error).toBeNull();
    });

    it('starts with totalCount 0', () => {
      expect(useVentaStore.getState().totalCount).toBe(0);
    });

    it('starts with pageCount 0', () => {
      expect(useVentaStore.getState().pageCount).toBe(0);
    });
  });

  describe('fetchVentas', () => {
    it('loads ventas successfully', async () => {
      const mockResponse = {
        items: [
          { id: 1, companyId: 1, clienteId: null, clienteName: 'Client A', status: 'Pending' as const, total: 1000, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] },
          { id: 2, companyId: 1, clienteId: null, clienteName: 'Client B', status: 'Completed' as const, total: 2000, notes: null, createdAt: '2024-01-02', updatedAt: null, items: [] },
        ],
        rowCount: 2,
        pageCount: 1,
      };
      mockSaleService.getSales.mockResolvedValue(mockResponse);

      await useVentaStore.getState().fetchVentas(1, 10);

      expect(useVentaStore.getState().ventas).toEqual(mockResponse.items);
      expect(useVentaStore.getState().totalCount).toBe(2);
      expect(useVentaStore.getState().pageCount).toBe(1);
      expect(useVentaStore.getState().loading).toBe(false);
    });

    it('sets error on failure', async () => {
      mockSaleService.getSales.mockRejectedValue(new Error('Network error'));

      await useVentaStore.getState().fetchVentas(1, 10);

      expect(useVentaStore.getState().error).toBe('Network error');
      expect(useVentaStore.getState().loading).toBe(false);
    });

    it('sets error when no token', async () => {
      vi.mocked(useAuthStore.getState).mockReturnValueOnce({ token: null });

      await useVentaStore.getState().fetchVentas(1, 10);

      expect(useVentaStore.getState().error).toBe('No autenticado');
    });
  });

  describe('fetchVentasPendientes', () => {
    it('loads pending ventas', async () => {
      const mockResponse = {
        items: [{ id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] }],
        rowCount: 1,
        pageCount: 1,
      };
      mockSaleService.getPendingSales.mockResolvedValue(mockResponse);

      await useVentaStore.getState().fetchVentasPendientes(1, 10);

      expect(useVentaStore.getState().ventas).toEqual(mockResponse.items);
      expect(useVentaStore.getState().loading).toBe(false);
    });
  });

  describe('fetchVentasCompletadas', () => {
    it('loads completed ventas', async () => {
      const mockResponse = {
        items: [{ id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Completed' as const, total: 1000, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] }],
        rowCount: 1,
        pageCount: 1,
      };
      mockSaleService.getSalesByStatus.mockResolvedValue(mockResponse);

      await useVentaStore.getState().fetchVentasCompletadas(1, 10);

      expect(useVentaStore.getState().ventas).toEqual(mockResponse.items);
      expect(useVentaStore.getState().loading).toBe(false);
    });
  });

  describe('createVenta', () => {
    it('adds venta to list on success', async () => {
      const nuevaVenta = { id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] };
      mockSaleService.createSale.mockResolvedValue(nuevaVenta);

      const data = { companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, items: [] };

      await useVentaStore.getState().createVenta(data);

      expect(useVentaStore.getState().ventas).toContainEqual(nuevaVenta);
      expect(useVentaStore.getState().ventas[0].id).toBe(1);
      expect(useVentaStore.getState().loading).toBe(false);
    });

    it('increments totalCount on success', async () => {
      const nuevaVenta = { id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] };
      mockSaleService.createSale.mockResolvedValue(nuevaVenta);

      const data = { companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, items: [] };

      await useVentaStore.getState().createVenta(data);

      expect(useVentaStore.getState().totalCount).toBe(1);
    });

    it('sets error on failure and throws', async () => {
      mockSaleService.createSale.mockRejectedValue(new Error('Creation failed'));

      const data = { companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, items: [] };

      await expect(useVentaStore.getState().createVenta(data)).rejects.toThrow('Creation failed');
      expect(useVentaStore.getState().error).toBe('Creation failed');
    });
  });

  describe('updateVenta', () => {
    it('updates venta in list on success', async () => {
      const actualizada = { id: 1, companyId: 1, clienteId: null, clienteName: 'Updated Client', status: 'Pending' as const, total: 800, notes: null, createdAt: '2024-01-01', updatedAt: '2024-01-02', items: [] };
      mockSaleService.updateSale.mockResolvedValue(actualizada);

      useVentaStore.setState({
        ventas: [{ id: 1, companyId: 1, clienteId: null, clienteName: 'Old Client', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] }],
      });

      const data = { clienteId: null, clienteName: 'Updated Client', status: 'Pending' as const, total: 800, notes: null, items: [] };

      await useVentaStore.getState().updateVenta(1, data);

      expect(useVentaStore.getState().ventas[0].clienteName).toBe('Updated Client');
      expect(useVentaStore.getState().ventas[0].total).toBe(800);
    });

    it('sets error on failure and throws', async () => {
      mockSaleService.updateSale.mockRejectedValue(new Error('Update failed'));

      useVentaStore.setState({
        ventas: [{ id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] }],
      });

      const data = { clienteId: null, clienteName: 'Updated', status: 'Pending' as const, total: 500, notes: null, items: [] };

      await expect(useVentaStore.getState().updateVenta(1, data)).rejects.toThrow('Update failed');
      expect(useVentaStore.getState().error).toBe('Update failed');
    });
  });

  describe('completeVenta', () => {
    it('updates venta status to Completed', async () => {
      const completada = { id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Completed' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: '2024-01-02', items: [] };
      mockSaleService.completeSale.mockResolvedValue(completada);

      useVentaStore.setState({
        ventas: [{ id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] }],
      });

      await useVentaStore.getState().completeVenta(1);

      expect(useVentaStore.getState().ventas[0].status).toBe('Completed');
    });

    it('sets error on failure', async () => {
      mockSaleService.completeSale.mockRejectedValue(new Error('Complete failed'));

      useVentaStore.setState({
        ventas: [{ id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] }],
      });

      await expect(useVentaStore.getState().completeVenta(1)).rejects.toThrow('Complete failed');
      expect(useVentaStore.getState().error).toBe('Complete failed');
    });
  });

  describe('deleteVenta', () => {
    it('removes venta from list on success', async () => {
      mockSaleService.deleteSale.mockResolvedValue(undefined);

      useVentaStore.setState({
        ventas: [
          { id: 1, companyId: 1, clienteId: null, clienteName: 'Client A', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] },
          { id: 2, companyId: 1, clienteId: null, clienteName: 'Client B', status: 'Pending' as const, total: 300, notes: null, createdAt: '2024-01-02', updatedAt: null, items: [] },
        ],
        totalCount: 2,
      });

      await useVentaStore.getState().deleteVenta(1);

      expect(useVentaStore.getState().ventas).toHaveLength(1);
      expect(useVentaStore.getState().ventas[0].id).toBe(2);
      expect(useVentaStore.getState().totalCount).toBe(1);
    });

    it('sets error on failure', async () => {
      mockSaleService.deleteSale.mockRejectedValue(new Error('Delete failed'));

      useVentaStore.setState({
        ventas: [{ id: 1, companyId: 1, clienteId: null, clienteName: 'Client', status: 'Pending' as const, total: 500, notes: null, createdAt: '2024-01-01', updatedAt: null, items: [] }],
      });

      await expect(useVentaStore.getState().deleteVenta(1)).rejects.toThrow('Delete failed');
      expect(useVentaStore.getState().error).toBe('Delete failed');
    });
  });

  describe('clearError', () => {
    it('clears error state', () => {
      useVentaStore.setState({ error: 'Some error' });

      useVentaStore.getState().clearError();

      expect(useVentaStore.getState().error).toBeNull();
    });
  });
});
