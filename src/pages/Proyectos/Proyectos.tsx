import { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Table, Button, PageHeader, Pagination, SearchInput } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import styles from './Proyectos.module.css';

const ITEMS_PER_PAGE = 10;

export function Proyectos() {
  const { proyectos, setProyectos } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'en_progreso' | 'completado' | 'pendiente'>('todos');
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  const [formData, setFormData] = useState({
    nombre: '',
    cliente: '',
    estado: 'pendiente' as 'en_progreso' | 'completado' | 'pendiente',
    presupuesto: 0,
    gastado: 0,
    fechaInicio: '',
    fechaFin: '',
    progreso: 0,
  });

  const filteredProyectos = useMemo(() => {
    return proyectos.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === 'todos' || p.estado === filterEstado;
      return matchesSearch && matchesEstado;
    });
  }, [proyectos, searchTerm, filterEstado]);

  const paginatedProyectos = useMemo(() => {
    return paginate(filteredProyectos, page, ITEMS_PER_PAGE);
  }, [filteredProyectos, page]);

  const paginationInfo = getInfo(filteredProyectos.length);

  const totalPresupuesto = proyectos.reduce((acc, p) => acc + p.presupuesto, 0);
  const enProgreso = proyectos.filter(p => p.estado === 'en_progreso').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProyectos(proyectos.map(p => p.id === editingId ? { ...p, ...formData } : p));
      setEditingId(null);
    } else {
      const newProyecto = {
        ...formData,
        id: `PRY${String(proyectos.length + 1).padStart(3, '0')}`,
      };
      setProyectos([...proyectos, newProyecto]);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ nombre: '', cliente: '', estado: 'pendiente', presupuesto: 0, gastado: 0, fechaInicio: '', fechaFin: '', progreso: 0 });
  };

  const handleEdit = (proyecto: typeof proyectos[0]) => {
    setFormData({
      nombre: proyecto.nombre,
      cliente: proyecto.cliente,
      estado: proyecto.estado,
      presupuesto: proyecto.presupuesto,
      gastado: proyecto.gastado,
      fechaInicio: proyecto.fechaInicio,
      fechaFin: proyecto.fechaFin,
      progreso: proyecto.progreso,
    });
    setEditingId(proyecto.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar proyecto?')) {
      setProyectos(proyectos.filter(p => p.id !== id));
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'en_progreso':
        return <span className={`${styles.badge} ${styles.enProgreso}`}>En Progreso</span>;
      case 'completado':
        return <span className={`${styles.badge} ${styles.completado}`}>Completado</span>;
      default:
        return <span className={`${styles.badge} ${styles.pendiente}`}>Pendiente</span>;
    }
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'nombre', header: 'Proyecto' },
    { key: 'cliente', header: 'Cliente' },
    { key: 'estado', header: 'Estado', render: (p: typeof proyectos[0]) => getEstadoBadge(p.estado) },
    { key: 'presupuesto', header: 'Presupuesto', render: (p: typeof proyectos[0]) => formatCurrency(p.presupuesto) },
    { key: 'gastado', header: 'Gastado', render: (p: typeof proyectos[0]) => formatCurrency(p.gastado) },
    { key: 'progreso', header: 'Progreso', render: (p: typeof proyectos[0]) => (
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${p.progreso}%` }}></div>
        <span className={styles.progressText}>{p.progreso}%</span>
      </div>
    )},
    { key: 'fechaInicio', header: 'Inicio' },
    { key: 'fechaFin', header: 'Fin' },
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="Proyectos" subtitle="Gestión de proyectos">
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}>
          + Nuevo Proyecto
        </Button>
      </PageHeader>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total Proyectos</span>
          <span className={styles.cardValue}>{proyectos.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>En Progreso</span>
          <span className={`${styles.cardValue} ${styles.enProgreso}`}>{enProgreso}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Presupuesto Total</span>
          <span className={styles.cardValue}>{formatCurrency(totalPresupuesto)}</span>
        </div>
      </div>

      <div className={styles.filters}>
        <SearchInput
          value={searchTerm}
          onChange={(value) => { setSearchTerm(value); goToPage(1); }}
          placeholder="Buscar proyectos..."
          width="240px"
        />
        <select value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value as typeof filterEstado); goToPage(1); }} className={styles.select}>
          <option value="todos">Todos</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completado">Completados</option>
          <option value="pendiente">Pendientes</option>
        </select>
      </div>

      <Table columns={columns} data={paginatedProyectos} onEdit={handleEdit} onDelete={handleDelete} />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Nombre del Proyecto" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              <input type="text" placeholder="Cliente" value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} required />
              <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value as 'en_progreso' | 'completado' | 'pendiente'})}>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
              </select>
              <input type="number" placeholder="Presupuesto" value={formData.presupuesto} onChange={e => setFormData({...formData, presupuesto: Number(e.target.value)})} required />
              <input type="number" placeholder="Gastado" value={formData.gastado} onChange={e => setFormData({...formData, gastado: Number(e.target.value)})} required />
              <input type="number" placeholder="Progreso (%)" value={formData.progreso} onChange={e => setFormData({...formData, progreso: Number(e.target.value)})} required />
              <input type="date" placeholder="Fecha Inicio" value={formData.fechaInicio} onChange={e => setFormData({...formData, fechaInicio: e.target.value})} required />
              <input type="date" placeholder="Fecha Fin" value={formData.fechaFin} onChange={e => setFormData({...formData, fechaFin: e.target.value})} required />
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