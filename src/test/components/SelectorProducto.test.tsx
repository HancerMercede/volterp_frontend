import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import "../../i18n";
import { SelectorProducto } from "../../pages/Ventas/components/SelectorProducto";
import type { Product } from "../../domain/types";

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

const renderSelector = () =>
  render(
    <SelectorProducto
      productos={[PRODUCT]}
      onAddProduct={vi.fn()}
      categoriaFilter="todos"
      onCategoriaChange={vi.fn()}
      searchTerm=""
      onSearchChange={vi.fn()}
    />,
  );

describe("SelectorProducto", () => {
  it("shows the product price with the shared currency format", () => {
    renderSelector();

    expect(screen.getByText("RD$ 32.00")).toBeInTheDocument();
  });

  it("offers the scanner placeholder in the search field", () => {
    renderSelector();

    expect(
      screen.getByPlaceholderText("Search or scan code..."),
    ).toBeInTheDocument();
  });

  it("shows the F2 shortcut badge", () => {
    renderSelector();

    expect(screen.getByText("F2")).toBeInTheDocument();
  });

  it("focuses the search field when F2 is pressed", async () => {
    renderSelector();

    await userEvent.keyboard("{F2}");

    expect(screen.getByRole("textbox")).toHaveFocus();
  });
});
