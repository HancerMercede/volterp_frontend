import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MENU_GROUPS, MENU_ROUTES } from "../../domain/constants/menuRoutes";

const APP_FILE = join(process.cwd(), "src", "App.tsx");

/** The "path" of every <Route> of App.tsx. */
const readRouterPaths = (): string[] => {
  const content = readFileSync(APP_FILE, "utf8");
  const pattern = /<Route\s+path="([^"]+)"/g;
  const paths: string[] = [];

  for (const match of content.matchAll(pattern)) {
    paths.push(match[1]);
  }

  return paths;
};

/**
 * The routes that are not in the menu, with the reason why: every route of
 * the router is either in the menu or here.
 */
const OUT_OF_MENU: Record<string, string> = {
  "/login": "es publica: el menu es de las pantallas protegidas",
  "/forgot-password":
    "es publica: el menu es de las pantallas protegidas",
  "/reset-password": "es publica: el menu es de las pantallas protegidas",
  "/activate-account":
    "es publica: el menu es de las pantallas protegidas",
  "/invalid-link": "es publica: el menu es de las pantallas protegidas",
  "/nueva-venta":
    "se abre desde el boton de la lista de ventas: no es un item del menu",
};

describe("las rutas del menu y las del router no se separan", () => {
  const routerPaths = readRouterPaths();
  const menuPaths = MENU_ROUTES.filter((route) => !route.hidden).map(
    (route) => route.path,
  );
  const groupPrefixes = MENU_GROUPS.map((group) => group.prefix);

  it("el router declara sus rutas", () => {
    expect(routerPaths.length).toBeGreaterThan(0);
  });

  it("toda ruta del router esta en el menu o fuera de el con su razon", () => {
    const sinExplicar = routerPaths.filter(
      (path) => !menuPaths.includes(path) && !(path in OUT_OF_MENU),
    );

    expect(sinExplicar).toEqual([]);
  });

  it("toda pantalla del menu tiene su ruta en el router", () => {
    const sinRuta = menuPaths.filter((path) => !routerPaths.includes(path));

    expect(sinRuta).toEqual([]);
  });

  it("las rutas fuera del menu dicen por que no estan", () => {
    const sinRazon = Object.entries(OUT_OF_MENU).filter(
      ([, reason]) => reason.trim().length === 0,
    );

    expect(sinRazon).toEqual([]);
  });

  it("la lista de rutas fuera del menu no nombra rutas que el router no sirve", () => {
    const obsoletas = Object.keys(OUT_OF_MENU).filter(
      (path) => !routerPaths.includes(path),
    );

    expect(obsoletas).toEqual([]);
  });

  it("todo grupo del menu cuelga de una pantalla que el router sirve", () => {
    const sinPantalla = groupPrefixes.filter(
      (prefix) => !routerPaths.includes(prefix),
    );

    expect(sinPantalla).toEqual([]);
  });

  it("el menu no repite pantallas", () => {
    expect(new Set(menuPaths).size).toBe(menuPaths.length);
  });
});
