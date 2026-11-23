import { describe, expect, it } from "vitest";
import { buildMenuTree } from "../../../components/SideMenu";

describe("buildMenuTree", () => {
  it("cada segmento del path crea un nivel", () => {
    const tree = buildMenuTree([
      { path: "/ventas", label: "Ventas" },
      { path: "/ventas/facturas", label: "Facturas" },
      { path: "/ventas/facturas/nueva", label: "Nueva" },
    ]);

    expect(tree).toEqual([
      {
        id: "/ventas::group",
        label: "Ventas",
        href: "/ventas",
        children: [
          {
            id: "/ventas/facturas::group",
            label: "Facturas",
            href: "/ventas/facturas",
            children: [
              {
                id: "/ventas/facturas/nueva",
                label: "Nueva",
                href: "/ventas/facturas/nueva",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("el id de un nodo es su prefijo acumulado", () => {
    const tree = buildMenuTree([
      { path: "/ventas/facturas/nueva", label: "Nueva" },
    ]);

    expect(tree[0].id).toBe("/ventas");
    expect(tree[0].children?.[0].id).toBe("/ventas/facturas");
    expect(tree[0].children?.[0].children?.[0].id).toBe(
      "/ventas/facturas/nueva",
    );
  });

  it("las rutas con parametro, con comodin o ocultas no llegan al menu", () => {
    const tree = buildMenuTree([
      { path: "/ventas", label: "Ventas" },
      { path: "/ventas/:id", label: "Detalle" },
      { path: "/ventas/*", label: "Comodin" },
      { path: "/ventas/ocultas", label: "Ocultas", hidden: true },
    ]);

    expect(tree).toEqual([{ id: "/ventas", label: "Ventas", href: "/ventas" }]);
  });

  it("la etiqueta se infiere del segmento cuando la ruta no da una", () => {
    const tree = buildMenuTree([{ path: "/ventas/facturas" }]);

    expect(tree[0].label).toBe("Ventas");
    expect(tree[0].children?.[0].label).toBe("Facturas");
  });

  it("el orden es el campo order y, sin el, el orden de declaracion", () => {
    const tree = buildMenuTree([
      { path: "/c", label: "C" },
      { path: "/a", label: "A", order: 1 },
      { path: "/b", label: "B" },
      { path: "/d", label: "D", order: 0 },
    ]);

    expect(tree.map((item) => item.label)).toEqual(["D", "A", "C", "B"]);
  });

  it("el grupo que es tambien ruta lleva la pantalla del modulo en el titulo", () => {
    const tree = buildMenuTree([
      { path: "/ventas", label: "Ventas" },
      { path: "/ventas/facturas", label: "Facturas" },
    ]);

    expect(tree[0].id).toBe("/ventas::group");
    expect(tree[0].href).toBe("/ventas");
    expect(tree[0].children?.map((item) => item.id)).toEqual([
      "/ventas/facturas",
    ]);
  });

  it("el submenu del grupo lista solo las demas pantallas del modulo", () => {
    const tree = buildMenuTree([
      { path: "/ventas", label: "Ventas" },
      { path: "/ventas/facturas", label: "Facturas" },
      { path: "/ventas/recibos", label: "Recibos" },
    ]);

    // El nombre del modulo no se repite: el titulo ya es su pantalla.
    expect(tree[0].children?.map((item) => item.label)).toEqual([
      "Facturas",
      "Recibos",
    ]);
  });

  it("un grupo que no es ruta no lleva enlace en el titulo", () => {
    const tree = buildMenuTree([
      { path: "/ventas/facturas", label: "Facturas" },
      { path: "/pos", label: "POS", parent: "/ventas" },
    ]);

    expect(tree[0].href).toBeUndefined();
    expect(tree[0].children?.map((item) => item.label)).toEqual([
      "Facturas",
      "POS",
    ]);
  });

  it("la regla parent cuelga una ruta de un grupo cuyo prefijo no coincide con su path", () => {
    const tree = buildMenuTree([
      { path: "/ventas/facturas", label: "Facturas" },
      { path: "/pos", label: "POS", parent: "/ventas" },
    ]);

    expect(tree).toEqual([
      {
        id: "/ventas",
        label: "Ventas",
        children: [
          { id: "/ventas/facturas", label: "Facturas", href: "/ventas/facturas" },
          { id: "/pos", label: "POS", href: "/pos" },
        ],
      },
    ]);
  });

  it("la regla parent tambien funciona con un grupo que es tambien ruta", () => {
    const tree = buildMenuTree([
      { path: "/ventas", label: "Ventas" },
      { path: "/ventas/facturas", label: "Facturas" },
      { path: "/pos", label: "POS", parent: "/ventas" },
    ]);

    expect(tree[0].id).toBe("/ventas::group");
    expect(tree[0].href).toBe("/ventas");
    expect(tree[0].children?.map((item) => item.id)).toEqual([
      "/ventas/facturas",
      "/pos",
    ]);
  });

  it("la regla parent crea el grupo cuando ninguna ruta lo declara", () => {
    const tree = buildMenuTree([
      { path: "/pos", label: "POS", parent: "/ventas" },
    ]);

    expect(tree[0].id).toBe("/ventas");
    expect(tree[0].children?.map((item) => item.id)).toEqual(["/pos"]);
  });

  it("una ruta colgada de la raiz queda en la raiz del menu", () => {
    const tree = buildMenuTree([
      { path: "/pos", label: "POS", parent: "/" },
    ]);

    expect(tree.map((item) => item.id)).toEqual(["/pos"]);
  });

  it("los metadatos del grupo completan la etiqueta y el permiso", () => {
    const tree = buildMenuTree(
      [{ path: "/ventas/facturas", label: "Facturas" }],
      { "/ventas": { label: "Ventas", permission: "ventas.read" } },
    );

    expect(tree[0].label).toBe("Ventas");
    expect(tree[0].permission).toBe("ventas.read");
  });

  it("la ruta raiz es una hoja del menu", () => {
    const tree = buildMenuTree([{ path: "/", label: "Inicio" }]);

    expect(tree).toEqual([
      { id: "/", label: "Inicio", href: "/" },
    ]);
  });
});
