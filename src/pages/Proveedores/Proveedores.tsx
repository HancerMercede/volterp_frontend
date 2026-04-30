import { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Table, Button, PageHeader, ImageCell } from '../../components/UI';
import styles from './Proveedores.module.css';

export function Proveedores() {
  const { proveedores, setProveedores } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    categoria: '',
    totalOrdenes: 0,
  });

  const filteredProveedores = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProveedores(proveedores.map(p => p.id === editingId ? { ...p, ...formData } : p));
      setEditingId(null);
    } else {
      const newProveedor = {
        ...formData,
        id: `PRV${String(proveedores.length + 1).padStart(3, '0')}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };
      setProveedores([...proveedores, newProveedor]);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ nombre: '', email: '', telefono: '', direccion: '', categoria: '', totalOrdenes: 0 });
  };

  const handleEdit = (proveedor: typeof proveedores[0]) => {
    setFormData({
      nombre: proveedor.nombre,
      email: proveedor.email,
      telefono: proveedor.telefono,
      direccion: proveedor.direccion,
      categoria: proveedor.categoria,
      totalOrdenes: proveedor.totalOrdenes,
    });
    setEditingId(proveedor.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar proveedor?')) {
      setProveedores(proveedores.filter(p => p.id !== id));
    }
  };

  const columns = [
    { key: 'avatar', label: '', render: (p: typeof proveedores[0]) => <ImageCell src={p.avatar} alt={p.nombre} /> },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'totalOrdenes', label: 'Órdenes', render: (p: typeof proveedores[0]) => p.totalOrdenes.toString() },
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="Proveedores" subtitle="Gestiona tus proveedores">
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}>
          + Nuevo Proveedor
        </Button>
      </PageHeader>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Buscar proveedores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <Table
        columns={columns}
        data={filteredProveedores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <input type="tel" placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} required />
              <input type="text" placeholder="Dirección" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} required />
              <input type="text" placeholder="Categoría" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} required />
              <input type="number" placeholder="Total Órdenes" value={formData.totalOrdenes} onChange={e => setFormData({...formData, totalOrdenes: Number(e.target.value)})} />
              <div className={styles.modalActions}>
                <Button type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit">{editingId ? 'Guardar' : 'Crear'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}