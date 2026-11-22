import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import i18n from "../../i18n";
import { Sidebar } from "../../components/Layout/Sidebar";
import { useAuthStore } from "../../stores/authStore";
import { usePermissionStore } from "../../stores/permissionStore";

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
  it("un modulo con una sola pantalla se dibuja como enlace plano", () => {
    renderSidebar("/ventas");

    const ventas = screen.getByRole("link", { name: "Ventas" });

    expect(ventas).toHaveAttribute("href", "/ventas");
    expect(screen.queryByRole("button", { name: "Ventas" })).toBeNull();
  });

  it("la venta nueva no es un item del menu", () => {
    renderSidebar("/ventas");

    expect(screen.queryByRole("link", { name: "Nueva venta" })).toBeNull();
    expect(screen.queryByText("Nueva venta")).toBeNull();
  });

  it("la hoja activa se marca como la pagina actual", () => {
    renderSidebar("/ventas");

    expect(screen.getByRole("link", { name: "Ventas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("el enlace del modulo trae su icono", () => {
    renderSidebar("/ventas");

    const ventas = screen.getByRole("link", { name: "Ventas" });

    expect(ventas.querySelector("svg")).not.toBeNull();
  });

  it("cada pantalla del menu trae su icono", () => {
    renderSidebar("/ventas");

    for (const enlace of screen.getAllByRole("link")) {
      expect(enlace.querySelector("svg")).not.toBeNull();
    }
    for (const grupo of screen.getAllByRole("button")) {
      expect(grupo.querySelector("svg")).not.toBeNull();
    }
  });

  it("un modulo con varias pantallas se dibuja como grupo con sus hijos", () => {
    renderSidebar("/contabilidad/cuentas");

    const grupo = screen.getByRole("button", { name: "Contabilidad" });

    expect(grupo).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Cuentas" })).toBeInTheDocument();
  });

  it("dentro de un grupo solo se marca la pantalla activa", () => {
    renderSidebar("/contabilidad/cuentas");

    expect(screen.getByRole("link", { name: "Cuentas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Contabilidad" }),
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
      permissions: new Set(PERMISOS.filter((p) => p !== "contabilidad.read")),
      status: "ready",
    });

    renderSidebar("/ventas");

    expect(screen.queryByRole("button", { name: "Contabilidad" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Cuentas" })).toBeNull();
  });
});
