import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductoStore } from '../../stores/productoStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { Table, Button, PageHeader, ImageCell, ActionButtons, Pagination, SearchInput, Modal } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import type { Producto } from '../../data/mockData';
import styles from './Inventario.module.css';

export function Inventario() {
  const { t } = useTranslation();
  const { productos, loading, error, fetchProductos, createProducto, updateProducto, deleteProducto } = useProductoStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'low' | 'out'>('all');
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    categoriaId: null as number | null,
    stock: 0,
    precio: 0,
    imagen: '',
    descripcion: '',
    isActive: true,
  });

  useEffect(() => {
    fetchProductos();
    fetchCategories();
  }, []);

  const filteredProductos = useMemo(() => {
    return productos.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStock === 'low') return matchesSearch && p.stock > 0 && p.stock < 10;
      if (filterStock === 'out') return matchesSearch && p.stock === 0;
      return matchesSearch;
    });
  }, [productos, searchTerm, filterStock]);

  const paginatedProductos = useMemo(() => {
    return paginate(filteredProductos, page, ITEMS_PER_PAGE);
  }, [filteredProductos, page]);

  const paginationInfo = getInfo(filteredProductos.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProducto(editingId, formData);
        setEditingId(null);
      } else {
        await createProducto(formData);
      }
      setShowForm(false);
      resetForm();
    } catch {
      // Error is handled in store
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: '',
      categoriaId: null,
      stock: 0,
      precio: 0,
      imagen: '',
      descripcion: '',
      isActive: true,
    });
  };

  const handleEdit = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      categoria: producto.categoria,
      categoriaId: producto.categoriaId ?? null,
      stock: producto.stock,
      precio: producto.precio,
      imagen: producto.imagen,
      descripcion: producto.descripcion,
      isActive: producto.isActive ?? true,
    });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('inventario.deleteConfirm'))) {
      try {
        await deleteProducto(id);
      } catch {
        // Error is handled in store
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagen: reader.result as string });
      };
      reader.readAsDataURL(file);
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

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

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
          <select
            value={formData.categoriaId ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              const catId = val ? parseInt(val) : null;
              const cat = categories.find(c => c.id === catId);
              setFormData({
                ...formData,
                categoriaId: catId,
                categoria: cat?.name || '',
              });
            }}
            required
          >
            <option value="">-- {t('inventario.selectCategory')} --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>{t('inventario.stock')}</label>
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('common.price')}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.precio}
            onChange={(e) => setFormData({...formData, precio: parseFloat(e.target.value) || 0})}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>{t('common.image')}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {formData.imagen && (
            <img src={formData.imagen} alt="Preview" style={{ width: '100px', marginTop: '8px' }} />
          )}
        </div>
        <div className={styles.formGroup}>
          <label>{t('common.description')}</label>
          <input
            type="text"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          />
        </div>
        {editingId && (
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              {' '}{t('inventario.active')}
            </label>
          </div>
        )}
      </Modal>

      <Table data={paginatedProductos} columns={columns} />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />
    </div>
  );
}