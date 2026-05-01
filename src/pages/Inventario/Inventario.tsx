import { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Table, Button, PageHeader, ImageCell, ActionButtons, Pagination, SearchInput } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import styles from './Inventario.module.css';

export function Inventario() {
  const { productos, setProductos } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    stock: 0,
    precio: 0,
    proveedor: '',
    imagen: '',
    descripcion: '',
  });

  const filteredProductos = useMemo(() => {
    return productos.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.proveedor.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStock === 'low') return matchesSearch && p.stock > 0 && p.stock < 10;
      if (filterStock === 'out') return matchesSearch && p.stock === 0;
      return matchesSearch;
    });
  }, [productos, searchTerm, filterStock]);

  const paginatedProductos = useMemo(() => {
    return paginate(filteredProductos, page, ITEMS_PER_PAGE);
  }, [filteredProductos, page]);

  const paginationInfo = getInfo(filteredProductos.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProductos(productos.map(p => p.id === editingId ? { ...p, ...formData } : p));
      setEditingId(null);
    } else {
      const newProducto = {
        ...formData,
        id: `P${String(productos.length + 1).padStart(3, '0')}`,
        imagen: formData.imagen || 'https://via.placeholder.com/200?text=Producto',
        descripcion: formData.descripcion || formData.nombre,
      };
      setProductos([...productos, newProducto]);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: '',
      stock: 0,
      precio: 0,
      proveedor: '',
      imagen: '',
      descripcion: '',
    });
  };

  const handleEdit = (producto: typeof productos[0]) => {
    setFormData(producto);
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'nombre', 
      header: 'Producto',
      render: (p: typeof productos[0]) => (
        <ImageCell 
          src={p.imagen} 
          name={p.nombre} 
          subtext={p.categoria}
          type="product"
        />
      )
    },
    { 
      key: 'stock', 
      header: 'Stock',
      render: (p: typeof productos[0]) => (
        <span className={p.stock === 0 ? styles.outOfStock : p.stock < 10 ? styles.lowStock : ''}>
          {p.stock}
        </span>
      )
    },
    { 
      key: 'precio', 
      header: 'Precio',
      render: (p: typeof productos[0]) => `$${p.precio.toLocaleString()}` 
    },
    { key: 'proveedor', header: 'Proveedor' },
    {
      key: 'actions',
      header: 'Acciones',
      render: (p: typeof productos[0]) => (
        <ActionButtons onEdit={() => handleEdit(p)} onDelete={() => handleDelete(p.id)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Inventario" subtitle="Control de productos y stock">
        <div className={styles.headerActions}>
          <SearchInput 
            value={searchTerm}
            onChange={(value) => { setSearchTerm(value); goToPage(1); }}
            placeholder="Buscar producto..."
            width="240px"
          />
          <select 
            className={styles.filter}
            value={filterStock}
            onChange={(e) => { setFilterStock(e.target.value as any); goToPage(1); }}
          >
            <option value="all">Todos</option>
            <option value="low">Stock bajo</option>
            <option value="out">Sin stock</option>
          </select>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            + Nuevo Producto
          </Button>
        </div>
      </PageHeader>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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
                <label>Categoría</label>
                <input 
                  type="text" 
                  value={formData.categoria}
                  onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  placeholder="ej. Computación, Accesorios"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Stock</label>
                <input 
                  type="number" 
                  min="0" 
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Precio</label>
                <input 
                  type="number" 
                  min="0" 
                  value={formData.precio}
                  onChange={(e) => setFormData({...formData, precio: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Proveedor</label>
                <input 
                  type="text" 
                  value={formData.proveedor}
                  onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                  required
                />
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

      <Table data={paginatedProductos} columns={columns} />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />
    </div>
  );
}