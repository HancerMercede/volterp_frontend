import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCompraStore } from '../../stores/compraStore';
import type { PurchaseDto } from '../../domain/types';

vi.mock('../../infrastructure/api/purchaseService', () => ({
  purchaseService: {
    getPurchases: vi.fn(),
    getPurchase: vi.fn(),
    createPurchase: vi.fn(),
    updatePurchase: vi.fn(),
    deletePurchase: vi.fn(),
  },
}));

import { purchaseService } from '../../infrastructure/api/purchaseService';

const mockPurchaseService = purchaseService as unknown as {
  getPurchases: ReturnType<typeof vi.fn>;
  getPurchase: ReturnType<typeof vi.fn>;
  createPurchase: ReturnType<typeof vi.fn>;
  updatePurchase: ReturnType<typeof vi.fn>;
  deletePurchase: ReturnType<typeof vi.fn>;
};

const createMockCompra = (id: number): PurchaseDto => ({
  id,
  supplierId: id,
  supplierName: `Supplier ${String.fromCharCode(64 + id)}`,
  status: 'Pending',
  total: 1000 * id,
  notes: null,
  createdAt: '2024-01-01',
  updatedAt: null,
  items: [],
});

beforeEach(() => {
  useCompraStore.setState({
    compras: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  vi.clearAllMocks();
});

describe('useCompraStore', () => {
  describe('initial state', () => {
    it('starts with empty compras array', () => {
      expect(useCompraStore.getState().compras).toEqual([]);
    });

    it('starts with loading false', () => {
      expect(useCompraStore.getState().loading).toBe(false);
    });

    it('starts with null error', () => {
      expect(useCompraStore.getState().error).toBeNull();
    });
  });

  describe('setCompras via setState', () => {
    it('replaces compras array', () => {
      const mockCompras = [createMockCompra(1), createMockCompra(2)];
      useCompraStore.setState({ compras: mockCompras });

      expect(useCompraStore.getState().compras).toEqual(mockCompras);
      expect(useCompraStore.getState().compras).toHaveLength(2);
    });
  });

  describe('addCompra', () => {
    it('adds compra to list', async () => {
      const nuevaCompra = createMockCompra(1);
      mockPurchaseService.createPurchase.mockResolvedValue(nuevaCompra);

      await useCompraStore.getState().addCompra({ supplierName: 'Supplier A' });

      expect(useCompraStore.getState().compras).toHaveLength(1);
      expect(useCompraStore.getState().compras[0]).toEqual(nuevaCompra);
    });

    it('appends to existing compras', async () => {
      useCompraStore.setState({ compras: [createMockCompra(1)] });
      const nuevaCompra = createMockCompra(2);
      mockPurchaseService.createPurchase.mockResolvedValue(nuevaCompra);

      await useCompraStore.getState().addCompra({ supplierName: 'Supplier B' });

      expect(useCompraStore.getState().compras).toHaveLength(2);
    });
  });

  describe('updateCompra', () => {
    it('updates existing compra', async () => {
      useCompraStore.setState({ compras: [createMockCompra(1), createMockCompra(2)] });
      const updated = { ...createMockCompra(1), total: 2000, status: 'Completed' as const };
      mockPurchaseService.updatePurchase.mockResolvedValue(updated);

      await useCompraStore
        .getState()
        .updateCompra(1, { total: 2000, status: 'Completed' });

      expect(useCompraStore.getState().compras[0].total).toBe(2000);
      expect(useCompraStore.getState().compras[0].status).toBe('Completed');
    });

    it('does not modify other compras', async () => {
      useCompraStore.setState({ compras: [createMockCompra(1), createMockCompra(2)] });
      const updated = { ...createMockCompra(1), total: 2000 };
      mockPurchaseService.updatePurchase.mockResolvedValue(updated);

      await useCompraStore.getState().updateCompra(1, { total: 2000 });

      expect(useCompraStore.getState().compras[1].total).toBe(2000);
    });
  });

  describe('deleteCompra', () => {
    it('removes compra from list', async () => {
      useCompraStore.setState({ compras: [createMockCompra(1), createMockCompra(2)] });
      mockPurchaseService.deletePurchase.mockResolvedValue(undefined);

      await useCompraStore.getState().deleteCompra(1);

      expect(useCompraStore.getState().compras).toHaveLength(1);
      expect(useCompraStore.getState().compras[0].id).toBe(2);
    });

    it('handles non-existent id gracefully', async () => {
      useCompraStore.setState({ compras: [createMockCompra(1)] });
      mockPurchaseService.deletePurchase.mockRejectedValue(new Error('Not found'));

      await expect(
        useCompraStore.getState().deleteCompra(999),
      ).rejects.toThrow('Not found');

      expect(useCompraStore.getState().compras).toHaveLength(1);
    });
  });
});
