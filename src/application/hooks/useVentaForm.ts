import { useState, useCallback } from "react";
import type {
  CartItem,
  Product,
  CreateSaleRequest,
  UpdateSaleRequest,
} from "../../domain/types";
import { useVentaStore } from "../../stores/ventaStore";
import { useClienteStore } from "../../stores/clienteStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useUIStore } from "../../stores/uiStore";
import { useTranslation } from "react-i18next";

export function useVentaForm() {
  const { t } = useTranslation();
  const { createVenta, updateVenta } = useVentaStore();
  const { clientes } = useClienteStore();
  const { currentCompany } = useCompanyStore();
  const { addToast } = useUIStore();

  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [editingSaleId, setEditingSaleId] = useState<number | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [clienteSearch, setClienteSearch] = useState("");
  const [ventaEstado, setVentaEstado] = useState<"pendiente" | "completada">("pendiente");

  const agregarAlCarrito = useCallback((producto: Product) => {
    setCarrito((prev) => {
      const existingItem = prev.find((item) => item.productId === producto.id);
      if (existingItem) {
        return prev.map((item) =>
          item.productId === producto.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: producto.id,
          productName: producto.name,
          imageUrl: producto.imageUrl || "",
          unitPrice: producto.price,
          quantity: 1,
          subtotal: producto.price,
        },
      ];
    });
  }, []);

  const actualizarCantidad = useCallback((productoId: number, delta: number) => {
    setCarrito((prev) =>
      prev.map((item) => {
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
  }, []);

  const eliminarDelCarrito = useCallback((productoId: number) => {
    setCarrito((prev) => prev.filter((item) => item.productId !== Number(productoId)));
  }, []);

  const handleCompletarVenta = useCallback(async () => {
    const match = clienteSearch.trim()
      ? clientes.find(
          (c) =>
            c.name.toLowerCase().includes(clienteSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(clienteSearch.toLowerCase()) ||
            (c.empresa && c.empresa.toLowerCase().includes(clienteSearch.toLowerCase())),
        )
      : null;

    const clienteElegido = selectedCliente || (match ? match.id : null);

    if (!clienteElegido) {
      addToast(t("ventas.selectClientWarning"), "warning");
      return false;
    }
    if (carrito.length === 0) {
      addToast(t("ventas.cartEmptyWarning"), "warning");
      return false;
    }
    if (!currentCompany) {
      addToast(t("ventas.NoCompanySelected"), "error");
      return false;
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
        const updateData: UpdateSaleRequest = {
          clienteId: clienteElegido,
          clienteName: clienteData?.name || null,
          status: ventaEstado === "completada" ? "Completed" : "Pending",
          total,
          notes: null,
          items: saleItems,
        };
        await updateVenta(editingSaleId, updateData);
      } else {
        const saleData: CreateSaleRequest = {
          companyId: currentCompany.id,
          clienteId: clienteElegido,
          clienteName: clienteData?.name || null,
          status: ventaEstado === "completada" ? "Completed" : "Pending",
          total,
          notes: null,
          items: saleItems,
        };
        await createVenta(saleData);
      }
      addToast(t("ventas.saleCompleted"), "success");
      return true;
    } catch (err) {
      addToast((err as Error).message, "error");
      return false;
    }
  }, [
    clienteSearch,
    clientes,
    selectedCliente,
    carrito,
    currentCompany,
    editingSaleId,
    ventaEstado,
    createVenta,
    updateVenta,
    addToast,
    t,
  ]);

  const handleGuardarBorrador = useCallback(async () => {
    const match = clienteSearch.trim()
      ? clientes.find(
          (c) =>
            c.name.toLowerCase().includes(clienteSearch.toLowerCase()) ||
            c.email.toLowerCase().includes(clienteSearch.toLowerCase()) ||
            (c.empresa && c.empresa.toLowerCase().includes(clienteSearch.toLowerCase())),
        )
      : null;

    const clienteElegido = selectedCliente || (match ? match.id : null);

    if (!clienteElegido || carrito.length === 0) {
      addToast(t("ventas.draftWarning"), "warning");
      return false;
    }
    if (!currentCompany) {
      addToast(t("ventas.NoCompanySelected"), "error");
      return false;
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
        const updateData: UpdateSaleRequest = {
          clienteId: clienteElegido,
          clienteName: clienteData?.name || null,
          status: "Pending",
          total,
          notes: null,
          items: saleItems,
        };
        await updateVenta(editingSaleId, updateData);
      } else {
        const saleData: CreateSaleRequest = {
          companyId: currentCompany.id,
          clienteId: clienteElegido,
          clienteName: clienteData?.name || null,
          status: "Pending",
          total,
          notes: null,
          items: saleItems,
        };
        await createVenta(saleData);
      }
      addToast(t("ventas.draftSaved"), "success");
      return true;
    } catch (err) {
      addToast((err as Error).message, "error");
      return false;
    }
  }, [
    clienteSearch,
    clientes,
    selectedCliente,
    carrito,
    currentCompany,
    editingSaleId,
    createVenta,
    updateVenta,
    addToast,
    t,
  ]);

  const handleSave = useCallback(async () => {
    // For now, just call completar
    return handleCompletarVenta();
  }, [handleCompletarVenta]);

  const reset = useCallback(() => {
    setCarrito([]);
    setSelectedCliente(null);
    setEditingSaleId(null);
    setClienteSearch("");
    setVentaEstado("pendiente");
  }, []);

  return {
    carrito,
    setCarrito,
    selectedCliente,
    setSelectedCliente,
    editingSaleId,
    setEditingSaleId,
    clienteSearch,
    setClienteSearch,
    ventaEstado,
    setVentaEstado,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    handleSave,
    handleGuardarBorrador,
    handleCompletarVenta,
    reset,
  };
}