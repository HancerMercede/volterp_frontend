import { useState, useMemo, useCallback } from "react";
import type { CartItem, Product } from "../../domain/types";

export interface Totales {
  subtotal: number;
  itbis: number;
  total: number;
  totalItems: number;
}

export function useCarrito() {
  const [items, setItems] = useState<CartItem[]>([]);

  const totales = useMemo<Totales>(() => {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const itbis = subtotal * 0.18;
    const total = subtotal + itbis;
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    return { subtotal, itbis, total, totalItems };
  }, [items]);

  const addItem = useCallback((producto: Product) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.productId === producto.id);
      if (existingItem) {
        return prev.map((item) =>
          item.productId === producto.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          productId: producto.id,
          productName: producto.name,
          imageUrl: producto.imageUrl || "",
          unitPrice: producto.price,
          quantity: 1,
          subtotal: producto.price,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== Number(productId)));
  }, []);

  const updateQuantity = useCallback((productId: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newCantidad = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newCantidad,
            subtotal: newCantidad * item.unitPrice,
          };
        }
        return item;
      }),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    totales,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}