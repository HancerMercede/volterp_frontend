import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildMenuTree, useMenuTree } from "../../../components/SideMenu";
import type { RouteDef } from "../../../components/SideMenu";

const ROUTES: RouteDef[] = [
  { path: "/ventas", label: "Ventas" },
  { path: "/ventas/facturas", label: "Facturas" },
];

describe("useMenuTree", () => {
  it("devuelve el arbol y la hoja activa del pathname", () => {
    const { result } = renderHook(() =>
      useMenuTree(ROUTES, { pathname: "/ventas/facturas/7" }),
    );

    expect(result.current.items).toEqual(buildMenuTree(ROUTES));
    expect(result.current.activeId).toBe("/ventas/facturas");
  });

  it("no vuelve a construir el arbol mientras las rutas y el pathname no cambian", () => {
    const { result, rerender } = renderHook(
      ({ pathname }: { pathname: string }) =>
        useMenuTree(ROUTES, { pathname }),
      { initialProps: { pathname: "/ventas" } },
    );

    const first = result.current.items;
    rerender({ pathname: "/ventas" });

    expect(result.current.items).toBe(first);
  });

  it("reconstruye el arbol cuando cambia el pathname", () => {
    const { result, rerender } = renderHook(
      ({ pathname }: { pathname: string }) =>
        useMenuTree(ROUTES, { pathname }),
      { initialProps: { pathname: "/ventas" } },
    );

    expect(result.current.activeId).toBe("/ventas");

    rerender({ pathname: "/ventas/facturas" });

    expect(result.current.activeId).toBe("/ventas/facturas");
  });
});
