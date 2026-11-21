import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import i18n from "../../i18n";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuthStore } from "../../stores/authStore";
import { usePermissionStore } from "../../stores/permissionStore";

/** Los permisos que tiene el llamante: los que el API le devolvio. */
const PERMISOS = [
  "dashboard.read",
  "ventas.read",
  "pos.read",
  "compras.read",
  "inventario.read",
  "clientes.read",
  "proveedores.read",
  "contabilidad.read",
  "rrhh.read",
  "proyectos.read",
  "reportes.read",
  "configuracion.read",
  "facturacion.read",
];

const renderSidebar = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Sidebar />
    </MemoryRouter>,
  );

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  usePermissionStore.setState({
    permissions: new Set(PERMISOS),
    status: "ready",
  });
  useAuthStore.setState({
    user: {
      username: "vendedor",
      email: "vendedor@volterp.do",
      fullName: "Ana Perez",
      roles: ["vendedor"],
      companyId: "c1",
    },
  });
});

describe("Sidebar", () => {
  it("un modulo con varias pantallas se dibuja como grupo con sus hijos", () => {
    renderSidebar("/ventas");

    const grupo = screen.getByRole("button", { name: "Ventas" });

    expect(grupo).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "POS" })).toBeInTheDocument();
  });

  it("el grupo que contiene la ruta activa se abre solo", () => {
    renderSidebar("/pos");

    expect(screen.getByRole("button", { name: "Ventas" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("link", { name: "POS" })).toBeInTheDocument();
  });

  it("la hoja activa se marca como la pagina actual", () => {
    renderSidebar("/pos");

    expect(screen.getByRole("link", { name: "POS" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Resumen" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("dentro de un grupo solo se marca la pantalla activa", () => {
    renderSidebar("/contabilidad/cuentas");

    expect(screen.getByRole("link", { name: "Cuentas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Resumen" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("button", { name: "Contabilidad" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("un modulo de una sola pantalla conserva el boton plano", () => {
    renderSidebar("/ventas");

    expect(screen.getByRole("link", { name: "Compras" })).toHaveAttribute(
      "href",
      "/compras",
    );
    expect(
      screen.queryByRole("button", { name: "Compras" }),
    ).toBeNull();
  });

  it("una pantalla sin permiso no aparece", () => {
    usePermissionStore.setState({
      permissions: new Set(PERMISOS.filter((p) => p !== "inventario.read")),
      status: "ready",
    });

    renderSidebar("/ventas");

    expect(screen.queryByRole("link", { name: "Inventario" })).toBeNull();
  });

  it("un modulo sin permiso se pierde entero, con sus hijos", () => {
    usePermissionStore.setState({
      permissions: new Set(PERMISOS.filter((p) => p !== "ventas.read")),
      status: "ready",
    });

    renderSidebar("/ventas");

    expect(screen.queryByRole("button", { name: "Ventas" })).toBeNull();
    expect(screen.queryByRole("link", { name: "POS" })).toBeNull();
  });
});
