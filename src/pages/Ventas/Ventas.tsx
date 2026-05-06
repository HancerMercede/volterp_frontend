import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useVentaStore } from "../../stores/ventaStore";
import { useClienteStore } from "../../stores/clienteStore";
import { useProductoStore } from "../../stores/productoStore";
import { useUIStore } from "../../stores/uiStore";
import {
  Table,
  Button,
  PageHeader,
  ImageCell,
  Pagination,
  SearchInput,
  ConfirmModal,
} from "../../components/UI";
import { usePagination } from "../../hooks/usePagination";
import { paginate } from "../../utils/pagination";
import { ITEMS_PER_PAGE } from "../../config/pagination";
import type { Venta } from "../../data/mockData";
import type { Producto } from "../../data/mockData";
import styles from "./Ventas.module.css";

interface CarritoItem {
  productoId: string;
  producto: string;
  imagen: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export function Ventas() {
  const { t } = useTranslation();
  const { ventas, addVenta, deleteVenta } = useVentaStore();
  const { clientes } = useClienteStore();
  const { productos } = useProductoStore();
  const { addToast } = useUIStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { page, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [selectedCliente, setSelectedCliente] = useState("");
  const [clienteSearch, setClienteSearch] = useState("");
  const [ventaEstado, setVentaEstado] = useState<"pendiente" | "completada">(
    "pendiente",
  );

  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((p) => p.categoria))];
    return ["todos", ...cats];
  }, [productos]);

  const dropdownClientes = useMemo(() => {
    const top50 = clientes.slice(0, 50);
    if (selectedCliente && !top50.find((c) => c.id === selectedCliente)) {
      const selected = clientes.find((c) => c.id === selectedCliente);
      if (selected) return [selected, ...top50];
    }
    return top50;
  }, [clientes, selectedCliente]);

  const searchFilteredClientes = useMemo(() => {
    if (!clienteSearch.trim()) return dropdownClientes;
    const search = clienteSearch.toLowerCase();
    return dropdownClientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.empresa && c.empresa.toLowerCase().includes(search)),
    );
  }, [dropdownClientes, clienteSearch]);

  useEffect(() => {
    if (!clienteSearch.trim()) {
      return;
    }
    const search = clienteSearch.toLowerCase();
    const match = clientes.find(
      (c) =>
        c.nombre.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.empresa && c.empresa.toLowerCase().includes(search)),
    );
    if (match && match.id !== selectedCliente) {
      setSelectedCliente(match.id);
    }
  }, [clienteSearch, clientes, selectedCliente]);

  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchesSearch = p.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategoria =
        categoriaFilter === "todos" || p.categoria === categoriaFilter;
      return matchesSearch && matchesCategoria;
    });
  }, [productos, searchTerm, categoriaFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 50;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  const totalProductPages = Math.ceil(
    filteredProducts.length / productsPerPage,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totales = useMemo(() => {
    const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    const itbis = subtotal * 0.18;
    const total = subtotal + itbis;
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    return { subtotal, itbis, total, totalItems };
  }, [carrito]);

  const agregarAlCarrito = (producto: Producto) => {
    const existingItem = carrito.find(
      (item) => item.productoId === producto.id,
    );

    if (existingItem) {
      setCarrito(
        carrito.map((item) =>
          item.productoId === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio,
              }
            : item,
        ),
      );
    } else {
      setCarrito([
        ...carrito,
        {
          productoId: producto.id,
          producto: producto.nombre,
          imagen: producto.imagen,
          precio: producto.precio,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ]);
    }
  };

  const actualizarCantidad = (productoId: string, delta: number) => {
    setCarrito(
      carrito.map((item) => {
        if (item.productoId === productoId) {
          const newCantidad = Math.max(1, item.cantidad + delta);
          return {
            ...item,
            cantidad: newCantidad,
            subtotal: newCantidad * item.precio,
          };
        }
        return item;
      }),
    );
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarrito(carrito.filter((item) => item.productoId !== productoId));
  };

  const completarVenta = () => {
    if (!selectedCliente) {
      addToast(t("ventas.selectClientWarning"), "warning");
      return;
    }
    if (carrito.length === 0) {
      addToast(t("ventas.cartEmptyWarning"), "warning");
      return;
    }

    const clienteData = clientes.find((c) => c.id === selectedCliente);

    const nuevasVentas: Venta[] = carrito.map((item, index) => ({
      id: `V${String(ventas.length + index + 1).padStart(3, "0")}`,
      cliente: clienteData?.nombre || t("ventas.client"),
      clienteId: selectedCliente,
      producto: item.producto,
      productoId: item.productoId,
      cantidad: item.cantidad,
      total: item.subtotal,
      fecha: new Date().toISOString().split("T")[0],
      estado: ventaEstado as "completada" | "pendiente",
    }));

    nuevasVentas.forEach((venta) => addVenta(venta));
    addToast(t("ventas.saleCompleted"), "success");

    setCarrito([]);
    setSelectedCliente("");
    setVentaEstado("pendiente");
    setShowForm(false);
  };

  const guardarBorrador = () => {
    if (!selectedCliente || carrito.length === 0) {
      addToast(t("ventas.draftWarning"), "warning");
      return;
    }
    addToast(t("ventas.draftSaved"), "info");
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteVenta(deleteId);
      addToast(t("ventas.saleDeleted"), "error");
    }
  };

  const handleEdit = (_venta?: Venta) => {
    setShowForm(true);
  };

  const filteredVentas = useMemo(() => {
    return ventas.filter(
      (v) =>
        v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.id.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [ventas, searchTerm]);

  const paginatedVentas = useMemo(() => {
    return paginate(filteredVentas, page, ITEMS_PER_PAGE);
  }, [filteredVentas, page]);

  const paginationInfo = getInfo(filteredVentas.length);

  const getClienteByName = (nombre: string) =>
    clientes.find((c) => c.nombre === nombre);
  const getProductoByName = (nombre: string) =>
    productos.find((p) => p.nombre === nombre);

  const columns = [
    { key: "id", header: t("common.id") },
    {
      key: "cliente",
      header: t("ventas.client"),
      render: (v: Venta) => {
        const cliente = getClienteByName(v.cliente);
        return cliente ? (
          <ImageCell
            src={cliente.avatar}
            name={v.cliente}
            subtext={cliente.empresa}
            type="avatar"
          />
        ) : (
          v.cliente
        );
      },
    },
    {
      key: "producto",
      header: t("ventas.product"),
      render: (v: Venta) => {
        const producto = getProductoByName(v.producto);
        return producto ? (
          <ImageCell
            src={producto.imagen}
            name={v.producto}
            subtext={`x${v.cantidad}`}
            type="product"
          />
        ) : (
          v.producto
        );
      },
    },
    {
      key: "total",
      header: t("common.total"),
      render: (v: Venta) => `$${v.total.toLocaleString()}`,
    },
    { key: "fecha", header: t("common.date") },
    {
      key: "estado",
      header: t("common.status"),
      render: (v: Venta) => (
        <span className={`${styles.badge} ${styles[v.estado]}`}>
          {v.estado === "completada"
            ? t("ventas.completed")
            : t("ventas.pending")}
        </span>
      ),
    },
  ];

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <div>
      <PageHeader title={t("ventas.title")} subtitle={t("ventas.subtitle")}>
        <div className={styles.headerActions}>
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              goToPage(1);
            }}
            placeholder={t("ventas.searchSales")}
            width="240px"
          />
          <Button
            onClick={() => {
              setShowForm(true);
            }}
          >
            + {t("ventas.newSale")}
          </Button>
        </div>
      </PageHeader>

      {showForm && (
        <div className={styles.modalFull}>
          <div className={styles.posContainer}>
            <div className={styles.productsPanel}>
              <div className={styles.productsHeader}>
                <h3>📦 {t("ventas.products")}</h3>
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={t("ventas.searchProducts")}
                  className={styles.productSearchInput}
                />
              </div>

              <div className={styles.categoryTabs}>
                {categorias.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.categoryTab} ${categoriaFilter === cat ? styles.active : ""}`}
                    onClick={() => setCategoriaFilter(cat)}
                  >
                    {cat === "todos" ? t("ventas.allProducts") : cat}
                  </button>
                ))}
              </div>

              <div className={styles.productsGrid}>
                {paginatedProducts.map((producto) => (
                  <div
                    key={producto.id}
                    className={styles.productCard}
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <ImageCell
                      src={producto.imagen}
                      name={producto.nombre}
                      subtext={producto.categoria}
                      type="product"
                    />
                    <span className={styles.productName}>
                      {producto.nombre}
                    </span>
                    <span className={styles.productPrice}>
                      {formatCurrency(producto.precio)}
                    </span>
                    <button className={styles.addBtn}>+</button>
                  </div>
                ))}
              </div>

              {totalProductPages > 1 && (
                <div className={styles.paginationWrapper}>
                  <Pagination
                    pagination={{
                      total: filteredProducts.length,
                      page: currentPage,
                      pageSize: productsPerPage,
                      totalPages: totalProductPages,
                      hasNext: currentPage < totalProductPages,
                      hasPrev: currentPage > 1,
                    }}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>

            <div className={styles.cartPanel}>
              <div className={styles.panelHeader}>
                <h3>🛒 {t("ventas.cart")}</h3>
                {carrito.length > 0 && (
                  <button
                    className={styles.clearCart}
                    onClick={() => setCarrito([])}
                  >
                    {t("ventas.clear")}
                  </button>
                )}
              </div>

              {carrito.length === 0 ? (
                <div className={styles.emptyCart}>
                  <span>🛒</span>
                  <p>{t("ventas.cartEmpty")}</p>
                  <small>{t("ventas.addProductsHint")}</small>
                </div>
              ) : (
                <div className={styles.cartItems}>
                  {carrito.map((item) => (
                    <div key={item.productoId} className={styles.cartItem}>
                      <img
                        src={item.imagen}
                        alt={item.producto}
                        className={styles.cartItemImg}
                      />
                      <div className={styles.cartItemInfo}>
                        <span className={styles.cartItemName}>
                          {item.producto}
                        </span>
                        <span className={styles.cartItemPrice}>
                          {formatCurrency(item.precio)}
                        </span>
                      </div>
                      <div className={styles.cartItemControls}>
                        <button
                          onClick={() =>
                            actualizarCantidad(item.productoId, -1)
                          }
                        >
                          −
                        </button>
                        <span>{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(item.productoId, 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className={styles.cartItemSubtotal}>
                        {formatCurrency(item.subtotal)}
                      </span>
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
                  <span>{t("ventas.totalItems")}:</span>
                  <strong>{totales.totalItems}</strong>
                </div>
                <div className={styles.cartTotal}>
                  <span>{t("common.total")}:</span>
                  <strong>{formatCurrency(totales.subtotal)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.summaryPanel}>
              <h3>📋 {t("ventas.summary")}</h3>

              <div className={styles.formGroup}>
                <label>{t("ventas.client")}</label>
                <input
                  type="text"
                  placeholder={t("ventas.selectClient")}
                  className={styles.searchInput}
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                />
                <select
                  value={selectedCliente}
                  onChange={(e) => {
                    const clienteId = e.target.value;
                    setSelectedCliente(clienteId);
                    if (!clienteId) {
                      setClienteSearch("");
                    } else {
                      const cliente = clientes.find((c) => c.id === clienteId);
                      if (cliente) setClienteSearch(cliente.nombre);
                    }
                  }}
                  style={{ marginTop: "8px" }}
                >
                  <option value="">{t("ventas.selectClient")}</option>
                  {searchFilteredClientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.empresa && `(${c.empresa})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>{t("common.subtotal")}</span>
                  <span>{formatCurrency(totales.subtotal)}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>{t("ventas.itbisLabel")}</span>
                  <span>{formatCurrency(totales.itbis)}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.totalFinal}`}>
                  <span>{t("ventas.totalAmount")}</span>
                  <span>{formatCurrency(totales.total)}</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>{t("common.status")}</label>
                <select
                  value={ventaEstado}
                  onChange={(e) => setVentaEstado(e.target.value as any)}
                >
                  <option value="pendiente">{t("ventas.pending")}</option>
                  <option value="completada">{t("ventas.completed")}</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>{t("common.date")}</label>
                <input
                  type="text"
                  value={new Date().toISOString().split("T")[0]}
                  disabled
                />
              </div>

              <Button onClick={completarVenta} className={styles.completeBtn}>
                ✅ {t("ventas.checkout")}
              </Button>
              <Button variant="secondary" onClick={guardarBorrador}>
                💾 {t("ventas.saveDraft")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setCarrito([]);
                }}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Table
        data={paginatedVentas}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Pagination pagination={paginationInfo} onPageChange={goToPage} />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title={t("common.confirmDeleteTitle")}
        message={t("ventas.deleteConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
      />
    </div>
  );
}
