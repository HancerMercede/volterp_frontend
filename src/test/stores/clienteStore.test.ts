import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useClienteStore } from '../../stores/clienteStore';
import type { ClientDto } from '../../domain/types';

vi.mock('../../infrastructure/api/clientService', () => ({
  clientService: {
    getClients: vi.fn(),
    getClientById: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
  },
}));

import { clientService } from '../../infrastructure/api/clientService';

const mockClientService = clientService as unknown as {
  getClients: ReturnType<typeof vi.fn>;
  getClientById: ReturnType<typeof vi.fn>;
  createClient: ReturnType<typeof vi.fn>;
  updateClient: ReturnType<typeof vi.fn>;
  deleteClient: ReturnType<typeof vi.fn>;
};

const createMockCliente = (id: number, name: string): ClientDto => ({
  id,
  name,
  email: `${id}@test.com`,
  phone: '8095550000',
  address: 'Test Address',
  isActive: true,
  imageUrl: null,
  createdAt: null,
  updatedAt: null,
});

beforeEach(() => {
  useClienteStore.setState({
    clientes: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  vi.clearAllMocks();
});

describe('clienteStore', () => {
  describe('initial state', () => {
    it('starts with empty clientes array', () => {
      expect(useClienteStore.getState().clientes).toEqual([]);
    });

    it('starts with loading false', () => {
      expect(useClienteStore.getState().loading).toBe(false);
    });

    it('starts with no error', () => {
      expect(useClienteStore.getState().error).toBeNull();
    });
  });

  describe('setClientes via setState', () => {
    it('replaces clientes array with provided data', () => {
      const mockClientes = [
        createMockCliente(1, 'John'),
        createMockCliente(2, 'Jane'),
      ];
      useClienteStore.setState({ clientes: mockClientes });
      expect(useClienteStore.getState().clientes).toHaveLength(2);
    });

    it('can set empty array', () => {
      useClienteStore.setState({ clientes: [createMockCliente(1, 'John')] });
      useClienteStore.setState({ clientes: [] });
      expect(useClienteStore.getState().clientes).toHaveLength(0);
    });
  });

  describe('addCliente', () => {
    it('adds a cliente to the array', async () => {
      const newCliente = createMockCliente(1, 'John');
      mockClientService.createClient.mockResolvedValue(newCliente);

      await useClienteStore.getState().addCliente({ name: 'John' });

      expect(useClienteStore.getState().clientes).toHaveLength(1);
    });

    it('appends to existing clientes', async () => {
      useClienteStore.setState({ clientes: [createMockCliente(1, 'John')] });
      const newCliente = createMockCliente(2, 'Jane');
      mockClientService.createClient.mockResolvedValue(newCliente);

      await useClienteStore.getState().addCliente({ name: 'Jane' });

      expect(useClienteStore.getState().clientes).toHaveLength(2);
    });

    it('preserves existing clientes when adding new one', async () => {
      const existing = createMockCliente(1, 'John');
      useClienteStore.setState({ clientes: [existing] });
      const newCliente = createMockCliente(2, 'Jane');
      mockClientService.createClient.mockResolvedValue(newCliente);

      await useClienteStore.getState().addCliente({ name: 'Jane' });

      const clientes = useClienteStore.getState().clientes;
      expect(clientes[0].name).toBe('John');
      expect(clientes[1].name).toBe('Jane');
    });
  });

  describe('updateCliente', () => {
    it('updates a cliente by id', async () => {
      useClienteStore.setState({ clientes: [createMockCliente(1, 'John')] });
      const updated = { ...createMockCliente(1, 'John'), name: 'John Updated' };
      mockClientService.updateClient.mockResolvedValue(updated);

      await useClienteStore.getState().updateCliente(1, { name: 'John Updated' });

      expect(useClienteStore.getState().clientes[0].name).toBe('John Updated');
    });

    it('does not modify other clientes', async () => {
      useClienteStore.setState({
        clientes: [createMockCliente(1, 'John'), createMockCliente(2, 'Jane')],
      });
      const updated = { ...createMockCliente(1, 'John'), name: 'John Updated' };
      mockClientService.updateClient.mockResolvedValue(updated);

      await useClienteStore.getState().updateCliente(1, { name: 'John Updated' });

      expect(useClienteStore.getState().clientes[1].name).toBe('Jane');
    });

    it('does nothing when id does not exist', async () => {
      useClienteStore.setState({ clientes: [createMockCliente(1, 'John')] });
      mockClientService.updateClient.mockRejectedValue(new Error('Not found'));

      await expect(
        useClienteStore.getState().updateCliente(999, { name: 'Nonexistent' }),
      ).rejects.toThrow('Not found');

      expect(useClienteStore.getState().clientes[0].name).toBe('John');
    });

    it('can update multiple fields at once', async () => {
      useClienteStore.setState({ clientes: [createMockCliente(1, 'John')] });
      const updated = {
        ...createMockCliente(1, 'John'),
        name: 'New Name',
        email: 'new@test.com',
      };
      mockClientService.updateClient.mockResolvedValue(updated);

      await useClienteStore
        .getState()
        .updateCliente(1, { name: 'New Name', email: 'new@test.com' });

      const cliente = useClienteStore.getState().clientes[0];
      expect(cliente.name).toBe('New Name');
      expect(cliente.email).toBe('new@test.com');
    });
  });

  describe('deleteCliente', () => {
    it('removes a cliente by id', async () => {
      useClienteStore.setState({ clientes: [createMockCliente(1, 'John')] });
      mockClientService.deleteClient.mockResolvedValue(undefined);

      await useClienteStore.getState().deleteCliente(1);

      expect(useClienteStore.getState().clientes).toHaveLength(0);
    });

    it('does not affect other clientes', async () => {
      useClienteStore.setState({
        clientes: [createMockCliente(1, 'John'), createMockCliente(2, 'Jane')],
      });
      mockClientService.deleteClient.mockResolvedValue(undefined);

      await useClienteStore.getState().deleteCliente(1);

      expect(useClienteStore.getState().clientes).toHaveLength(1);
      expect(useClienteStore.getState().clientes[0].name).toBe('Jane');
    });

    it('does nothing when id does not exist', async () => {
      useClienteStore.setState({ clientes: [createMockCliente(1, 'John')] });
      mockClientService.deleteClient.mockRejectedValue(new Error('Not found'));

      await expect(
        useClienteStore.getState().deleteCliente(999),
      ).rejects.toThrow('Not found');

      expect(useClienteStore.getState().clientes).toHaveLength(1);
    });
  });
});
