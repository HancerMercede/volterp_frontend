import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../i18n";
import { NuevaVenta } from "../../pages/Ventas/components/NuevaVenta";
import { Ventas } from "../../pages/Ventas/Ventas";
import { useClienteStore } from "../../stores/clienteStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useProductoStore } from "../../stores/productoStore";
import { useUIStore } from "../../stores/uiStore";
import { useVentaStore } from "../../stores/ventaStore";
import type { Client, Company, Product } from "../../domain/types";

const PRODUCT: Product = {
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
};

const CLIENT: Client = {
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

beforeEach(() => {
  useProductoStore.setState({ productos: [PRODUCT], fetchProductos: vi.fn() });
  useClienteStore.setState({ clientes: [CLIENT], fetchClientes: vi.fn() });
  useCompanyStore.setState({
    currentCompany: { id: "c1", name: "Acme Corp" } as Company,
  });
  useVentaStore.setState({ ventas: [], createVenta: vi.fn(async () => {}) });
});

const renderPos = () =>
  render(
    <NuevaVenta editingSaleId={null} onSave={vi.fn()} onCancel={vi.fn()} />,
  );

const chooseClient = async () => {
  await userEvent.click(screen.getByRole("combobox", { name: "Client" }));
  await userEvent.click(screen.getByRole("button", { name: /Acme Corp/ }));
};

describe("NuevaVenta", () => {
  it("renders the current sale rail with the item count", () => {
    renderPos();

    expect(screen.getByText("Current sale")).toBeInTheDocument();
    expect(screen.getByText("0 items")).toBeInTheDocument();
  });

  it("shows the selected client card after choosing a client", async () => {
    renderPos();

    await chooseClient();

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("809-555-1201")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });

  it("counts the articles added to the cart", async () => {
    renderPos();

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(screen.getByText("1 item")).toBeInTheDocument();
  });

  it("creates the sale with the client id and the denormalized client name", async () => {
    const createVenta = vi.fn(async () => {});
    useVentaStore.setState({ createVenta });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({ clienteId: "c1", clienteName: "Acme Corp" }),
    );
  });

  it("does not create the sale without a client and warns instead", async () => {
    const createVenta = vi.fn(async () => {});
    const addToast = vi.fn();
    useVentaStore.setState({ createVenta });
    useUIStore.setState({ addToast });

    renderPos();

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(createVenta).not.toHaveBeenCalled();
    expect(addToast).toHaveBeenCalledWith("Select a client, please.", "warning");
  });

  it("loads the client collection with a page size of 100", () => {
    const fetchClientes = vi.fn();
    useClienteStore.setState({ fetchClientes });

    render(<Ventas />);

    expect(fetchClientes).toHaveBeenCalledWith(1, 100);
  });

  it("loads the product collection with a page size of 100", () => {
    const fetchProductos = vi.fn();
    useProductoStore.setState({ fetchProductos });

    renderPos();

    expect(fetchProductos).toHaveBeenCalledWith(1, 100);
  });
});
