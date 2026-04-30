import { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Table, Button, PageHeader } from '../../components/UI';
import styles from './Contabilidad.module.css';

export function Contabilidad() {
  const { transaccionesContables, setTransaccionesContables } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'ingreso' | 'egreso'>('todos');
  const [formData, setFormData] = useState({
    descripcion: '',
    tipo: 'ingreso' as 'ingreso' | 'egreso',
    monto: 0,
    fecha: '',
    categoria: '',
    estado: 'pendiente' as 'conciliada' | 'pendiente',
  });

  const filteredTransacciones = transaccionesContables.filter(t => {
    const matchesSearch = t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = filterTipo === 'todos' || t.tipo === filterTipo;
    return matchesSearch && matchesTipo;
  });

  const totalIngresos = transaccionesContables.filter(t => t.tipo === 'ingreso').reduce((acc, t) => acc + t.monto, 0);
  const totalEgresos = transaccionesContables.filter(t => t.tipo === 'egreso').reduce((acc, t) => acc + t.monto, 0);
  const balance = totalIngresos - totalEgresos;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setTransaccionesContables(transaccionesContables.map(t => t.id === editingId ? { ...t, ...formData } : t));
      setEditingId(null);
    } else {
      const newTransaccion = {
        ...formData,
        id: `CNT${String(transaccionesContables.length + 1).padStart(3, '0')}`,
      };
      setTransaccionesContables([...transaccionesContables, newTransaccion]);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ descripcion: '', tipo: 'ingreso', monto: 0, fecha: '', categoria: '', estado: 'pendiente' });
  };

  const handleEdit = (t: typeof transaccionesContables[0]) => {
    setFormData({ descripcion: t.descripcion, tipo: t.tipo, monto: t.monto, fecha: t.fecha, categoria: t.categoria, estado: t.estado });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar transacción?')) {
      setTransaccionesContables(transaccionesContables.filter(t => t.id !== id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 0 }).format(amount);
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'tipo', header: 'Tipo', render: (t: typeof transaccionesContables[0]) => (
      <span className={`${styles.badge} ${t.tipo === 'ingreso' ? styles.ingreso : styles.egreso}`}>
        {t.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
      </span>
    )},
    { key: 'monto', header: 'Monto', render: (t: typeof transaccionesContables[0]) => (
      <span className={t.tipo === 'ingreso' ? styles.positivo : styles.negativo}>
        {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto)}
      </span>
    )},
    { key: 'categoria', header: 'Categoría' },
    { key: 'fecha', header: 'Fecha' },
    { key: 'estado', header: 'Estado', render: (t: typeof transaccionesContables[0]) => (
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
        <input
          type="text"
          placeholder="Buscar transacciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as typeof filterTipo)} className={styles.select}>
          <option value="todos">Todos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
        </select>
      </div>

      <Table columns={columns} data={filteredTransacciones} onEdit={handleEdit} onDelete={handleDelete} />

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingId ? 'Editar Transacción' : 'Nueva Transacción'}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Descripción" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} required />
              <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value as 'ingreso' | 'egreso'})}>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
              <input type="number" placeholder="Monto" value={formData.monto} onChange={e => setFormData({...formData, monto: Number(e.target.value)})} required />
              <input type="date" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
              <input type="text" placeholder="Categoría" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} required />
              <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value as 'conciliada' | 'pendiente'})}>
                <option value="pendiente">Pendiente</option>
                <option value="conciliada">Conciliada</option>
              </select>
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