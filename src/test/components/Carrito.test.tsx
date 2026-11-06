import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "../../i18n";
import { Carrito } from "../../pages/Ventas/components/Carrito";
import type { CartItem } from "../../domain/types";

const ITEM: CartItem = {
  productId: "p1",
  productName: "Leche entera",
  imageUrl: "",
  unitPrice: 32,
  quantity: 2,
  subtotal: 64,
};

describe("Carrito", () => {
  it("shows the unit price and the line total with the shared currency format", () => {
    render(
      <Carrito
        items={[ITEM]}
        onQuantityChange={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    );

    expect(screen.getByText("each RD$ 32.00")).toBeInTheDocument();
    expect(screen.getByText("RD$ 64.00")).toBeInTheDocument();
  });

  it("keeps the unit price on the same row as the quantity controls", () => {
    render(
      <Carrito
        items={[ITEM]}
        onQuantityChange={vi.fn()}
        onRemoveItem={vi.fn()}
      />,
    );

    const price = screen.getByText("each RD$ 32.00");
    const quantity = screen.getByText("2");

    expect(price.parentElement).toContainElement(quantity);
  });

  it("shows the empty state when there are no items", () => {
    render(
      <Carrito items={[]} onQuantityChange={vi.fn()} onRemoveItem={vi.fn()} />,
    );

    expect(screen.getByText("Cart is empty")).toBeInTheDocument();
  });
});
