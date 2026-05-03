import { useState, useMemo } from 'react';
import { useProductoStore } from '../../stores/productoStore';
import { Table, Button, PageHeader, ImageCell, ActionButtons, Pagination, SearchInput, Modal } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import type { Producto } from '../../data/mockData';
import styles from './Inventario.module.css';

export function Inventario() {
  const { productos, addProducto, updateProducto, deleteProducto } = useProductoStore();
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
      updateProducto(editingId, formData);
      setEditingId(null);
    } else {
      const newProducto: Producto = {
        ...formData,
        id: `P${String(productos.length + 1).padStart(3, '0')}`,
        imagen: formData.imagen || 'https://via.placeholder.com/200?text=Producto',
        descripcion: formData.descripcion || formData.nombre,
      };
      addProducto(newProducto);
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

  const handleEdit = (producto: Producto) => {
    setFormData(producto);
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      deleteProducto(id);
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    {
      key: 'nombre',
      header: 'Producto',
      render: (p: Producto) => (
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
      render: (p: Producto) => (
        <span className={p.stock === 0 ? styles.outOfStock : p.stock < 10 ? styles.lowStock : ''}>
          {p.stock}
        </span>
      )
    },
    {
      key: 'precio',
      header: 'Precio',
      render: (p: Producto) => `$${p.precio.toLocaleString()}`
    },
    { key: 'proveedor', header: 'Proveedor' },
    {
      key: 'actions',
      header: 'Acciones',
      render: (p: Producto) => (
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

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingId(null); }}
        title={editingId ? 'Editar Producto' : 'Nuevo Producto'}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Actualizar' : 'Crear'}
      >
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
      </Modal>

      <Table data={paginatedProductos} columns={columns} />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />
    </div>
  );
}