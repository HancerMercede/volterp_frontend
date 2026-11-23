import { describe, expect, it } from "vitest";
import { buildMenuTree, matchActiveId } from "../../../components/SideMenu";

const ITEMS = buildMenuTree([
  { path: "/", label: "Inicio" },
  { path: "/ventas", label: "Ventas" },
  { path: "/ventas/facturas", label: "Facturas" },
]);

describe("matchActiveId", () => {
  it("gana el href con el prefijo mas largo que coincide", () => {
    expect(matchActiveId(ITEMS, "/ventas/facturas/123")).toBe(
      "/ventas/facturas",
    );
    // El titulo del grupo es un enlace: la pantalla del modulo es la activa.
    expect(matchActiveId(ITEMS, "/ventas")).toBe("/ventas::group");
  });

  it("la raiz solo coincide exactamente", () => {
    expect(matchActiveId(ITEMS, "/")).toBe("/");
    expect(matchActiveId(ITEMS, "/ventas")).toBe("/ventas::group");
  });

  it("una ruta que no esta en el menu no deja nada activo", () => {
    expect(matchActiveId(ITEMS, "/inventario")).toBeNull();
  });

  it("el prefijo no corta la palabra", () => {
    const items = buildMenuTree([{ path: "/ventas", label: "Ventas" }]);

    expect(matchActiveId(items, "/ventas-taller")).toBeNull();
  });

  it("la hoja colgada con parent se activa por su path", () => {
    const items = buildMenuTree([
      { path: "/ventas/facturas", label: "Facturas" },
      { path: "/pos", label: "POS", parent: "/ventas" },
    ]);

    expect(matchActiveId(items, "/pos")).toBe("/pos");
    expect(matchActiveId(items, "/ventas/facturas/9")).toBe(
      "/ventas/facturas",
    );
  });
});
