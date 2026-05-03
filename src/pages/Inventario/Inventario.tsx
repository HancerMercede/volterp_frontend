import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductoStore } from '../../stores/productoStore';
import { Table, Button, PageHeader, ImageCell, ActionButtons, Pagination, SearchInput, Modal } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import type { Producto } from '../../data/mockData';
import styles from './Inventario.module.css';

export function Inventario() {
  const { t } = useTranslation();
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
    if (confirm(t('inventario.deleteConfirm'))) {
      deleteProducto(id);
    }
  };

  const columns = [
    { key: 'id', header: t('common.id') },
    {
      key: 'nombre',
      header: t('common.product'),
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
      header: t('inventario.stock'),
      render: (p: Producto) => (
        <span className={p.stock === 0 ? styles.outOfStock : p.stock < 10 ? styles.lowStock : ''}>
          {p.stock}
        </span>
      )
    },
    {
      key: 'precio',
      header: t('common.price'),
      render: (p: Producto) => `$${p.precio.toLocaleString()}`
    },
    { key: 'proveedor', header: t('common.supplier') },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (p: Producto) => (
        <ActionButtons onEdit={() => handleEdit(p)} onDelete={() => handleDelete(p.id)} />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t('inventario.title')} subtitle={t('inventario.subtitle')}>
        <div className={styles.headerActions}>
          <SearchInput
            value={searchTerm}
            onChange={(value) => { setSearchTerm(value); goToPage(1); }}
            placeholder={t('inventario.searchPlaceholder')}
            width="240px"
          />
          <select
            className={styles.filter}
            value={filterStock}
            onChange={(e) => { setFilterStock(e.target.value as any); goToPage(1); }}
          >
            <option value="all">{t('inventario.all')}</option>
            <option value="low">{t('inventario.lowStock')}</option>
            <option value="out">{t('inventario.outOfStock')}</option>
          </select>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            + {t('inventario.newProduct')}
          </Button>
        </div>
      </PageHeader>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingId(null); }}
        title={editingId ? t('inventario.editProduct') : t('inventario.newProduct')}
        onSubmit={handleSubmit}
        submitLabel={editingId ? t('common.update') : t('common.create')}
      >
        <div className={styles.formGroup}>
          <label>{t('common.name')}</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('common.category')}</label>
          <input
            type="text"
            value={formData.categoria}
            onChange={(e) => setFormData({...formData, categoria: e.target.value})}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('inventario.stock')}</label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('common.price')}</label>
          <input
            type="number"
            min="0"
            value={formData.precio}
            onChange={(e) => setFormData({...formData, precio: parseInt(e.target.value)})}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('common.supplier')}</label>
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