import { useState, useMemo } from 'react';
import { useERP } from '../../context';
import { useUIStore } from '../../stores/uiStore';
import { Table, Button, PageHeader, ImageCell, ActionButtons, Pagination, SearchInput, Modal } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import styles from './Compras.module.css';

export function Compras() {
  const { compras, setCompras, productos } = useERP();
  const { addToast } = useUIStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const [formData, setFormData] = useState({
    proveedor: '',
    producto: '',
    cantidad: 1,
    total: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente' as 'recibida' | 'pendiente' | 'cancelada',
  });

  const filteredCompras = useMemo(() => {
    return compras.filter(c =>
      c.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [compras, searchTerm]);

  const paginatedCompras = useMemo(() => {
    return paginate(filteredCompras, page, ITEMS_PER_PAGE);
  }, [filteredCompras, page]);

  const paginationInfo = getInfo(filteredCompras.length);

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
      <PageHeader title="Compras" subtitle="Gestión de compras y proveedores">
        <div className={styles.headerActions}>
          <SearchInput 
            value={searchTerm}
            onChange={(value) => { setSearchTerm(value); goToPage(1); }}
            placeholder="Buscar compras..."
            width="240px"
          />
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            + Nueva Compra
          </Button>
        </div>
      </PageHeader>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingId(null); }}
        title={editingId ? 'Editar Compra' : 'Nueva Compra'}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Actualizar' : 'Crear'}
      >
        <div className={styles.formGroup}>
          <label>Proveedor</label>
          <input 
            type="text" 
            value={formData.proveedor}
            onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Producto</label>
          <input 
            type="text" 
            value={formData.producto}
            onChange={(e) => setFormData({...formData, producto: e.target.value})}
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
      </Modal>

      <Table data={paginatedCompras} columns={columns} />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />
    </div>
  );
}