import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, ConfirmModal } from "../../../components/UI";
import { useDeleteConfirm } from "../../../hooks/useDeleteConfirm";
import { useClienteStore } from "../../../stores/clienteStore";
import { useVentaStore } from "../../../stores/ventaStore";
import { useCompanyStore } from "../../../stores/companyStore";
import { useUIStore } from "../../../stores/uiStore";
import { useProductos } from "../../../hooks/useColecciones";
import type {
  CreateSaleRequest,
  UpdateSaleRequest,
  CartItem,
  Product,
} from "../../../domain/types";
import { calculateSaleTotals, TaxCode } from "../../../domain/constants/taxCodes";
import { ClienteSelector } from "./ClienteSelector";
import { Carrito } from "./Carrito";
import { SelectorProducto } from "./SelectorProducto";
import { ResumenVenta, type DocumentoVenta } from "./ResumenVenta";
import styles from "./NuevaVenta.module.css";

interface Props {
  editingSaleId: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export function NuevaVenta({
  editingSaleId,
  onSave,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const { clientes } = useClienteStore();
  const productos = useProductos();
  const { ventas, createVenta, updateVenta, completeVenta, cancelVenta } =
    useVentaStore();
  const { currentCompany, error: companyError } = useCompanyStore();
  const { addToast } = useUIStore();

  const editingVenta = useMemo(
    () => (editingSaleId ? ventas.find((v) => v.id === editingSaleId) : null),
    [editingSaleId, ventas],
  );

  // The screen opens to edit a pending sale (a completed one is seen in the
  // detail), so discarding it is closing it: the sale stays on record and
  // the stock it reserved comes back.
  const sePuedeDescartar =
    editingSaleId !== null &&
    (!editingVenta || editingVenta.status === "Pending");

  const {
    showDeleteConfirm: showCancelConfirm,
    handleDelete: handleCancel,
    confirmDelete: confirmCancel,
    cancelDelete: cancelCancel,
  } = useDeleteConfirm({
    onDelete: async (id: string) => {
      await cancelVenta(id);
      onCancel();
    },
    successMessage: t("ventas.saleCancelled"),
  });

  const descartar = () => {
    if (!editingSaleId) return;
    handleCancel(editingSaleId);
  };

  // The tax code of a line: the one the backend stored with it, or the one
  // of the product in the catalogue when the line comes from a response
  // that did not carry it (the store keeps an old copy of the sales).
  const taxCodeOfLine = (item: {
    productId: string;
    taxCode?: TaxCode;
  }): TaxCode =>
    item.taxCode ??
    productos.find((p) => p.id === item.productId)?.taxCode ??
    TaxCode.ItbisTasa1;

  // Estado local del formulario: el remount por key deja el estado limpio cuando cambia el editingSaleId.
  const [carrito, setCarrito] = useState<CartItem[]>(
    editingVenta
      ? editingVenta.items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          imageUrl: item.productImageUrl || "",
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          subtotal: item.subtotal,
          taxCode: taxCodeOfLine(item),
        }))
      : [],
  );
  const [selectedCliente, setSelectedCliente] = useState<string | null>(
    editingVenta?.clienteId ?? null,
  );
  // The document of the sale. The default is the consumption one (the
  // "factura sin valor fiscal", valid at any amount: the DGII models have
  // one for a total over and one under DOP 250 mil). A fiscal credit is
  // for a client that needs it.
  const [documentoElegido, setDocumentoElegido] = useState<DocumentoVenta | null>(null);
  const documento: DocumentoVenta = documentoElegido ?? "consumo";

  // A fiscal credit needs the tax id of the client: without it the backend
  // refuses to complete the sale. The picker cannot disable the option, so
  // the choice is taken back and said out loud.
  const cambiarDocumento = (nuevo: DocumentoVenta) => {
    if (nuevo === "credito") {
      const clienteData = clientes.find((c) => c.id === selectedCliente);
      if (!clienteData?.taxId) {
        addToast(t("ventas.fiscalCreditNeedsTaxId"), "warning");
        return;
      }
    }
    setDocumentoElegido(nuevo);
  };
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [productSearch, setProductSearch] = useState("");

  // The totals of the cart are the ones the backend computes when the sale
  // is created: the ITBIS of every line with the tax code of its product.
  const totales = useMemo(() => {
    const { subtotal, itbis, total } = calculateSaleTotals(carrito);
    return {
      subtotal,
      itbis,
      total,
      totalItems: carrito.reduce((acc, item) => acc + item.quantity, 0),
      // The label names the rate only when the whole cart pays it: with an
      // exempt line or with two rates it pays several, and "18%" would be a lie.
      itbisRateIsUniform:
        carrito.length > 0 &&
        carrito.every((item) => item.taxCode === TaxCode.ItbisTasa1),
    };
  }, [carrito]);

  const agregarAlCarrito = (producto: Product) => {
    setCarrito((prev) => {
      const existing = prev.find((item) => item.productId === producto.id);
      if (existing)
        return prev.map((item) =>
          item.productId === producto.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        );
      return [
        ...prev,
        {
          productId: producto.id,
          productName: producto.name,
          imageUrl: producto.imageUrl || "",
          unitPrice: producto.price,
          quantity: 1,
          subtotal: producto.price,
          taxCode: producto.taxCode ?? TaxCode.ItbisTasa1,
        },
      ];
    });
  };

  const actualizarCantidad = (productId: string, delta: number) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
              subtotal: Math.max(1, item.quantity + delta) * item.unitPrice,
            }
          : item,
      ),
    );
  };

  const eliminarDelCarrito = (productId: string) =>
    setCarrito((prev) => prev.filter((item) => item.productId !== productId));

  const buildSaleItems = () =>
    carrito.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.imageUrl || undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

  const validateAndSubmit = async (completar: boolean) => {
    if (carrito.length === 0) {
      addToast(t("ventas.cartEmptyWarning"), "warning");
      return;
    }
    const clienteElegido = selectedCliente;
    if (!clienteElegido) {
      addToast(t("ventas.selectClientWarning"), "warning");
      return;
    }

    const clienteData = clientes.find((c) => c.id === clienteElegido);

    if (documento === "credito" && !clienteData?.taxId) {
      addToast(t("ventas.fiscalCreditNeedsTaxId"), "warning");
      return;
    }

    const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);

    // A commercial invoice leaves without a fiscal document (it is only for
    // the taxpayer that invoices in the normal mode). The other two are the
    // document the backend issues.
    const esComercial = documento === "comercial";
    const documentType = documento === "credito" ? "FiscalCredit" : "Consumer";

    try {
      if (editingSaleId) {
        await updateVenta(editingSaleId, {
          clienteId: clienteElegido,
          clienteName: clienteData?.name || null,
          status: "Pending",
          total,
          notes: null,
          items: buildSaleItems(),
          documentType,
        } as UpdateSaleRequest);

        if (completar) {
          await completeVenta(editingSaleId, esComercial);
        }
      } else {
        if (!currentCompany) {
          addToast(companyError ?? t("ventas.NoCompanySelected"), "error");
          return;
        }

        const creada = await createVenta({
          companyId: currentCompany.id,
          clienteId: clienteElegido,
          clienteName: clienteData?.name || null,
          status: "Pending",
          total,
          notes: null,
          items: buildSaleItems(),
          documentType,
        } as CreateSaleRequest);

        // The sale is created pending and completed right away: the completion is what issues the document.
        if (completar && creada) {
          await completeVenta(creada.id, esComercial);
        }
      }
      addToast(
        completar ? t("ventas.saleCompleted") : t("ventas.draftSaved"),
        "success",
      );
      onSave();
    } catch (err) {
      addToast((err as Error).message, "error");
    }
  };

  // El cuerpo es uno solo: lo monta la pagina de la venta nueva.
  const cuerpo = (
    <div className={styles.posContainer}>
      <SelectorProducto
        productos={productos}
        onAddProduct={agregarAlCarrito}
        categoriaFilter={categoriaFilter}
        onCategoriaChange={setCategoriaFilter}
        searchTerm={productSearch}
        onSearchChange={setProductSearch}
      />
      <aside className={styles.rail}>
        <div className={styles.railHeader}>
          <h3>{t("ventas.currentSale")}</h3>
          <div className={styles.railHeaderActions}>
            <span className={styles.itemCount}>
              {t("ventas.itemCount", { count: totales.totalItems })}
            </span>
            <button
              className={styles.railClear}
              onClick={() => setCarrito([])}
              disabled={carrito.length === 0}
            >
              {t("ventas.emptyCart")}
            </button>
          </div>
        </div>
        <div className={styles.railBody}>
          <ClienteSelector
            clientes={clientes}
            selectedClienteId={selectedCliente}
            onClienteSelect={setSelectedCliente}
          />
          <Carrito
            items={carrito}
            onQuantityChange={actualizarCantidad}
            onRemoveItem={eliminarDelCarrito}
          />
        </div>
        <div className={styles.railFooter}>
          {sePuedeDescartar && (
            <div className={styles.descartarAccion}>
              <Button variant="ghost" size="small" onClick={descartar}>
                {t("ventas.discardSale")}
              </Button>
            </div>
          )}
          <ResumenVenta
            subtotal={totales.subtotal}
            itbis={totales.itbis}
            total={totales.total}
            itbisRateIsUniform={totales.itbisRateIsUniform}
            documento={documento}
            estado={editingVenta?.status === "Completed" ? "completada" : "pendiente"}
            onDocumentoChange={cambiarDocumento}
            onCompletarVenta={() => validateAndSubmit(true)}
            onGuardarBorrador={() => validateAndSubmit(false)}
            onCancelar={onCancel}
          />
        </div>
      </aside>
    </div>
  );

  return (
    <>
      {cuerpo}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
        title={t("ventas.cancelSaleTitle")}
        message={t("ventas.cancelSaleMessage")}
        confirmLabel={t("ventas.confirmCancelSale")}
        cancelLabel={t("common.cancel")}
        variant="warning"
      />
    </>
  );
}
