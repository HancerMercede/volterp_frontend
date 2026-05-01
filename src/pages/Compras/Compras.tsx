import { useState } from 'react';
import { useERP, useUI } from '../../context';
import { Table, Button, PageHeader, ImageCell, ActionButtons } from '../../components/UI';
import styles from './Compras.module.css';

export function Compras() {
  const { compras, setCompras, productos } = useERP();
  const { addToast } = useUI();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    proveedor: '',
    producto: '',
    cantidad: 1,
    total: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente' as 'recibida' | 'pendiente' | 'cancelada',
  });

  const filteredCompras = compras.filter(c =>
    c.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setCompras(compras.map(c => c.id === editingId ? { ...c, ...formData } : c));
      setEditingId(null);
      addToast('Compra actualizada correctamente', 'success');
    } else {
      const newCompra = {
        ...formData,
        id: `C${String(compras.length + 1).padStart(3, '0')}`,
      };
      setCompras([...compras, newCompra]);
      addToast('Compra creada correctamente', 'success');
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      proveedor: '',
      producto: '',
      cantidad: 1,
      total: 0,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
    });
  };

  const handleEdit = (compra: typeof compras[0]) => {
    setFormData(compra);
    setEditingId(compra.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta compra?')) {
      setCompras(compras.filter(c => c.id !== id));
      addToast('Compra eliminada', 'error');
    }
  };

  const getProductoByName = (nombre: string) => productos.find(p => p.nombre === nombre);

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'proveedor', header: 'Proveedor' },
    { 
      key: 'producto', 
      header: 'Producto',
      render: (c: typeof compras[0]) => {
        const producto = getProductoByName(c.producto);
        return producto ? (
          <ImageCell 
            src={producto.imagen} 
            name={c.producto}
            subtext={`x${c.cantidad}`}
            type="product"
          />
        ) : c.producto;
      }
    },
    { 
      key: 'total', 
      header: 'Total',
      render: (c: typeof compras[0]) => `$${c.total.toLocaleString()}` 
    },
    { key: 'fecha', header: 'Fecha' },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (c: typeof compras[0]) => (
        <span className={`${styles.badge} ${styles[c.estado]}`}>
          {c.estado}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (c: typeof compras[0]) => (
        <ActionButtons onEdit={() => handleEdit(c)} onDelete={() => handleDelete(c.id)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Compras">
        <div className={styles.headerActions}>
          <input 
            type="text" 
            placeholder="Buscar compras..." 
            className={styles.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            + Nueva Compra
          </Button>
        </div>
      </PageHeader>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingId ? 'Editar Compra' : 'Nueva Compra'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Proveedor</label>
                <input 
                  type="text" 
                  value={formData.proveedor}
                  onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                  placeholder="Nombre del proveedor"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Producto</label>
                <input 
                  type="text" 
                  value={formData.producto}
                  onChange={(e) => setFormData({...formData, producto: e.target.value})}
                  placeholder="Nombre del producto"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Cantidad</label>
                <input 
                  type="number" 
                  min="1" 
                  value={formData.cantidad}
                  onChange={(e) => setFormData({...formData, cantidad: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Total</label>
                <input 
                  type="number" 
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Fecha</label>
                <input 
                  type="date" 
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Estado</label>
                <select 
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="recibida">Recibida</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
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

      <Table data={filteredCompras} columns={columns} />
    </div>
  );
}