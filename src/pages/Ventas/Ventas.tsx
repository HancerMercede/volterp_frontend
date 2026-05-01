import { useState, useMemo } from 'react';
import { useERP, useUI } from '../../context';
import { Table, Button, PageHeader, ImageCell, Pagination, SearchInput } from '../../components/UI';
import { usePagination } from '../../hooks/usePagination';
import { paginate } from '../../utils/pagination';
import { ITEMS_PER_PAGE } from '../../config/pagination';
import styles from './Ventas.module.css';

interface CarritoItem {
  productoId: string;
  producto: string;
  imagen: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export function Ventas() {
  const { ventas, setVentas, clientes, productos } = useERP();
  const { addToast } = useUI();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { page, goToPage, getInfo } = usePagination({ initialPageSize: ITEMS_PER_PAGE });
  
  // Estado del carrito
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [clienteSearch, setClienteSearch] = useState('');
  const [ventaEstado, setVentaEstado] = useState<'pendiente' | 'completada'>('pendiente');

  // Filtros de categoría
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  
  // Obtener categorías únicas
  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map(p => p.categoria))];
    return ['todos', ...cats];
  }, [productos]);

  // Filtrar clientes para el dropdown
  const filteredClientes = useMemo(() => {
    if (!clienteSearch.trim()) return clientes;
    const search = clienteSearch.toLowerCase();
    return clientes.filter(c => 
      c.nombre.toLowerCase().includes(search) || 
      c.email.toLowerCase().includes(search) ||
      (c.empresa && c.empresa.toLowerCase().includes(search))
    );
  }, [clientes, clienteSearch]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return productos.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategoria = categoriaFilter === 'todos' || p.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    });
  }, [productos, searchTerm, categoriaFilter]);

  // Paginación de productos
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 50;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  const totalProductPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calcular totales
  const totales = useMemo(() => {
    const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    const itbis = subtotal * 0.18;
    const total = subtotal + itbis;
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    return { subtotal, itbis, total, totalItems };
  }, [carrito]);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto: typeof productos[0]) => {
    const existingItem = carrito.find(item => item.productoId === producto.id);
    
    if (existingItem) {
      setCarrito(carrito.map(item => 
        item.productoId === producto.id 
          ? { 
              ...item, 
              cantidad: item.cantidad + 1, 
              subtotal: (item.cantidad + 1) * item.precio 
            }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        productoId: producto.id,
        producto: producto.nombre,
        imagen: producto.imagen,
        precio: producto.precio,
        cantidad: 1,
        subtotal: producto.precio
      }]);
    }
  };

  // Actualizar cantidad
  const actualizarCantidad = (productoId: string, delta: number) => {
    setCarrito(carrito.map(item => {
      if (item.productoId === productoId) {
        const newCantidad = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newCantidad, subtotal: newCantidad * item.precio };
      }
      return item;
    }));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(carrito.filter(item => item.productoId !== productoId));
  };

  // Completar venta
  const completarVenta = () => {
    if (!selectedCliente) {
      addToast('Por favor selecciona un cliente', 'warning');
      return;
    }
    if (carrito.length === 0) {
      addToast('El carrito está vacío', 'warning');
      return;
    }

    const clienteData = clientes.find(c => c.id === selectedCliente);

    // Crear una venta por cada item del carrito
    const nuevasVentas = carrito.map((item, index) => ({
      id: `V${String(ventas.length + index + 1).padStart(3, '0')}`,
      cliente: clienteData?.nombre || 'Cliente',
      clienteId: selectedCliente,
      producto: item.producto,
      productoId: item.productoId,
      cantidad: item.cantidad,
      total: item.subtotal,
      fecha: new Date().toISOString().split('T')[0],
      estado: ventaEstado as 'completada' | 'pendiente',
    }));

    setVentas([...ventas, ...nuevasVentas]);
    addToast(`Venta completada: ${nuevasVentas.length} productos`, 'success');
    
    // Limpiar
    setCarrito([]);
    setSelectedCliente('');
    setVentaEstado('pendiente');
    setShowForm(false);
  };

  // Guardar borrador
  const guardarBorrador = () => {
    if (!selectedCliente || carrito.length === 0) {
      addToast('Carrito vacío o sin cliente', 'warning');
      return;
    }
    addToast('Borrador guardado', 'info');
  };

  // Eliminar venta existente
  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta venta?')) {
      setVentas(ventas.filter(v => v.id !== id));
      addToast('Venta eliminada', 'error');
    }
  };

  // Editar venta
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = (_venta?: typeof ventas[0]) => {
    // Por ahora solo abrimos el modal simple
    setShowForm(true);
  };

  // Filtrar ventas para la tabla
  const filteredVentas = useMemo(() => {
    return ventas.filter(v =>
      v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ventas, searchTerm]);

  const paginatedVentas = useMemo(() => {
    return paginate(filteredVentas, page, ITEMS_PER_PAGE);
  }, [filteredVentas, page]);

  const paginationInfo = getInfo(filteredVentas.length);

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
          <ImageCell src={cliente.avatar} name={v.cliente} subtext={cliente.empresa} type="avatar" />
        ) : v.cliente;
      }
    },
    { 
      key: 'producto', 
      header: 'Producto',
      render: (v: typeof ventas[0]) => {
        const producto = getProductoByName(v.producto);
        return producto ? (
          <ImageCell src={producto.imagen} name={v.producto} subtext={`x${v.cantidad}`} type="product" />
        ) : v.producto;
      }
    },
    { key: 'total', header: 'Total', render: (v: typeof ventas[0]) => `$${v.total.toLocaleString()}` },
    { key: 'fecha', header: 'Fecha' },
    { 
      key: 'estado', 
      header: 'Estado',
      render: (v: typeof ventas[0]) => (
        <span className={`${styles.badge} ${styles[v.estado]}`}>{v.estado}</span>
      )
    },
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <div>
      <PageHeader title="Ventas" subtitle="Gestión de ventas y pedidos">
        <div className={styles.headerActions}>
          <SearchInput 
            value={searchTerm}
            onChange={(value) => { setSearchTerm(value); goToPage(1); }}
            placeholder="Buscar ventas..."
            width="240px"
          />
          <Button onClick={() => { setShowForm(true); }}>
            + Nueva Venta
          </Button>
        </div>
      </PageHeader>

      {showForm && (
        <div className={styles.modalFull}>
          <div className={styles.posContainer}>
            {/* Panel Izquierdo - Carrito */}
            <div className={styles.cartPanel}>
              <div className={styles.panelHeader}>
                <h3>🛒 Carrito</h3>
                {carrito.length > 0 && (
                  <button className={styles.clearCart} onClick={() => setCarrito([])}>
                    Limpiar
                  </button>
                )}
              </div>
              
              {carrito.length === 0 ? (
                <div className={styles.emptyCart}>
                  <span>🛒</span>
                  <p>El carrito está vacío</p>
                  <small>Agrega productos del catálogo</small>
                </div>
              ) : (
                <div className={styles.cartItems}>
                  {carrito.map(item => (
                    <div key={item.productoId} className={styles.cartItem}>
                      <img src={item.imagen} alt={item.producto} className={styles.cartItemImg} />
                      <div className={styles.cartItemInfo}>
                        <span className={styles.cartItemName}>{item.producto}</span>
                        <span className={styles.cartItemPrice}>{formatCurrency(item.precio)}</span>
                      </div>
                      <div className={styles.cartItemControls}>
                        <button onClick={() => actualizarCantidad(item.productoId, -1)}>−</button>
                        <span>{item.cantidad}</span>
                        <button onClick={() => actualizarCantidad(item.productoId, 1)}>+</button>
                      </div>
                      <span className={styles.cartItemSubtotal}>{formatCurrency(item.subtotal)}</span>
                      <button 
                        className={styles.cartItemDelete}
                        onClick={() => eliminarDelCarrito(item.productoId)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className={styles.cartFooter}>
                <div className={styles.cartTotal}>
                  <span>Total items:</span>
                  <strong>{totales.totalItems}</strong>
                </div>
                <div className={styles.cartTotal}>
                  <span>Total:</span>
                  <strong>{formatCurrency(totales.subtotal)}</strong>
                </div>
              </div>
            </div>

            {/* Panel Central - Resumen */}
            <div className={styles.summaryPanel}>
              <h3>📋 Resumen</h3>
              
              <div className={styles.formGroup}>
                <label>Cliente</label>
                <input 
                  type="text" 
                  placeholder="Buscar cliente..."
                  className={styles.searchInput}
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                />
                <select 
                  value={selectedCliente}
                  onChange={(e) => setSelectedCliente(e.target.value)}
                  style={{ marginTop: '8px' }}
                >
                  <option value="">Seleccionar cliente...</option>
                  {filteredClientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.empresa && `(${c.empresa})`}</option>
                  ))}
                </select>
              </div>

              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(totales.subtotal)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>ITBIS (18%)</span>
                  <span>{formatCurrency(totales.itbis)}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                  <span>TOTAL</span>
                  <span>{formatCurrency(totales.total)}</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Estado</label>
                <select value={ventaEstado} onChange={(e) => setVentaEstado(e.target.value as any)}>
                  <option value="pendiente">Pendiente</option>
                  <option value="completada">Completada</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Fecha</label>
                <input type="text" value={new Date().toISOString().split('T')[0]} disabled />
              </div>

              <Button onClick={completarVenta} className={styles.completeBtn}>
                ✅ Completar Venta
              </Button>
              <Button variant="secondary" onClick={guardarBorrador}>
                💾 Guardar Borrador
              </Button>
              <Button variant="secondary" onClick={() => { setShowForm(false); setCarrito([]); }}>
                Cancelar
              </Button>
            </div>

            {/* Panel Inferior - Catálogo de Productos */}
            <div className={styles.productsPanel}>
              <div className={styles.productsHeader}>
                <h3>📦 Productos</h3>
                <SearchInput 
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Buscar productos..."
                  className={styles.productSearchInput}
                />
              </div>
              
              <div className={styles.categoryTabs}>
                {categorias.map(cat => (
                  <button 
                    key={cat}
                    className={`${styles.categoryTab} ${categoriaFilter === cat ? styles.active : ''}`}
                    onClick={() => setCategoriaFilter(cat)}
                  >
                    {cat === 'todos' ? 'Todos' : cat}
                  </button>
                ))}
              </div>

              <div className={styles.productsGrid}>
                {paginatedProducts.map(producto => (
                  <div 
                    key={producto.id} 
                    className={styles.productCard}
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <img src={producto.imagen} alt={producto.nombre} className={styles.productImg} />
                    <span className={styles.productName}>{producto.nombre}</span>
                    <span className={styles.productPrice}>{formatCurrency(producto.precio)}</span>
                    <button className={styles.addBtn}>+</button>
                  </div>
                ))}
              </div>
              
              {totalProductPages > 1 && (
                <Pagination
                  pagination={{
                    total: filteredProducts.length,
                    page: currentPage,
                    pageSize: productsPerPage,
                    totalPages: totalProductPages,
                    hasNext: currentPage < totalProductPages,
                    hasPrev: currentPage > 1
                  }}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <Table data={paginatedVentas} columns={columns} onEdit={handleEdit} onDelete={handleDelete} />

      <Pagination
        pagination={paginationInfo}
        onPageChange={goToPage}
      />
    </div>
  );
}