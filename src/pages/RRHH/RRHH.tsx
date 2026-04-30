import { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Table, Button, PageHeader, ImageCell } from '../../components/UI';
import styles from './RRHH.module.css';

export function RRHH() {
  const { empleados, setEmpleados } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [formData, setFormData] = useState({
    nombre: '',
    cargo: '',
    departamento: '',
    email: '',
    telefono: '',
    fechaIngreso: '',
    salario: 0,
    estado: 'activo' as 'activo' | 'inactivo',
  });

  const filteredEmpleados = empleados.filter(e => {
    const matchesSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || e.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const totalSalarios = empleados.filter(e => e.estado === 'activo').reduce((acc, e) => acc + e.salario, 0);
  const activos = empleados.filter(e => e.estado === 'activo').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 0 }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEmpleados(empleados.map(e => e.id === editingId ? { ...e, ...formData } : e));
      setEditingId(null);
    } else {
      const newEmpleado = {
        ...formData,
        id: `EMP${String(empleados.length + 1).padStart(3, '0')}`,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      };
      setEmpleados([...empleados, newEmpleado]);
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ nombre: '', cargo: '', departamento: '', email: '', telefono: '', fechaIngreso: '', salario: 0, estado: 'activo' });
  };

  const handleEdit = (empleado: typeof empleados[0]) => {
    setFormData({
      nombre: empleado.nombre,
      cargo: empleado.cargo,
      departamento: empleado.departamento,
      email: empleado.email,
      telefono: empleado.telefono,
      fechaIngreso: empleado.fechaIngreso,
      salario: empleado.salario,
      estado: empleado.estado,
    });
    setEditingId(empleado.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar empleado?')) {
      setEmpleados(empleados.filter(e => e.id !== id));
    }
  };

  const columns = [
    { key: 'avatar', header: '', render: (e: typeof empleados[0]) => <ImageCell src={e.avatar} alt={e.nombre} /> },
    { key: 'nombre', header: 'Nombre' },
    { key: 'cargo', header: 'Cargo' },
    { key: 'departamento', header: 'Departamento' },
    { key: 'email', header: 'Email' },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'fechaIngreso', header: 'Ingreso' },
    { key: 'salario', header: 'Salario', render: (e: typeof empleados[0]) => formatCurrency(e.salario) },
    { key: 'estado', header: 'Estado', render: (e: typeof empleados[0]) => (
      <span className={`${styles.badge} ${e.estado === 'activo' ? styles.activo : styles.inactivo}`}>
        {e.estado === 'activo' ? 'Activo' : 'Inactivo'}
      </span>
    )},
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="Recursos Humanos" subtitle="Gestión de empleados">
        <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}>
          + Nuevo Empleado
        </Button>
      </PageHeader>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total Empleados</span>
          <span className={styles.cardValue}>{empleados.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Activos</span>
          <span className={`${styles.cardValue} ${styles.activo}`}>{activos}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Nómina Mensual</span>
          <span className={styles.cardValue}>{formatCurrency(totalSalarios)}</span>
        </div>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar empleados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as typeof filterEstado)} className={styles.select}>
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <Table columns={columns} data={filteredEmpleados} onEdit={handleEdit} onDelete={handleDelete} />

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingId ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Nombre" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
              <input type="text" placeholder="Cargo" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} required />
              <input type="text" placeholder="Departamento" value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} required />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <input type="tel" placeholder="Teléfono" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} required />
              <input type="date" placeholder="Fecha de Ingreso" value={formData.fechaIngreso} onChange={e => setFormData({...formData, fechaIngreso: e.target.value})} required />
              <input type="number" placeholder="Salario" value={formData.salario} onChange={e => setFormData({...formData, salario: Number(e.target.value)})} required />
              <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value as 'activo' | 'inactivo'})}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
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