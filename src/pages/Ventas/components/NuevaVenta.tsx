import { useState, useMemo, useEffect, useRef } from "react";
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
  SaleDto,
  SaleItemDto,
  TipoDocumentoVenta,
} from "../../../domain/types";
import { calculateSaleTotals, TaxCode } from "../../../domain/constants/taxCodes";
import { ClienteSelector } from "./ClienteSelector";
import { Carrito } from "./Carrito";
import { SelectorProducto } from "./SelectorProducto";
import { ResumenVenta, type DocumentoVenta } from "./ResumenVenta";
import styles from "./NuevaVenta.module.css";

interface Props {
  editingSaleId: string | null;
  /**
   * El monto desde el que el comprobante tiene que nombrar a su comprador:
   * lo dice el backend (readiness), el front no lleva el numero.
   */
  buyerTaxIdRequiredFrom?: number;
  /** Una venta completada deja la caja vacia; un borrador no. */
  onSave: (completada: boolean) => void;
  onCancel: () => void;
}

/** El tipo que trae la venta que se edita: el credito fiscal o el comercial. */
const documentoDeLaVenta = (
  venta: SaleDto | null | undefined,
): DocumentoVenta | null => {
  if (!venta) return null;
  return venta.documentType === "FiscalCredit" ? "credito" : "comercial";
};

/**
 * Las lineas se agrupan por producto: el back puede mandar el mismo producto
 * en dos lineas y el PUT no reenvia duplicados.
 */
const agruparLineas = (
  items: SaleItemDto[],
  taxCodeOf: (item: SaleItemDto) => TaxCode,
): CartItem[] => {
  const porProducto = new Map<string, CartItem>();

  for (const item of items) {
    const linea = porProducto.get(item.productId);
    if (!linea) {
      porProducto.set(item.productId, {
        productId: item.productId,
        productName: item.productName,
        imageUrl: item.productImageUrl || "",
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.quantity * item.unitPrice,
        taxCode: taxCodeOf(item),
      });
      continue;
    }
    linea.quantity += item.quantity;
    linea.subtotal = linea.quantity * linea.unitPrice;
  }

  return [...porProducto.values()];
};

export function NuevaVenta({
  editingSaleId,
  buyerTaxIdRequiredFrom,
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
    editingVenta ? agruparLineas(editingVenta.items, taxCodeOfLine) : [],
  );
  const [selectedCliente, setSelectedCliente] = useState<string | null>(
    editingVenta?.clienteId ?? null,
  );
  // El comprador puede no estar en el padron de la compania: el cajero lo declara y lo nombra a mano.
  const ventaSinCliente = editingVenta?.clienteId === null;
  const [compradorSinRegistro, setCompradorSinRegistro] = useState<boolean>(
    ventaSinCliente,
  );
  const [nombreComprador, setNombreComprador] = useState<string>(
    ventaSinCliente ? (editingVenta?.clienteName ?? "") : "",
  );
  // El RNC del comprador es de la venta: el cajero lo escribe cuando el
  // comprador no tiene ficha.
  const [receptorTaxId, setReceptorTaxId] = useState<string>(
    ventaSinCliente ? (editingVenta?.receptorTaxId ?? "") : "",
  );
  const clienteData = clientes.find((c) => c.id === selectedCliente);
  // El RNC que nombra al comprador: con la bandera prendida es el que
  // escribio el cajero; con la apagada lo pone la ficha del cliente.
  const rncDelComprador = compradorSinRegistro
    ? receptorTaxId.trim()
    : clienteData?.taxId || "";
  // El default es el comercial: la venta sale sin comprobante fiscal.
  const [documentoElegido, setDocumentoElegido] = useState<DocumentoVenta | null>(
    documentoDeLaVenta(editingVenta),
  );
  const documento: DocumentoVenta = documentoElegido ?? "comercial";

  // La venta editada puede llegar despues del primer pintado: su tipo entra
  // cuando aparece y solo esa vez.
  const tipoDeLaVenta = useRef<string | null>(null);
  useEffect(() => {
    if (!editingVenta) return;
    if (tipoDeLaVenta.current === editingVenta.id) return;
    tipoDeLaVenta.current = editingVenta.id;
    setDocumentoElegido((elegido) => elegido ?? documentoDeLaVenta(editingVenta));
    setReceptorTaxId(
      (actual) =>
        actual ||
        (editingVenta.clienteId === null
          ? (editingVenta.receptorTaxId ?? "")
          : ""),
    );
    setCompradorSinRegistro(
      (actual) => actual || (editingVenta.clienteId === null),
    );
    setNombreComprador(
      (actual) =>
        actual ||
        (editingVenta.clienteId === null ? (editingVenta.clienteName ?? "") : ""),
    );
  }, [editingVenta]);

  // A fiscal credit needs the tax id of its buyer: without it the backend
  // refuses to complete the sale. The picker cannot disable the option, so
  // the choice is taken back and said out loud.
  const cambiarDocumento = (nuevo: DocumentoVenta) => {
    if (nuevo === "credito" && !rncDelComprador) {
      addToast(t("ventas.fiscalCreditNeedsTaxId"), "warning");
      return;
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

  // Los controles trabajan por linea y no por producto: una venta puede
  // llevar el mismo producto en dos lineas.
  const actualizarCantidad = (index: number, delta: number) => {
    setCarrito((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
              subtotal: Math.max(1, item.quantity + delta) * item.unitPrice,
            }
          : item,
      ),
    );
  };

  const eliminarDelCarrito = (index: number) =>
    setCarrito((prev) => prev.filter((_, i) => i !== index));

  const buildSaleItems = () =>
    carrito.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.imageUrl || undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

  // La caja queda para la siguiente venta: sin renglones, sin cliente, sin
  // el nombre del comprador y sin el RNC del comprador (es de el). El
  // borrador limpia igual que el completado.
  const limpiarLaCaja = () => {
    setCarrito([]);
    setSelectedCliente(null);
    setCompradorSinRegistro(false);
    setNombreComprador("");
    setDocumentoElegido(null);
    setReceptorTaxId("");
  };

  const validateAndSubmit = async (completar: boolean) => {
    if (carrito.length === 0) {
      addToast(t("ventas.cartEmptyWarning"), "warning");
      return;
    }
    // Con la bandera prendida el comprador no esta en el padron: la venta sale con el nombre escrito a mano.
    if (compradorSinRegistro && !nombreComprador.trim()) {
      addToast(t("ventas.buyerNameRequired"), "warning");
      return;
    }
    if (!compradorSinRegistro && !selectedCliente) {
      addToast(t("ventas.selectClientWarning"), "warning");
      return;
    }

    if (documento === "credito" && !rncDelComprador) {
      addToast(t("ventas.fiscalCreditNeedsTaxId"), "warning");
      return;
    }

    // El consumo (E32) es nominativo desde el monto que dice el backend: sin
    // el RNC del comprador el comprobante no sale. Solo avisa al completar:
    // el borrador puede esperar a que el cajero lo pida.
    if (
      completar &&
      documento !== "credito" &&
      buyerTaxIdRequiredFrom !== undefined &&
      totales.total >= buyerTaxIdRequiredFrom &&
      !rncDelComprador
    ) {
      addToast(t("ventas.buyerTaxIdRequired"), "warning");
      return;
    }

    const clienteId = compradorSinRegistro ? null : selectedCliente;
    const clienteName = compradorSinRegistro
      ? nombreComprador.trim()
      : clienteData?.name || null;
    // El RNC solo viaja cuando el comprador no tiene ficha: con la bandera
    // apagada lo pone la ficha del cliente y el front no opina.
    const receptorTaxIdDeLaVenta = compradorSinRegistro
      ? receptorTaxId.trim() || undefined
      : undefined;

    const total = carrito.reduce((acc, item) => acc + item.subtotal, 0);

    // La factura comercial sale sin comprobante fiscal: el back la marca con
    // la bandera y no emite documento.
    const esComercial = documento === "comercial";
    const documentType: TipoDocumentoVenta =
      documento === "credito" ? "FiscalCredit" : "Consumer";

    try {
      if (editingSaleId) {
        await updateVenta(editingSaleId, {
          clienteId,
          clienteName,
          status: "Pending",
          total,
          notes: null,
          items: buildSaleItems(),
          documentType,
          receptorTaxId: receptorTaxIdDeLaVenta,
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
          clienteId,
          clienteName,
          status: "Pending",
          total,
          notes: null,
          items: buildSaleItems(),
          documentType,
          isCommercialInvoice: esComercial,
          receptorTaxId: receptorTaxIdDeLaVenta,
        } as CreateSaleRequest);

        // The sale is created pending and completed right away: the completion is what issues the document.
        if (completar && creada) {
          await completeVenta(creada.id, esComercial);
        }
      }
      addToast(
        completar
          ? esComercial
            ? t("ventas.saleCompletedWithoutDocument")
            : t("ventas.saleCompleted")
          : t("ventas.draftSaved"),
        "success",
      );
      limpiarLaCaja();
      onSave(completar);
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
          {!compradorSinRegistro && (
            <ClienteSelector
              clientes={clientes}
              selectedClienteId={selectedCliente}
              onClienteSelect={setSelectedCliente}
            />
          )}
          <label className={styles.compradorFlag}>
            <input
              type="checkbox"
              checked={compradorSinRegistro}
              onChange={(e) => {
                setCompradorSinRegistro(e.target.checked);
                if (e.target.checked) setSelectedCliente(null);
              }}
            />
            {t("ventas.buyerNotRegistered")}
          </label>
          {compradorSinRegistro && (
            <>
              <div className={styles.compradorCampo}>
                <label
                  className={styles.compradorLabel}
                  htmlFor="nombre-comprador"
                >
                  {t("ventas.buyerName")}
                </label>
                <input
                  id="nombre-comprador"
                  className={styles.compradorInput}
                  type="text"
                  value={nombreComprador}
                  onChange={(e) => setNombreComprador(e.target.value)}
                />
              </div>
              <div className={styles.compradorCampo}>
                <label className={styles.compradorLabel} htmlFor="rnc-comprador">
                  {t("ventas.buyerTaxId")}
                </label>
                <input
                  id="rnc-comprador"
                  className={styles.compradorInput}
                  type="text"
                  inputMode="numeric"
                  value={receptorTaxId}
                  onChange={(e) => setReceptorTaxId(e.target.value)}
                />
                <span className={styles.compradorHint}>
                  {t("ventas.buyerNotRegisteredHint")}
                </span>
              </div>
            </>
          )}
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
