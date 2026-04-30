import { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Table, Button, PageHeader } from '../../components/UI';
import styles from './Proyectos.module.css';

export function Proyectos() {
  const { proyectos, setProyectos } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'en_progreso' | 'completado' | 'pendiente'>('todos');
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

  const filteredProyectos = proyectos.filter(p => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || p.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

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
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Proyecto' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'estado', label: 'Estado', render: (p: typeof proyectos[0]) => getEstadoBadge(p.estado) },
    { key: 'presupuesto', label: 'Presupuesto', render: (p: typeof proyectos[0]) => formatCurrency(p.presupuesto) },
    { key: 'gastado', label: 'Gastado', render: (p: typeof proyectos[0]) => formatCurrency(p.gastado) },
    { key: 'progreso', label: 'Progreso', render: (p: typeof proyectos[0]) => (
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${p.progreso}%` }}></div>
        <span className={styles.progressText}>{p.progreso}%</span>
      </div>
    )},
    { key: 'fechaInicio', label: 'Inicio' },
    { key: 'fechaFin', label: 'Fin' },
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
        <input
          type="text"
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as typeof filterEstado)} className={styles.select}>
          <option value="todos">Todos</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completado">Completados</option>
          <option value="pendiente">Pendientes</option>
        </select>
      </div>

      <Table columns={columns} data={filteredProyectos} onEdit={handleEdit} onDelete={handleDelete} />

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