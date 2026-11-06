import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "../../i18n";
import { NuevaVenta } from "../../pages/Ventas/components/NuevaVenta";
import { useClienteStore } from "../../stores/clienteStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useProductoStore } from "../../stores/productoStore";
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
  useProductoStore.setState({ productos: [PRODUCT] });
  useClienteStore.setState({ clientes: [CLIENT] });
  useCompanyStore.setState({
    currentCompany: { id: "c1", name: "Acme Corp" } as Company,
  });
});

const renderPos = () =>
  render(
    <NuevaVenta editingSaleId={null} onSave={vi.fn()} onCancel={vi.fn()} />,
  );

describe("NuevaVenta", () => {
  it("renders the current sale rail with the item count", () => {
    renderPos();

    expect(screen.getByText("Current sale")).toBeInTheDocument();
    expect(screen.getByText("0 items")).toBeInTheDocument();
  });

  it("shows the selected client card after choosing a client", async () => {
    renderPos();

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Client" }),
      "c1",
    );

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("809-555-1201")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });

  it("counts the articles added to the cart", async () => {
    renderPos();

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(screen.getByText("1 item")).toBeInTheDocument();
  });
});
