import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { Pos } from "../../pages/POS/Pos";
import { Ventas } from "../../pages/Ventas/Ventas";
import { useClienteStore } from "../../stores/clienteStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useProductoStore } from "../../stores/productoStore";
import { useUIStore } from "../../stores/uiStore";
import { useVentaStore } from "../../stores/ventaStore";
import type { Client, Company, Product } from "../../domain/types";

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

const renderEn = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes>
        <Route path="/pos" element={<Pos />} />
        <Route path="/ventas" element={<Ventas />} />
      </Routes>
    </MemoryRouter>,
  );

const esperarCuerpoDelPos = () => {
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

describe("la pagina del POS", () => {
  it("la ruta /pos dibuja el POS", () => {
    renderEn("/pos");

    esperarCuerpoDelPos();
  });

  it("la pagina del POS no es el overlay de las ventas", () => {
    const { container } = renderEn("/pos");

    expect(container.querySelector('[class*="modalFull"]')).toBeNull();
  });

  it("el overlay de /ventas abre el mismo cuerpo del POS", async () => {
    renderEn("/ventas");

    await userEvent.click(
      screen.getByRole("button", { name: /Nueva Venta/ }),
    );

    esperarCuerpoDelPos();
  });

  it("el overlay de /ventas se sigue dibujando como overlay", async () => {
    const { container } = renderEn("/ventas");

    await userEvent.click(
      screen.getByRole("button", { name: /Nueva Venta/ }),
    );

    expect(container.querySelector('[class*="modalFull"]')).not.toBeNull();
  });
});
