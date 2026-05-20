import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useClienteStore } from "../../../stores/clienteStore";
import { useProductoStore } from "../../../stores/productoStore";
import { useVentaStore } from "../../../stores/ventaStore";
import { useCompanyStore } from "../../../stores/companyStore";
import { useUIStore } from "../../../stores/uiStore";
import type { CreateSaleRequest, UpdateSaleRequest, CartItem, Product } from "../../../domain/types";
import { ClienteSelector } from "./ClienteSelector";
import { Carrito } from "./Carrito";
import { SelectorProducto } from "./SelectorProducto";
import { ResumenVenta } from "./ResumenVenta";
import styles from "./NuevaVenta.module.css";

interface Props {
  editingSaleId: number | null;
  onSave: () => void;
  onCancel: () => void;
}

export function NuevaVenta({ editingSaleId, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const { clientes } = useClienteStore();
  const { productos } = useProductoStore();
  const { ventas, createVenta, updateVenta } = useVentaStore();
  const { currentCompany } = useCompanyStore();
  const { addToast } = useUIStore();

  // Derive editing data from store (ventas loaded by parent before this component mounts via key-remount pattern)
  const editingVenta = useMemo(() => editingSaleId ? ventas.find((v) => v.id === editingSaleId) : null, [editingSaleId, ventas]);
  const editingCliente = useMemo(() => editingVenta?.clienteId ? clientes.find((c) => c.id === editingVenta.clienteId) : null, [editingVenta, clientes]);

  // Local form state — key remount pattern ensures fresh state on editingSaleId change
  const [carrito, setCarrito] = useState<CartItem[]>(editingVenta ? editingVenta.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    imageUrl: item.productImageUrl || "",
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    subtotal: item.subtotal,
  })) : []);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(editingVenta?.clienteId ?? null);
  const [clienteSearch, setClienteSearch] = useState(editingCliente?.nombre ?? "");
  const [ventaEstado, setVentaEstado] = useState<"pendiente" | "completada">(editingVenta?.status === "Completed" ? "completada" : "pendiente");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [productSearch, setProductSearch] = useState("");

  const match = useMemo(() => {
    if (!clienteSearch.trim()) return null;
    const search = clienteSearch.toLowerCase();
    return clientes.find((c) =>
      c.nombre.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || (c.empresa && c.empresa.toLowerCase().includes(search))
    );
  }, [clienteSearch, clientes]);

  const totales = useMemo(() => {
    const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    return { subtotal, itbis: subtotal * 0.18, total: subtotal * 1.18, totalItems: carrito.reduce((acc, item) => acc + item.quantity, 0) };
  }, [carrito]);

  const agregarAlCarrito = (producto: Product) => {
    setCarrito((prev) => {
      const existing = prev.find((item) => item.productId === producto.id);
      if (existing) return prev.map((item) => item.productId === producto.id ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice } : item);
      return [...prev, { productId: producto.id, productName: producto.name, imageUrl: producto.imageUrl || "", unitPrice: producto.price, quantity: 1, subtotal: producto.price }];
    });
  };

  const actualizarCantidad = (productId: number, delta: number) => {
    setCarrito((prev) => prev.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta), subtotal: Math.max(1, item.quantity + delta) * item.unitPrice } : item));
  };

  const eliminarDelCarrito = (productId: number) => setCarrito((prev) => prev.filter((item) => item.productId !== productId));

  const buildSaleItems = () => carrito.map((item) => ({ productId: item.productId, productName: item.productName, productImageUrl: item.imageUrl || undefined, quantity: item.quantity, unitPrice: item.unitPrice, subtotal: item.subtotal }));

  const validateAndSubmit = async (status: "Pending" | "Completed") => {
    const clienteElegido = selectedCliente || (match ? match.id : null);
    if (!clienteElegido) { addToast(t("ventas.selectClientWarning"), "warning"); return; }
    if (carrito.length === 0) { addToast(t("ventas.cartEmptyWarning"), "warning"); return; }
    if (!currentCompany) { addToast("No hay empresa seleccionada", "error"); return; }
    const clienteData = clientes.find((c) => c.id === clienteElegido);
    const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);
    try {
      if (editingSaleId) {
        await updateVenta(editingSaleId, { clienteId: clienteElegido, clienteName: clienteData?.nombre || null, status, total, notes: null, items: buildSaleItems() } as UpdateSaleRequest);
      } else {
        await createVenta({ companyId: currentCompany.id, clienteId: clienteElegido, clienteName: clienteData?.nombre || null, status, total, notes: null, items: buildSaleItems() } as CreateSaleRequest);
      }
      addToast(status === "Completed" ? t("ventas.saleCompleted") : t("ventas.draftSaved"), "success");
      onSave();
    } catch (err) { addToast((err as Error).message, "error"); }
  };

  return (
    <div className={styles.modalFull}>
      <div className={styles.posContainer}>
        <SelectorProducto productos={productos} onAddProduct={agregarAlCarrito} categoriaFilter={categoriaFilter} onCategoriaChange={setCategoriaFilter} searchTerm={productSearch} onSearchChange={setProductSearch} />
        <Carrito items={carrito} onQuantityChange={actualizarCantidad} onRemoveItem={eliminarDelCarrito} onClearCart={() => setCarrito([])} />
        <div className={styles.summarySide}>
          <ClienteSelector clientes={clientes} selectedClienteId={selectedCliente} onClienteSelect={setSelectedCliente} searchValue={clienteSearch} onSearchChange={setClienteSearch} />
          <ResumenVenta subtotal={totales.subtotal} itbis={totales.itbis} total={totales.total} totalItems={totales.totalItems} ventaEstado={ventaEstado} onEstadoChange={setVentaEstado}
            onCompletarVenta={() => validateAndSubmit(ventaEstado === "completada" ? "Completed" : "Pending")}
            onGuardarBorrador={() => validateAndSubmit("Pending")}
            onCancelar={onCancel} />
        </div>
      </div>
    </div>
  );
}