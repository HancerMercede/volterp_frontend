import { beforeEach, describe, expect, it } from 'vitest';
import { useCompraStore } from '../../stores/compraStore';

beforeEach(() => {
  useCompraStore.setState({
    compras: [],
    loading: false,
    error: null,
  });
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

  describe('setCompras', () => {
    it('replaces compras array', () => {
      const mockCompras = [
        { id: '1', proveedor: 'Supplier A', producto: 'Product 1', cantidad: 10, total: 1000, fecha: '2024-01-01', estado: 'pendiente' as const },
        { id: '2', proveedor: 'Supplier B', producto: 'Product 2', cantidad: 5, total: 500, fecha: '2024-01-02', estado: 'recibida' as const },
      ];

      useCompraStore.getState().setCompras(mockCompras);

      expect(useCompraStore.getState().compras).toEqual(mockCompras);
      expect(useCompraStore.getState().compras).toHaveLength(2);
    });
  });

  describe('addCompra', () => {
    it('adds compra to list', () => {
      const nuevaCompra = { id: '1', proveedor: 'Supplier A', producto: 'Product 1', cantidad: 10, total: 1000, fecha: '2024-01-01', estado: 'pendiente' as const };

      useCompraStore.getState().addCompra(nuevaCompra);

      expect(useCompraStore.getState().compras).toHaveLength(1);
      expect(useCompraStore.getState().compras[0]).toEqual(nuevaCompra);
    });

    it('appends to existing compras', () => {
      useCompraStore.setState({
        compras: [{ id: '1', proveedor: 'Supplier A', producto: 'Product 1', cantidad: 10, total: 1000, fecha: '2024-01-01', estado: 'pendiente' as const }],
      });

      const nuevaCompra = { id: '2', proveedor: 'Supplier B', producto: 'Product 2', cantidad: 5, total: 500, fecha: '2024-01-02', estado: 'recibida' as const };
      useCompraStore.getState().addCompra(nuevaCompra);

      expect(useCompraStore.getState().compras).toHaveLength(2);
    });
  });

  describe('updateCompra', () => {
    it('updates existing compra', () => {
      useCompraStore.setState({
        compras: [
          { id: '1', proveedor: 'Supplier A', producto: 'Product 1', cantidad: 10, total: 1000, fecha: '2024-01-01', estado: 'pendiente' as const },
          { id: '2', proveedor: 'Supplier B', producto: 'Product 2', cantidad: 5, total: 500, fecha: '2024-01-02', estado: 'recibida' as const },
        ],
      });

      useCompraStore.getState().updateCompra('1', { cantidad: 20, estado: 'recibida' as const });

      expect(useCompraStore.getState().compras[0].cantidad).toBe(20);
      expect(useCompraStore.getState().compras[0].estado).toBe('recibida');
    });

    it('does not modify other compras', () => {
      useCompraStore.setState({
        compras: [
          { id: '1', proveedor: 'Supplier A', producto: 'Product 1', cantidad: 10, total: 1000, fecha: '2024-01-01', estado: 'pendiente' as const },
          { id: '2', proveedor: 'Supplier B', producto: 'Product 2', cantidad: 5, total: 500, fecha: '2024-01-02', estado: 'pendiente' as const },
        ],
      });

      useCompraStore.getState().updateCompra('1', { cantidad: 20 });

      expect(useCompraStore.getState().compras[1].cantidad).toBe(5);
    });
  });

  describe('deleteCompra', () => {
    it('removes compra from list', () => {
      useCompraStore.setState({
        compras: [
          { id: '1', proveedor: 'Supplier A', producto: 'Product 1', cantidad: 10, total: 1000, fecha: '2024-01-01', estado: 'pendiente' as const },
          { id: '2', proveedor: 'Supplier B', producto: 'Product 2', cantidad: 5, total: 500, fecha: '2024-01-02', estado: 'recibida' as const },
        ],
      });

      useCompraStore.getState().deleteCompra('1');

      expect(useCompraStore.getState().compras).toHaveLength(1);
      expect(useCompraStore.getState().compras[0].id).toBe('2');
    });

    it('handles non-existent id gracefully', () => {
      useCompraStore.setState({
        compras: [{ id: '1', proveedor: 'Supplier A', producto: 'Product 1', cantidad: 10, total: 1000, fecha: '2024-01-01', estado: 'pendiente' as const }],
      });

      expect(() => useCompraStore.getState().deleteCompra('999')).not.toThrow();
      expect(useCompraStore.getState().compras).toHaveLength(1);
    });
  });
});
