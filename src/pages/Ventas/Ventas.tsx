import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useVentaStore } from "../../stores/ventaStore";
import { useClienteStore } from "../../stores/clienteStore";
import { useProductoStore } from "../../stores/productoStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useAuthStore } from "../../stores/authStore";
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
import type {
  CreateSaleRequest,
  UpdateSaleRequest,
  SaleDto,
} from "../../infrastructure/api/saleService";
import type { CartItem, Product } from "../../domain/types";

import styles from "./Ventas.module.css";

import { useFilter } from "../../hooks/useFilter";

export function Ventas() {
  const { t } = useTranslation();
  const { ventas, fetchVentas, createVenta, updateVenta, deleteVenta, loading } =
    useVentaStore();
  const { clientes } = useClienteStore();
  const { productos } = useProductoStore();
  const { currentCompany, fetchCurrentCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { pageNumber, goToPage, getInfo } = usePagination({
    initialPageSize: ITEMS_PER_PAGE,
  });

  // Cargar empresa del usuario
  useEffect(() => {
    if (!currentCompany && user?.companyId) {
      fetchCurrentCompany(user.companyId);
    }
  }, [currentCompany, user, fetchCurrentCompany]);

  // Cargar ventas del backend al montar
  useEffect(() => {
    fetchVentas(pageNumber, ITEMS_PER_PAGE);
  }, [pageNumber, fetchVentas]);

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [ventaEstado, setVentaEstado] = useState<"pendiente" | "completada">(
    "pendiente",
  );

  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((p) => p.category))];
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

  const searchFilteredClientes = useFilter({
    data: dropdownClientes,
    searchTerm,
    searchFields: (c) => [c.nombre, c.email, c.empresa ?? ""],
  });

  const match = useMemo(() => {
    if (!clienteSearch.trim()) return null;

    const search = clienteSearch.toLowerCase();
    return clientes.find(
      (c) =>
        c.nombre.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.empresa && c.empresa.toLowerCase().includes(search)),
    );
  }, [clienteSearch, clientes]);

  const filteredProducts = useFilter({
    data: productos,
    searchTerm,
    searchFields: (p) => [p.name],
    filter: (p) =>
      categoriaFilter === "todos" || p.category === categoriaFilter,
  });

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
    const totalItems = carrito.reduce((acc, item) => acc + item.quantity, 0);
    return { subtotal, itbis, total, totalItems };
  }, [carrito]);

  const agregarAlCarrito = (producto: Product) => {
    const existingItem = carrito.find((item) => item.productId === producto.id);

    if (existingItem) {
      setCarrito(
        carrito.map((item) =>
          item.productId === producto.id
            ? {
                ...item,
                cantidad: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        ),
      );
    } else {
      setCarrito([
        ...carrito,
        {
          productId: producto.id,
          productName: producto.name,
          imageUrl: producto.imageUrl || "",
          unitPrice: producto.price,
          quantity: 1,
          subtotal: producto.price,
        },
      ]);
    }
  };

  const actualizarCantidad = (productoId: number, delta: number) => {
    setCarrito(
      carrito.map((item) => {
        if (item.productId === productoId) {
          const newCantidad = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newCantidad,
            subtotal: newCantidad * item.unitPrice,
          };
        }
        return item;
      }),
    );
  };

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter((item) => item.productId !== Number(productoId)));
  };

  const completarVenta = async () => {
    // Usar match si existe, sino selectedCliente
    const clienteElegido = selectedCliente || (match ? match.id : null);

    if (!clienteElegido) {
      addToast(t("ventas.selectClientWarning"), "warning");
      return;
    }
    if (carrito.length === 0) {
      addToast(t("ventas.cartEmptyWarning"), "warning");
      return;
    }
    if (!currentCompany) {
      console.log(currentCompany);
      addToast("No hay empresa seleccionada", "error");
      return;
    }

    const clienteData = clientes.find((c) => c.id === clienteElegido);
    const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);

    const saleItems = carrito.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.imageUrl || undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

    try {
      if (editingSaleId) {
        // Actualizar venta existente
        const updateData: UpdateSaleRequest = {
          clienteId: clienteElegido,
          clienteName: clienteData?.nombre || null,
          status: ventaEstado === "completada" ? "Completed" : "Pending",
          total,
          notes: null,
          items: saleItems,
        };
        await updateVenta(editingSaleId, updateData);
      } else {
        // Crear nueva venta
        const saleData: CreateSaleRequest = {
          companyId: currentCompany.id,
          clienteId: clienteElegido,
          clienteName: clienteData?.nombre || null,
          status: ventaEstado === "completada" ? "Completed" : "Pending",
          total,
          notes: null,
          items: saleItems,
        };
        await createVenta(saleData);
      }
      
      addToast(t("ventas.saleCompleted"), "success");
      setCarrito([]);
      setSelectedCliente(null);
      setEditingSaleId(null);
      setVentaEstado("pendiente");
      setShowForm(false);
    } catch (err) {
      addToast((err as Error).message, "error");
    }
  };

  const guardarBorrador = async () => {
    const clienteElegido = selectedCliente || (match ? match.id : null);
    
    if (!clienteElegido || carrito.length === 0) {
      addToast(t("ventas.draftWarning"), "warning");
      return;
    }
    if (!currentCompany) {
      addToast("No hay empresa seleccionada", "error");
      return;
    }

    const clienteData = clientes.find((c) => c.id === clienteElegido);
    const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);

    const saleItems = carrito.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.imageUrl || undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

    try {
      if (editingSaleId) {
        // Actualizar venta existente
        const updateData: UpdateSaleRequest = {
          clienteId: clienteElegido,
          clienteName: clienteData?.nombre || null,
          status: "Pending",
          total,
          notes: null,
          items: saleItems,
        };
        await updateVenta(editingSaleId, updateData);
      } else {
        // Crear nueva venta
        const saleData: CreateSaleRequest = {
          companyId: currentCompany.id,
          clienteId: clienteElegido,
          clienteName: clienteData?.nombre || null,
          status: "Pending",
          total,
          notes: null,
          items: saleItems,
        };
        await createVenta(saleData);
      }
      
      addToast(t("ventas.draftSaved"), "success");
      setCarrito([]);
      setSelectedCliente(null);
      setEditingSaleId(null);
      setShowForm(false);
    } catch (err) {
      addToast((err as Error).message, "error");
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteVenta(deleteId);
        addToast(t("ventas.saleDeleted"), "success");
      } catch (err) {
        addToast((err as Error).message, "error");
      }
    }
  };

  const handleEdit = (venta: SaleDto) => {
    // Guardar ID de la venta en edición
    setEditingSaleId(venta.id);
    
    // Cargar items al carrito
    setCarrito(venta.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      imageUrl: item.productImageUrl || "",
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })));
    
    // Cargar cliente
    if (venta.clienteId) {
      setSelectedCliente(venta.clienteId);
      const cliente = clientes.find(c => c.id === venta.clienteId);
      if (cliente) setClienteSearch(cliente.nombre);
    }
    
    // Establecer estado
    setVentaEstado(venta.status === "Completed" ? "completada" : "pendiente");
    setShowForm(true);
  };

  const filteredVentas = useFilter({
    data: ventas,
    searchTerm,
    searchFields: (v: SaleDto) => [v.clienteName || "", String(v.id)],
  });

  const paginatedVentas = useMemo(() => {
    return paginate(filteredVentas, pageNumber, ITEMS_PER_PAGE);
  }, [filteredVentas, pageNumber]);

  const paginationInfo = getInfo(filteredVentas.length);

  const getClienteById = (id: number | null) =>
    id ? clientes.find((c) => Number(c.id) === id) : null;

  const columns = [
    { key: "id", header: t("common.id") },
    {
      key: "cliente",
      header: t("ventas.client"),
      render: (v: SaleDto) => {
        const cliente = getClienteById(v.clienteId);
        return cliente ? (
          <ImageCell
            src={cliente.avatar}
            name={v.clienteName || ""}
            subtext={cliente.empresa}
            type="avatar"
          />
        ) : (
          v.clienteName || "-"
        );
      },
    },
    {
      key: "producto",
      header: t("ventas.product"),
      render: (v: SaleDto) => {
        if (!v.items?.length) return "-";
        const firstItem = v.items[0];
        return (
          <ImageCell
            src={firstItem.productImageUrl || ""}
            name={firstItem.productName}
            subtext={
              v.items.length > 1
                ? `+${v.items.length - 1} más`
                : `x${firstItem.quantity}`
            }
            type="product"
          />
        );
      },
    },
    {
      key: "total",
      header: t("common.total"),
      render: (v: SaleDto) => `$${v.total.toLocaleString()}`,
    },
    {
      key: "fecha",
      header: t("common.date"),
      render: (v: SaleDto) => new Date(v.createdAt).toLocaleDateString(),
    },
    {
      key: "estado",
      header: t("common.status"),
      render: (v: SaleDto) => (
        <span
          className={`${styles.badge} ${styles[v.status === "Completed" ? "completada" : "pendiente"]}`}
        >
          {v.status === "Completed"
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

      {loading && <p>Cargando...</p>}

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
                      src={producto.imageUrl || ""}
                      name={producto.name}
                      subtext={producto.category}
                      type="product"
                    />
                    <span className={styles.productName}>{producto.name}</span>
                    <span className={styles.productPrice}>
                      {formatCurrency(producto.price)}
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
                    <div key={item.productId} className={styles.cartItem}>
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className={styles.cartItemImg}
                      />
                      <div className={styles.cartItemInfo}>
                        <span className={styles.cartItemName}>
                          {item.productName}
                        </span>
                        <span className={styles.cartItemPrice}>
                          {formatCurrency(item.unitPrice)}
                        </span>
                      </div>
                      <div className={styles.cartItemControls}>
                        <button
                          onClick={() => actualizarCantidad(item.productId, -1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => actualizarCantidad(item.productId, 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className={styles.cartItemSubtotal}>
                        {formatCurrency(item.subtotal)}
                      </span>
                      <button
                        className={styles.cartItemDelete}
                        onClick={() => eliminarDelCarrito(item.productId)}
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
                  value={
                    match?.id?.toString() || selectedCliente?.toString() || ""
                  }
                  onChange={(e) => {
                    const clienteId = e.target.value;
                    if (!clienteId) {
                      setSelectedCliente(null);
                      setClienteSearch("");
                    } else {
                      const cliente = clientes.find(
                        (c) => c.id === Number(clienteId),
                      );
                      setSelectedCliente(Number(clienteId));
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
                  onChange={(e) =>
                    setVentaEstado(e.target.value as "pendiente" | "completada")
                  }
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
