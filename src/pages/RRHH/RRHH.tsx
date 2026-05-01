import { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { Table, Button, PageHeader, ImageCell, Pagination, SearchInput, Modal } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import styles from './RRHH.module.css';

export function RRHH() {
  const { empleados, setEmpleados } = useERP();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
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

  const filteredEmpleados = useMemo(() => {
    return empleados.filter(e => {
      const matchesSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.departamento.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === 'todos' || e.estado === filterEstado;
      return matchesSearch && matchesEstado;
    });
  }, [empleados, searchTerm, filterEstado]);

  const paginatedEmpleados = useMemo(() => {
    return paginate(filteredEmpleados, page, ITEMS_PER_PAGE);
  }, [filteredEmpleados, page]);

  const paginationInfo = getInfo(filteredEmpleados.length);

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
    { key: 'avatar', header: '', render: (e: typeof empleados[0]) => <ImageCell src={e.avatar} name={e.nombre} /> },
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
        <SearchInput
          value={searchTerm}
          onChange={(value) => { setSearchTerm(value); goToPage(1); }}
          placeholder="Buscar empleados..."
          width="240px"
        />
        <select value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value as typeof filterEstado); goToPage(1); }} className={styles.select}>
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <Table columns={columns} data={paginatedEmpleados} onEdit={handleEdit} onDelete={handleDelete} />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
        onSubmit={handleSubmit}
        submitLabel={editingId ? 'Guardar' : 'Crear'}
      >
        <div className={styles.formGroup}>
          <label>Nombre</label>
          <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Cargo</label>
          <input type="text" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Departamento</label>
          <input type="text" value={formData.departamento} onChange={e => setFormData({...formData, departamento: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Teléfono</label>
          <input type="tel" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Fecha de Ingreso</label>
          <input type="date" value={formData.fechaIngreso} onChange={e => setFormData({...formData, fechaIngreso: e.target.value})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Salario</label>
          <input type="number" value={formData.salario} onChange={e => setFormData({...formData, salario: Number(e.target.value)})} required />
        </div>
        <div className={styles.formGroup}>
          <label>Estado</label>
          <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value as 'activo' | 'inactivo'})}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}