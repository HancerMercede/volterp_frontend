import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProveedorStore } from '../../stores/proveedorStore';
import { useAuthStore } from '../../stores/authStore';
import type { SupplierDto } from '../../domain/types';

vi.mock('../../infrastructure/api/supplierService', () => ({
  supplierService: {
    getSuppliers: vi.fn(),
    getSupplier: vi.fn(),
    createSupplier: vi.fn(),
    updateSupplier: vi.fn(),
    deleteSupplier: vi.fn(),
  },
}));

vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ token: 'mock-token' })),
  },
}));

import { supplierService } from '../../infrastructure/api/supplierService';

const mockSupplierService = supplierService as unknown as {
  getSuppliers: ReturnType<typeof vi.fn>;
  getSupplier: ReturnType<typeof vi.fn>;
  createSupplier: ReturnType<typeof vi.fn>;
  updateSupplier: ReturnType<typeof vi.fn>;
  deleteSupplier: ReturnType<typeof vi.fn>;
};

const createMockProveedor = (id: number, name: string): SupplierDto => ({
  id,
  name,
  email: `${id}@test.com`,
  phone: '8095550000',
  address: 'Test Address',
  category: 'General',
  contactPerson: 'Contact',
  isActive: true,
  createdAt: null,
  updatedAt: null,
});

beforeEach(() => {
  useProveedorStore.setState({
    proveedores: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  vi.clearAllMocks();
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

  describe('setProveedores via setState', () => {
    it('replaces proveedores array', () => {
      const mockProveedores = [
        createMockProveedor(1, 'Proveedor A'),
        createMockProveedor(2, 'Proveedor B'),
      ];
      useProveedorStore.setState({ proveedores: mockProveedores });

      expect(useProveedorStore.getState().proveedores).toEqual(mockProveedores);
      expect(useProveedorStore.getState().proveedores).toHaveLength(2);
    });
  });

  describe('addProveedor', () => {
    it('adds proveedor to list', async () => {
      const nuevoProveedor = createMockProveedor(1, 'Proveedor A');
      mockSupplierService.createSupplier.mockResolvedValue(nuevoProveedor);

      await useProveedorStore.getState().addProveedor({
        name: 'Proveedor A',
        email: '1@test.com',
        phone: '8095550000',
        address: 'Test Address',
        category: 'General',
        contactPerson: 'Contact',
        isActive: true,
      });

      expect(useProveedorStore.getState().proveedores).toHaveLength(1);
      expect(useProveedorStore.getState().proveedores[0]).toEqual(nuevoProveedor);
    });

    it('appends to existing proveedores', async () => {
      useProveedorStore.setState({
        proveedores: [createMockProveedor(1, 'Proveedor A')],
      });
      const nuevoProveedor = createMockProveedor(2, 'Proveedor B');
      mockSupplierService.createSupplier.mockResolvedValue(nuevoProveedor);

      await useProveedorStore.getState().addProveedor({
        name: 'Proveedor B',
        email: '2@test.com',
        phone: '8095550000',
        address: 'Test Address',
        category: 'General',
        contactPerson: 'Contact',
        isActive: true,
      });

      expect(useProveedorStore.getState().proveedores).toHaveLength(2);
    });
  });

  describe('updateProveedor', () => {
    it('updates existing proveedor', async () => {
      useProveedorStore.setState({
        proveedores: [
          createMockProveedor(1, 'Proveedor A'),
          createMockProveedor(2, 'Proveedor B'),
        ],
      });
      const updated = {
        ...createMockProveedor(1, 'Proveedor A'),
        name: 'Proveedor Actualizado',
        phone: '809-999-9999',
      };
      mockSupplierService.updateSupplier.mockResolvedValue(updated);

      await useProveedorStore
        .getState()
        .updateProveedor(1, { name: 'Proveedor Actualizado', phone: '809-999-9999' });

      expect(useProveedorStore.getState().proveedores[0].name).toBe('Proveedor Actualizado');
      expect(useProveedorStore.getState().proveedores[0].phone).toBe('809-999-9999');
    });

    it('does not modify other proveedores', async () => {
      useProveedorStore.setState({
        proveedores: [
          createMockProveedor(1, 'Proveedor A'),
          createMockProveedor(2, 'Proveedor B'),
        ],
      });
      const updated = { ...createMockProveedor(1, 'Proveedor A'), name: 'Updated' };
      mockSupplierService.updateSupplier.mockResolvedValue(updated);

      await useProveedorStore.getState().updateProveedor(1, { name: 'Updated' });

      expect(useProveedorStore.getState().proveedores[1].name).toBe('Proveedor B');
    });
  });

  describe('deleteProveedor', () => {
    it('removes proveedor from list', async () => {
      useProveedorStore.setState({
        proveedores: [
          createMockProveedor(1, 'Proveedor A'),
          createMockProveedor(2, 'Proveedor B'),
        ],
      });
      mockSupplierService.deleteSupplier.mockResolvedValue(undefined);

      await useProveedorStore.getState().deleteProveedor(1);

      expect(useProveedorStore.getState().proveedores).toHaveLength(1);
      expect(useProveedorStore.getState().proveedores[0].id).toBe(2);
    });

    it('handles non-existent id gracefully', async () => {
      useProveedorStore.setState({
        proveedores: [createMockProveedor(1, 'Proveedor A')],
      });
      mockSupplierService.deleteSupplier.mockRejectedValue(new Error('Not found'));

      await expect(
        useProveedorStore.getState().deleteProveedor(999),
      ).rejects.toThrow('Not found');

      expect(useProveedorStore.getState().proveedores).toHaveLength(1);
    });
  });
});
