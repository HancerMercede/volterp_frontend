import { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Table, Button, PageHeader, ImageCell, ActionButtons, Pagination, SearchInput } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import styles from './Clientes.module.css';

export function Clientes() {
  const { clientes, setClientes } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    totalCompras: 0,
    empresa: '',
  });

  const filteredClientes = useMemo(() => {
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.includes(searchTerm)
    );
  }, [clientes, searchTerm]);

  const paginatedClientes = useMemo(() => {
    return paginate(filteredClientes, page, ITEMS_PER_PAGE);
  }, [filteredClientes, page]);

  const paginationInfo = getInfo(filteredClientes.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setClientes(clientes.map(c => c.id === editingId ? { ...c, ...formData } : c));
      setEditingId(null);
    } else {
      const newCliente = {
        ...formData,
        id: `CL${String(clientes.length + 1).padStart(3, '0')}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };
      setClientes([...clientes, newCliente]);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      totalCompras: 0,
      empresa: '',
    });
  };

  const handleEdit = (cliente: typeof clientes[0]) => {
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion,
      totalCompras: cliente.totalCompras,
      empresa: cliente.empresa || '',
    });
    setEditingId(cliente.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'nombre', 
      header: 'Cliente',
      render: (c: typeof clientes[0]) => (
        <ImageCell 
          src={c.avatar} 
          name={c.nombre} 
          subtext={c.empresa}
          type="avatar"
        />
      )
    },
    { key: 'email', header: 'Email' },
    { key: 'telefono', header: 'Teléfono' },
    { 
      key: 'totalCompras', 
      header: 'Total Compras',
      render: (c: typeof clientes[0]) => `$${c.totalCompras.toLocaleString()}` 
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (c: typeof clientes[0]) => (
        <ActionButtons onEdit={() => handleEdit(c)} onDelete={() => handleDelete(c.id)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Clientes" subtitle="Gestión de clientes y contactos">
        <div className={styles.headerActions}>
          <SearchInput 
            value={searchTerm}
            onChange={(value) => { setSearchTerm(value); goToPage(1); }}
            placeholder="Buscar cliente..."
            width="240px"
          />
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            + Nuevo Cliente
          </Button>
        </div>
      </PageHeader>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Nombre</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Teléfono</label>
                <input 
                  type="tel" 
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="809-XXX-XXXX"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Dirección</label>
                <input 
                  type="text" 
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                />
              </div>
              {!editingId && (
                <div className={styles.formGroup}>
                  <label>Total Compras</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={formData.totalCompras}
                    onChange={(e) => setFormData({...formData, totalCompras: parseInt(e.target.value)})}
                  />
                </div>
              )}
              <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingId ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Table data={paginatedClientes} columns={columns} />
      
      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />
    </div>
  );
}