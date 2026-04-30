import { useState } from 'react';
import { useERP, useUI } from '../../context';
import { Table, Button, PageHeader, ImageCell } from '../../components/UI';
import styles from './Ventas.module.css';

export function Ventas() {
  const { ventas, setVentas, clientes, productos } = useERP();
  const { addToast } = useUI();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    cliente: '',
    clienteId: '',
    producto: '',
    productoId: '',
    cantidad: 1,
    total: 0,
    fecha: new Date().toISOString().split('T')[0],
    estado: 'pendiente' as 'completada' | 'pendiente' | 'cancelada',
  });

  const filteredVentas = ventas.filter(v =>
    v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setVentas(ventas.map(v => v.id === editingId ? { ...v, ...formData } : v));
      setEditingId(null);
      addToast('Venta actualizada correctamente', 'success');
    } else {
      const newVenta = {
        ...formData,
        id: `V${String(ventas.length + 1).padStart(3, '0')}`,
        clienteId: formData.clienteId || '',
        productoId: formData.productoId || '',
      };
      setVentas([...ventas, newVenta]);
      addToast('Venta creada correctamente', 'success');
    }
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      clienteId: '',
      producto: '',
      productoId: '',
      cantidad: 1,
      total: 0,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
    });
  };

  const handleEdit = (venta: typeof ventas[0]) => {
    setFormData(venta);
    setEditingId(venta.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta venta?')) {
      setVentas(ventas.filter(v => v.id !== id));
      addToast('Venta eliminada', 'error');
    }
  };

  const getClienteByName = (nombre: string) => clientes.find(c => c.nombre === nombre);
  const getProductoByName = (nombre: string) => productos.find(p => p.nombre === nombre);

  const columns = [
    { key: 'id', header: 'ID' },
    { 
      key: 'cliente', 
      header: 'Cliente',
      render: (v: typeof ventas[0]) => {
        const cliente = getClienteByName(v.cliente);
        return cliente ? (
          <ImageCell 
            src={cliente.avatar} 
            name={v.cliente} 
            subtext={cliente.empresa}
            type="avatar"
          />
        ) : v.cliente;
      }
    },
    { 
      key: 'producto', 
      header: 'Producto',
      render: (v: typeof ventas[0]) => {
        const producto = getProductoByName(v.producto);
        return producto ? (
          <ImageCell 
            src={producto.imagen} 
            name={v.producto}
            subtext={`x${v.cantidad}`}
            type="product"
          />
        ) : v.producto;
      }
    },
    { 
      key: 'total', 
      header: 'Total',
      render: (v: typeof ventas[0]) => `$${v.total.toLocaleString()}` 
    },
    { key: 'fecha', header: 'Fecha' },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (v: typeof ventas[0]) => (
        <span className={`${styles.badge} ${styles[v.estado]}`}>
          {v.estado}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (v: typeof ventas[0]) => (
        <div className={styles.actions}>
          <Button size="small" variant="secondary" onClick={() => handleEdit(v)}>Editar</Button>
          <Button size="small" variant="danger" onClick={() => handleDelete(v.id)}>Eliminar</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Ventas">
        <div className={styles.headerActions}>
          <input 
            type="text" 
            placeholder="Buscar ventas..." 
            className={styles.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            + Nueva Venta
          </Button>
        </div>
      </PageHeader>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingId ? 'Editar Venta' : 'Nueva Venta'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Cliente</label>
                <select 
                  value={formData.cliente} 
                  onChange={(e) => {
                    const cliente = clientes.find(c => c.nombre === e.target.value);
                    setFormData({
                      ...formData, 
                      cliente: e.target.value,
                      clienteId: cliente?.id || ''
                    });
                  }}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Producto</label>
                <select 
                  value={formData.producto} 
                  onChange={(e) => {
                    const prod = productos.find(p => p.nombre === e.target.value);
                    setFormData({
                      ...formData, 
                      producto: e.target.value,
                      productoId: prod?.id || '',
                      total: prod ? prod.precio * formData.cantidad : 0
                    });
                  }}
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => (
                    <option key={p.id} value={p.nombre}>{p.nombre} - ${p.precio}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Cantidad</label>
                <input 
                  type="number" 
                  min="1" 
                  value={formData.cantidad}
                  onChange={(e) => {
                    const prod = productos.find(p => p.nombre === formData.producto);
                    setFormData({
                      ...formData, 
                      cantidad: parseInt(e.target.value),
                      total: prod ? prod.precio * parseInt(e.target.value) : 0
                    });
                  }}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Total</label>
                <input type="text" value={`$${formData.total.toLocaleString()}`} disabled />
              </div>
              <div className={styles.formGroup}>
                <label>Fecha</label>
                <input 
                  type="date" 
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Estado</label>
                <select 
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value as any})}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
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

      <Table data={filteredVentas} columns={columns} />
    </div>
  );
}