import { beforeEach, describe, expect, it } from 'vitest';
import { useProveedorStore } from '../../stores/proveedorStore';

beforeEach(() => {
  useProveedorStore.setState({
    proveedores: [],
    loading: false,
    error: null,
  });
});

describe('useProveedorStore', () => {
  describe('initial state', () => {
    it('starts with empty proveedores array', () => {
      expect(useProveedorStore.getState().proveedores).toEqual([]);
    });

    it('starts with loading false', () => {
      expect(useProveedorStore.getState().loading).toBe(false);
    });

    it('starts with null error', () => {
      expect(useProveedorStore.getState().error).toBeNull();
    });
  });

  describe('setProveedores', () => {
    it('replaces proveedores array', () => {
      const mockProveedores = [
        { id: '1', nombre: 'Proveedor A', email: 'a@email.com', telefono: '809-111-1111', direccion: 'Address A', categoria: 'Electronics', totalOrdenes: 10, avatar: 'https://avatar.com/1' },
        { id: '2', nombre: 'Proveedor B', email: 'b@email.com', telefono: '809-222-2222', direccion: 'Address B', categoria: 'Office', totalOrdenes: 5, avatar: 'https://avatar.com/2' },
      ];

      useProveedorStore.getState().setProveedores(mockProveedores);

      expect(useProveedorStore.getState().proveedores).toEqual(mockProveedores);
      expect(useProveedorStore.getState().proveedores).toHaveLength(2);
    });
  });

  describe('addProveedor', () => {
    it('adds proveedor to list', () => {
      const nuevoProveedor = { id: '1', nombre: 'Proveedor A', email: 'a@email.com', telefono: '809-111-1111', direccion: 'Address A', categoria: 'Electronics', totalOrdenes: 10, avatar: 'https://avatar.com/1' };

      useProveedorStore.getState().addProveedor(nuevoProveedor);

      expect(useProveedorStore.getState().proveedores).toHaveLength(1);
      expect(useProveedorStore.getState().proveedores[0]).toEqual(nuevoProveedor);
    });

    it('appends to existing proveedores', () => {
      useProveedorStore.setState({
        proveedores: [{ id: '1', nombre: 'Proveedor A', email: 'a@email.com', telefono: '809-111-1111', direccion: 'Address A', categoria: 'Electronics', totalOrdenes: 10, avatar: 'https://avatar.com/1' }],
      });

      const nuevoProveedor = { id: '2', nombre: 'Proveedor B', email: 'b@email.com', telefono: '809-222-2222', direccion: 'Address B', categoria: 'Office', totalOrdenes: 5, avatar: 'https://avatar.com/2' };
      useProveedorStore.getState().addProveedor(nuevoProveedor);

      expect(useProveedorStore.getState().proveedores).toHaveLength(2);
    });
  });

  describe('updateProveedor', () => {
    it('updates existing proveedor', () => {
      useProveedorStore.setState({
        proveedores: [
          { id: '1', nombre: 'Proveedor A', email: 'a@email.com', telefono: '809-111-1111', direccion: 'Address A', categoria: 'Electronics', totalOrdenes: 10, avatar: 'https://avatar.com/1' },
          { id: '2', nombre: 'Proveedor B', email: 'b@email.com', telefono: '809-222-2222', direccion: 'Address B', categoria: 'Office', totalOrdenes: 5, avatar: 'https://avatar.com/2' },
        ],
      });

      useProveedorStore.getState().updateProveedor('1', { nombre: 'Proveedor Actualizado', telefono: '809-999-9999' });

      expect(useProveedorStore.getState().proveedores[0].nombre).toBe('Proveedor Actualizado');
      expect(useProveedorStore.getState().proveedores[0].telefono).toBe('809-999-9999');
    });

    it('does not modify other proveedores', () => {
      useProveedorStore.setState({
        proveedores: [
          { id: '1', nombre: 'Proveedor A', email: 'a@email.com', telefono: '809-111-1111', direccion: 'Address A', categoria: 'Electronics', totalOrdenes: 10, avatar: 'https://avatar.com/1' },
          { id: '2', nombre: 'Proveedor B', email: 'b@email.com', telefono: '809-222-2222', direccion: 'Address B', categoria: 'Office', totalOrdenes: 5, avatar: 'https://avatar.com/2' },
        ],
      });

      useProveedorStore.getState().updateProveedor('1', { nombre: 'Updated' });

      expect(useProveedorStore.getState().proveedores[1].nombre).toBe('Proveedor B');
    });
  });

  describe('deleteProveedor', () => {
    it('removes proveedor from list', () => {
      useProveedorStore.setState({
        proveedores: [
          { id: '1', nombre: 'Proveedor A', email: 'a@email.com', telefono: '809-111-1111', direccion: 'Address A', categoria: 'Electronics', totalOrdenes: 10, avatar: 'https://avatar.com/1' },
          { id: '2', nombre: 'Proveedor B', email: 'b@email.com', telefono: '809-222-2222', direccion: 'Address B', categoria: 'Office', totalOrdenes: 5, avatar: 'https://avatar.com/2' },
        ],
      });

      useProveedorStore.getState().deleteProveedor('1');

      expect(useProveedorStore.getState().proveedores).toHaveLength(1);
      expect(useProveedorStore.getState().proveedores[0].id).toBe('2');
    });

    it('handles non-existent id gracefully', () => {
      useProveedorStore.setState({
        proveedores: [{ id: '1', nombre: 'Proveedor A', email: 'a@email.com', telefono: '809-111-1111', direccion: 'Address A', categoria: 'Electronics', totalOrdenes: 10, avatar: 'https://avatar.com/1' }],
      });

      expect(() => useProveedorStore.getState().deleteProveedor('999')).not.toThrow();
      expect(useProveedorStore.getState().proveedores).toHaveLength(1);
    });
  });
});
