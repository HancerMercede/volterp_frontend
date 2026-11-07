import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { Compras } from "../../pages/Compras/Compras";
import { useCompraStore } from "../../stores/compraStore";
import { useProveedorStore } from "../../stores/proveedorStore";
import { useProductoStore } from "../../stores/productoStore";
import { useUIStore } from "../../stores/uiStore";
import type { Product, PurchaseDto, SupplierDto } from "../../domain/types";

const PROVEEDOR = {
  id: "s1",
  code: "SUP-001",
  name: "Distribuidora Aurora",
} as SupplierDto;

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
};

const PURCHASE: PurchaseDto = {
  id: "1",
  code: "COM-001",
  supplierId: null,
  supplierName: "Acme",
  status: "Pending",
  total: 100,
  notes: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
  items: [],
};

const calls: string[] = [];

beforeEach(() => {
  calls.length = 0;
  useUIStore.setState({
    addToast: () => {
      calls.push("toast");
    },
  });
  useCompraStore.setState({
    compras: [],
    totalCount: 0,
    pageCount: 0,
    loading: false,
    error: null,
    fetchCompras: vi.fn(),
    addCompra: vi.fn(),
    updateCompra: vi.fn(),
    deleteCompra: vi.fn(),
  });
  useProveedorStore.setState({
    proveedores: [PROVEEDOR],
    fetchProveedores: vi.fn(),
  });
  useProductoStore.setState({
    productos: [PRODUCTO],
    fetchProductos: vi.fn(),
  });
});

const fillForm = async () => {
  render(<Compras />);
  await userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(i18n.t("compras.newPurchase"), "i"),
    }),
  );
  await userEvent.click(
    screen.getByRole("combobox", {
      name: new RegExp(i18n.t("compras.supplier"), "i"),
    }),
  );
  await userEvent.click(
    screen.getByRole("button", { name: /Distribuidora Aurora/ }),
  );
  await userEvent.click(
    screen.getByRole("combobox", {
      name: new RegExp(i18n.t("compras.product"), "i"),
    }),
  );
  await userEvent.click(screen.getByRole("button", { name: /Leche entera/ }));
};

const submit = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: i18n.t("common.create") }),
  );
};

describe("Compras", () => {
  it("shows the created toast only after the purchase is created", async () => {
    useCompraStore.setState({
      addCompra: vi.fn(async () => {
        calls.push("post");
        return PURCHASE;
      }),
    });

    await fillForm();
    await submit();

    expect(calls).toEqual(["post", "toast"]);
  });

  it("shows the error and no toast when the purchase creation fails", async () => {
    useCompraStore.setState({
      addCompra: vi.fn(async () => {
        calls.push("post");
        throw new Error("Supplier is required");
      }),
    });

    await fillForm();
    await submit();

    expect(await screen.findByText("Supplier is required")).toBeInTheDocument();
    expect(calls).toEqual(["post"]);
  });

  it("loads the existing lines when editing a purchase", async () => {
    useCompraStore.setState({
      compras: [
        {
          ...PURCHASE,
          items: [
            {
              id: "i1",
              productId: "p1",
              productName: "Leche entera",
              productCode: "PRD-001",
              quantity: 2,
              unitPrice: 32,
              subtotal: 64,
            },
          ],
        },
      ],
    });

    render(<Compras />);
    await userEvent.click(screen.getByTitle("Editar"));

    expect(screen.getByText("Leche entera")).toBeInTheDocument();
  });

  it("keeps the created purchase in the list without reloading it", async () => {
    const fetchCompras = vi.fn();
    useCompraStore.setState({
      fetchCompras,
      addCompra: vi.fn(async () => {
        calls.push("post");
        return PURCHASE;
      }),
    });

    await fillForm();
    await submit();

    expect(fetchCompras).toHaveBeenCalledTimes(1);
  });
});
