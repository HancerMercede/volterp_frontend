import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { NuevaVentaPage } from "../../pages/NuevaVenta/NuevaVentaPage";
import { Ventas } from "../../pages/Ventas/Ventas";
import { useClienteStore } from "../../stores/clienteStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useProductoStore } from "../../stores/productoStore";
import { useUIStore } from "../../stores/uiStore";
import { useVentaStore } from "../../stores/ventaStore";
import type { Client, Company, Product, SaleDto } from "../../domain/types";

const PRODUCTO: Product = {
  id: "p1",
  code: "PRD-001",
  name: "Leche entera",
  category: "Lácteos",
  description: null,
  price: 32,
  stock: 10,
  categoryId: null,
  categoryName: "Lácteos",
  companyId: "c1",
  isActive: true,
  imageUrl: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
  taxCode: "ItbisTasa1",
};

const CLIENTE: Client = {
  id: "c1",
  code: "CLI-001",
  name: "Acme Corp",
  email: "ventas@acme.do",
  phone: "809-555-1201",
  address: "Calle 1",
  isActive: true,
  imageUrl: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
};

const VENTA_PENDIENTE: SaleDto = {
  id: "sale-1",
  code: "Vent-001",
  companyId: "c1",
  clienteId: "c1",
  clienteName: "Acme Corp",
  status: "Pending",
  total: 32,
  notes: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
  items: [
    {
      id: "i1",
      productId: "p1",
      productName: "Leche entera",
      quantity: 1,
      unitPrice: 32,
      subtotal: 32,
    },
  ],
  documentType: null,
};

const renderEn = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/nueva-venta" element={<NuevaVentaPage />} />
        <Route path="/ventas" element={<Ventas />} />
      </Routes>
    </MemoryRouter>,
  );

const esperarCuerpoDeLaVenta = () => {
  expect(
    screen.getByRole("heading", { name: "Productos" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Venta actual" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Resumen" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /Completar Venta/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByPlaceholderText("Buscar o escanear código..."),
  ).toBeInTheDocument();
};

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  useProductoStore.setState({
    productos: [PRODUCTO],
    fetchProductos: vi.fn(),
  });
  useClienteStore.setState({ clientes: [CLIENTE], fetchClientes: vi.fn() });
  useCompanyStore.setState({
    currentCompany: { id: "c1", name: "Acme Corp" } as Company,
  });
  useVentaStore.setState({ ventas: [], createVenta: vi.fn(async () => {}) });
  useUIStore.setState({ addToast: vi.fn() });
});

describe("la pagina de la venta nueva", () => {
  it("la ruta /nueva-venta dibuja la venta nueva", () => {
    renderEn("/nueva-venta");

    esperarCuerpoDeLaVenta();
  });

  it("la venta nueva no es un modal", () => {
    const { container } = renderEn("/nueva-venta");

    expect(container.querySelector('[class*="modalFull"]')).toBeNull();
  });

  it("la venta nueva no pone encabezado de pagina", () => {
    renderEn("/nueva-venta");

    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("la venta nueva se dibuja sin el layout de la app", () => {
    renderEn("/nueva-venta");

    // Sin menu lateral y sin el area de contenido: la venta nueva es una
    // pantalla de mostrador y ocupa la ventana.
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.querySelector("main")).toBeNull();
  });

  it("la ruta de la venta nueva cuelga del guard, no del layout", () => {
    const app = readFileSync(join(process.cwd(), "src", "App.tsx"), "utf8");

    expect(app).toMatch(
      /path="\/nueva-venta"[\s\S]{0,200}<ProtectedRoute>[\s\S]{0,200}<NuevaVentaPage \/>/,
    );

    const bloqueDelLayout = app.slice(
      app.indexOf("<Layout />"),
      app.lastIndexOf("</Route>"),
    );
    expect(bloqueDelLayout).not.toContain("/nueva-venta");
  });

  it("el boton de nueva venta de las ventas lleva a la venta nueva", async () => {
    renderEn("/ventas");

    await userEvent.click(
      screen.getByRole("button", { name: /Nueva Venta/ }),
    );

    esperarCuerpoDeLaVenta();
  });

  it("la venta nueva llena la ventana, sin margenes", () => {
    // El cuerpo de la venta nueva es el que ocupaba la pantalla: la caja
    // toma el alto del viewport y no deja bordes.
    const css = readFileSync(
      join(
        process.cwd(),
        "src",
        "pages",
        "Ventas",
        "components",
        "NuevaVenta.module.css",
      ),
      "utf8",
    );

    expect(css).toMatch(/\.posContainer\s*\{[^}]*height:\s*100vh/);
  });

  it("al completar una venta pendiente, la caja queda limpia para la siguiente", async () => {
    const completeVenta = vi.fn(async () => {});
    useVentaStore.setState({
      ventas: [VENTA_PENDIENTE],
      createVenta: vi.fn(async () => {}),
      updateVenta: vi.fn(async () => {}),
      completeVenta,
    });

    renderEn("/nueva-venta?venta=sale-1");

    expect(screen.getByText("1 artículo")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /Completar Venta/ }),
    );

    expect(completeVenta).toHaveBeenCalledWith("sale-1", true);

    // La caja queda para la siguiente venta: sin renglones y sin cliente.
    expect(screen.getByText("0 artículos")).toBeInTheDocument();
    expect(screen.queryByText("Acme Corp")).toBeNull();
  });

  it("al guardar un borrador, la caja queda limpia", async () => {
    const completeVenta = vi.fn();
    useVentaStore.setState({
      ventas: [],
      createVenta: vi.fn(async () => ({ id: "sale-2" }) as SaleDto),
      updateVenta: vi.fn(async () => {}),
      completeVenta,
    });

    renderEn("/nueva-venta");

    await userEvent.click(screen.getByRole("combobox", { name: "Cliente" }));
    await userEvent.click(screen.getByRole("button", { name: /Acme Corp/ }));
    await userEvent.click(
      screen.getByRole("button", { name: "Agregar al carrito" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Guardar Borrador" }),
    );

    // El borrador deja la caja limpia, como el completado: la venta queda
    // en el listado y la pantalla queda para la siguiente.
    expect(screen.getByText("0 artículos")).toBeInTheDocument();
    expect(screen.queryByText("Acme Corp")).toBeNull();
    expect(completeVenta).not.toHaveBeenCalled();
  });
});
