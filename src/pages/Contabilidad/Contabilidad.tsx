import { useState, useMemo } from 'react';
import { useTransaccionStore } from '../../stores/transaccionStore';
import { Table, Button, PageHeader, Pagination, SearchInput, Modal } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import type { TransaccionContable } from '../../data/mockData';
import styles from './Contabilidad.module.css';

const ITEMS_PER_PAGE = 10;

export function Contabilidad() {
  const { transacciones, addTransaccion, updateTransaccion, deleteTransaccion } = useTransaccionStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'ingreso' | 'egreso'>('todos');
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const [formData, setFormData] = useState({
    descripcion: '',
    tipo: 'ingreso' as 'ingreso' | 'egreso',
    monto: 0,
    fecha: '',
    categoria: '',
    estado: 'pendiente' as 'conciliada' | 'pendiente',
  });

  const filteredTransacciones = useMemo(() => {
    return transacciones.filter(t => {
      const matchesSearch = t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = filterTipo === 'todos' || t.tipo === filterTipo;
      return matchesSearch && matchesTipo;
    });
  }, [transacciones, searchTerm, filterTipo]);

  const paginatedTransacciones = useMemo(() => {
    return paginate(filteredTransacciones, page, ITEMS_PER_PAGE);
  }, [filteredTransacciones, page]);

  const paginationInfo = getInfo(filteredTransacciones.length);

  const totalIngresos = transacciones.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0);
  const totalEgresos = transacciones.filter(t => t.tipo === 'egreso').reduce((acc, t) => acc + t.monto, 0);
  const balance = totalIngresos - totalEgresos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTransaccion(editingId, formData);
      setEditingId(null);
    } else {
      const newTransaccion: TransaccionContable = {
        ...formData,
        id: `CNT${String(transacciones.length + 1).padStart(3, '0')}`,
      };
      addTransaccion(newTransaccion);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ descripcion: '', tipo: 'ingreso', monto: 0, fecha: '', categoria: '', estado: 'pendiente' });
  };

  const handleEdit = (t: TransaccionContable) => {
    setFormData({ descripcion: t.descripcion, tipo: t.tipo, monto: t.monto, fecha: t.fecha, categoria: t.categoria, estado: t.estado });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar transacción?')) {
      deleteTransaccion(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 0 }).format(amount);
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'tipo', header: 'Tipo', render: (t: TransaccionContable) => (
      <span className={`${styles.badge} ${t.tipo === 'ingreso' ? styles.ingreso : styles.egreso}`}>
        {t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
      </span>
    )},
    { key: 'monto', header: 'Monto', render: (t: TransaccionContable) => (
      <span className={t.tipo === 'ingreso' ? styles.positivo : styles.negativo}>
        {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto)}
      </span>
    )},
    { key: 'categoria', header: 'Categoría' },
    { key: 'fecha', header: 'Fecha' },
    { key: 'estado', header: 'Estado', render: (t: TransaccionContable) => (
      <span className={`${styles.badge} ${t.estado === 'conciliada' ? styles.conciliada : styles.pendiente}`}>
        {t.estado === 'conciliada' ? 'Conciliada' : 'Pendiente'}
      </span>
    )},
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="Contabilidad" subtitle="Gestión financiera y contable">
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}>
          + Nueva Transacción
        </Button>
      </PageHeader>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Ingresos</span>
          <span className={`${styles.cardValue} ${styles.positivo}`}>{formatCurrency(totalIngresos)}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Egresos</span>
          <span className={`${styles.cardValue} ${styles.negativo}`}>{formatCurrency(totalEgresos)}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Balance</span>
          <span className={`${styles.cardValue} ${balance >= 0 ? styles.positivo : styles.negativo}`}>
            {formatCurrency(balance)}
          </span>
        </div>
      </div>

      <div className={styles.filters}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => { setSearchTerm(value); goToPage(1); }}
          placeholder="Buscar transacciones..."
          width="240px"
        />
        <select value={filterTipo} onChange={(e) => { setFilterTipo(e.target.value as typeof filterTipo); goToPage(1); }} className={styles.select}>
          <option value="todos">Todos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
        </select>
      </div>

      <Table columns={columns} data={paginatedTransacciones} onEdit={handleEdit} onDelete={handleDelete} />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Editar Transacción' : 'Nueva Transacción'}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Guardar' : 'Crear'}
      >
        <div className="formGroup">
          <label>Descripción</label>
          <input type="text" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required />
        </div>
        <div className="formGroup">
          <label>Tipo</label>
          <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value as 'ingreso' | 'egreso'})}>
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </select>
        </div>
        <div className="formGroup">
          <label>Monto</label>
          <input type="number" value={formData.monto} onChange={e => setFormData({...formData, monto: Number(e.target.value)})} required />
        </div>
        <div className="formGroup">
          <label>Fecha</label>
          <input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
        </div>
        <div className="formGroup">
          <label>Categoría</label>
          <input type="text" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} required />
        </div>
        <div className="formGroup">
          <label>Estado</label>
          <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value as 'conciliada' | 'pendiente'})}>
            <option value="pendiente">Pendiente</option>
            <option value="conciliada">Conciliada</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}