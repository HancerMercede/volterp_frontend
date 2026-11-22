import { describe, expect, it } from "vitest";
import { esVentaEditable } from "../../utils/ventas";

describe("que venta se puede editar", () => {
  it("la pendiente se sigue editando", () => {
    expect(esVentaEditable({ status: "Pending" })).toBe(true);
  });

  it("la completada ya facturo: se mira, no se toca", () => {
    expect(esVentaEditable({ status: "Completed" })).toBe(false);
  });

  it("la cancelada ya devolvio el stock: se mira, no se toca", () => {
    expect(esVentaEditable({ status: "Cancelled" })).toBe(false);
  });
});
