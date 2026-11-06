import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "../../i18n";
import { ResumenVenta } from "../../pages/Ventas/components/ResumenVenta";

const baseProps = {
  subtotal: 920,
  itbis: 165.6,
  total: 1085.6,
  ventaEstado: "pendiente" as const,
  onEstadoChange: vi.fn(),
  onCompletarVenta: vi.fn(),
  onGuardarBorrador: vi.fn(),
  onCancelar: vi.fn(),
};

describe("ResumenVenta", () => {
  it("puts the total on the checkout button", () => {
    render(<ResumenVenta {...baseProps} />);

    expect(
      screen.getByRole("button", { name: /Complete Sale RD\$ 1,085\.60/ }),
    ).toBeInTheDocument();
  });

  it("keeps the sale status control", () => {
    render(<ResumenVenta {...baseProps} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows the totals with the shared currency format", () => {
    render(<ResumenVenta {...baseProps} />);

    expect(screen.getByText("RD$ 920.00")).toBeInTheDocument();
    expect(screen.getByText("RD$ 165.60")).toBeInTheDocument();
    expect(screen.getByText("RD$ 1,085.60")).toBeInTheDocument();
  });
});
