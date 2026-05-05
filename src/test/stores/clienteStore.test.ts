import { useClienteStore } from '../../stores/clienteStore';
import type { Cliente } from '../../data/mockData';

const createMockCliente = (id: string, name: string): Cliente =>
  ({ id, nombre: name, email: `${id}@test.com`, telefono: '8095550000', direccion: 'Test Address', estado: 'activo' });

beforeEach(() => {
  useClienteStore.setState({ clientes: [], loading: false, error: null });
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

  describe('setClientes', () => {
    it('replaces clientes array with provided data', () => {
      const mockClientes = [createMockCliente('1', 'John'), createMockCliente('2', 'Jane')];
      useClienteStore.getState().setClientes(mockClientes);
      expect(useClienteStore.getState().clientes).toHaveLength(2);
    });

    it('can set empty array', () => {
      useClienteStore.setState({ clientes: [createMockCliente('1', 'John')] });
      useClienteStore.getState().setClientes([]);
      expect(useClienteStore.getState().clientes).toHaveLength(0);
    });
  });

  describe('addCliente', () => {
    it('adds a cliente to the array', () => {
      useClienteStore.getState().addCliente(createMockCliente('1', 'John'));
      expect(useClienteStore.getState().clientes).toHaveLength(1);
    });

    it('appends to existing clientes', () => {
      useClienteStore.setState({ clientes: [createMockCliente('1', 'John')] });
      useClienteStore.getState().addCliente(createMockCliente('2', 'Jane'));
      expect(useClienteStore.getState().clientes).toHaveLength(2);
    });

    it('preserves existing clientes when adding new one', () => {
      const existing = createMockCliente('1', 'John');
      useClienteStore.setState({ clientes: [existing] });
      useClienteStore.getState().addCliente(createMockCliente('2', 'Jane'));
      const clientes = useClienteStore.getState().clientes;
      expect(clientes[0].nombre).toBe('John');
      expect(clientes[1].nombre).toBe('Jane');
    });
  });

  describe('updateCliente', () => {
    it('updates a cliente by id', () => {
      useClienteStore.setState({ clientes: [createMockCliente('1', 'John')] });
      useClienteStore.getState().updateCliente('1', { nombre: 'John Updated' });
      expect(useClienteStore.getState().clientes[0].nombre).toBe('John Updated');
    });

    it('does not modify other clientes', () => {
      useClienteStore.setState({
        clientes: [createMockCliente('1', 'John'), createMockCliente('2', 'Jane')],
      });
      useClienteStore.getState().updateCliente('1', { nombre: 'John Updated' });
      expect(useClienteStore.getState().clientes[1].nombre).toBe('Jane');
    });

    it('does nothing when id does not exist', () => {
      useClienteStore.setState({ clientes: [createMockCliente('1', 'John')] });
      useClienteStore.getState().updateCliente('999', { nombre: 'Nonexistent' });
      expect(useClienteStore.getState().clientes[0].nombre).toBe('John');
    });

    it('can update multiple fields at once', () => {
      useClienteStore.setState({ clientes: [createMockCliente('1', 'John')] });
      useClienteStore.getState().updateCliente('1', { nombre: 'New Name', email: 'new@test.com' });
      const cliente = useClienteStore.getState().clientes[0];
      expect(cliente.nombre).toBe('New Name');
      expect(cliente.email).toBe('new@test.com');
    });
  });

  describe('deleteCliente', () => {
    it('removes a cliente by id', () => {
      useClienteStore.setState({ clientes: [createMockCliente('1', 'John')] });
      useClienteStore.getState().deleteCliente('1');
      expect(useClienteStore.getState().clientes).toHaveLength(0);
    });

    it('does not affect other clientes', () => {
      useClienteStore.setState({
        clientes: [createMockCliente('1', 'John'), createMockCliente('2', 'Jane')],
      });
      useClienteStore.getState().deleteCliente('1');
      expect(useClienteStore.getState().clientes).toHaveLength(1);
      expect(useClienteStore.getState().clientes[0].nombre).toBe('Jane');
    });

    it('does nothing when id does not exist', () => {
      useClienteStore.setState({ clientes: [createMockCliente('1', 'John')] });
      useClienteStore.getState().deleteCliente('999');
      expect(useClienteStore.getState().clientes).toHaveLength(1);
    });
  });
});