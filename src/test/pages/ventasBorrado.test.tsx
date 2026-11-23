import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { Ventas } from "../../pages/Ventas/Ventas";
import { useUIStore } from "../../stores/uiStore";
import { useVentaStore } from "../../stores/ventaStore";
import type { SaleDto } from "../../domain/types";

const VENTA: SaleDto = {
  id: "sale-1",
  code: "Vent-001",
  companyId: "c1",
  clienteId: null,
  clienteName: "Acme Corp",
  status: "Pending",
  total: 100,
  notes: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
  items: [],
  fiscalStatus: "Accepted",
  fiscalState: null,
};

const ERROR_DEL_BACK =
  "An error occurred while saving the entity changes. 23503: update or delete on table Sales violates foreign key constraint FK_ElectronicInvoices_Sales_SaleId";

const renderListado = () =>
  render(
    <MemoryRouter>
      <Ventas />
    </MemoryRouter>,
  );

const borrarLaVenta = async () => {
  await userEvent.click(screen.getByTitle("Eliminar"));
  await userEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }));
};

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  useVentaStore.setState({
    ventas: [VENTA],
    fetchVentas: vi.fn(),
    deleteVenta: vi.fn(async () => {
      throw new Error(ERROR_DEL_BACK);
    }),
    cancelVenta: vi.fn(),
  });
  useUIStore.setState({ addToast: vi.fn() });
});

describe("el borrado de una venta", () => {
  it("el boton de eliminar sigue disponible para una venta con comprobante", () => {
    renderListado();

    expect(screen.getByTitle("Eliminar")).toBeInTheDocument();
  });

  it("dice en espanol que el comprobante fiscal ya fue enviado", async () => {
    const addToast = vi.fn();
    useUIStore.setState({ addToast });

    renderListado();

    await borrarLaVenta();

    expect(addToast).toHaveBeenCalledWith(
      "No se puede eliminar: el comprobante fiscal ya fue enviado a la DGII",
      "error",
    );
  });

  it("nunca muestra el texto crudo del servidor", async () => {
    const addToast = vi.fn();
    useUIStore.setState({ addToast });

    renderListado();

    await borrarLaVenta();

    const mensaje = addToast.mock.calls[0]?.[0] as string;
    expect(mensaje).not.toContain("23503");
    expect(mensaje).not.toContain("foreign key");
  });

  it("una venta sin comprobante fiscal dice que no se pudo eliminar", async () => {
    const addToast = vi.fn();
    useUIStore.setState({ addToast });
    useVentaStore.setState({
      ventas: [{ ...VENTA, fiscalStatus: null, fiscalState: null }],
    });

    renderListado();

    await borrarLaVenta();

    expect(addToast).toHaveBeenCalledWith(
      "No se pudo eliminar la venta",
      "error",
    );
  });

  it("una venta con el comprobante sin enviar dice que no se pudo eliminar", async () => {
    const addToast = vi.fn();
    useUIStore.setState({ addToast });
    useVentaStore.setState({
      ventas: [{ ...VENTA, fiscalStatus: "Draft", fiscalState: null }],
    });

    renderListado();

    await borrarLaVenta();

    expect(addToast).toHaveBeenCalledWith(
      "No se pudo eliminar la venta",
      "error",
    );
  });
});
