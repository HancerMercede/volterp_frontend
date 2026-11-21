import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { NuevaVenta } from "../../pages/Ventas/components/NuevaVenta";
import { Ventas } from "../../pages/Ventas/Ventas";
import { useClienteStore } from "../../stores/clienteStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useProductoStore } from "../../stores/productoStore";
import { useUIStore } from "../../stores/uiStore";
import { useVentaStore } from "../../stores/ventaStore";
import type { Client, Company, Product, SaleDto } from "../../domain/types";

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
  taxCode: "ItbisTasa1",
};

const EXEMPT_PRODUCT: Product = {
  ...PRODUCT,
  id: "p2",
  code: "PRD-002",
  name: "Pan de huevo",
  taxCode: "Exento",
};

const RATE_TWO_PRODUCT: Product = {
  ...PRODUCT,
  id: "p3",
  code: "PRD-003",
  name: "Refresco",
  price: 50,
  taxCode: "ItbisTasa2",
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

  it("shows the ITBIS the backend computes for a cart taxed at 18%", async () => {
    renderPos();

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    // The backend rounds the ITBIS of the line to two decimals and adds it
    // to the subtotal: the cart shows the same three numbers.
    expect(screen.getByText("Subtotal").nextElementSibling).toHaveTextContent(
      "RD$ 32.00",
    );
    expect(screen.getByText("ITBIS (18%)").nextElementSibling).toHaveTextContent(
      "RD$ 5.76",
    );
    expect(screen.getByText("TOTAL").nextElementSibling).toHaveTextContent(
      "RD$ 37.76",
    );
  });

  it("shows no ITBIS for a cart with an exempt product", async () => {
    useProductoStore.setState({
      productos: [EXEMPT_PRODUCT],
      fetchProductos: vi.fn(),
    });

    renderPos();

    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));

    // The label does not name a rate that the cart does not pay.
    expect(screen.getByText("ITBIS")).toBeInTheDocument();
    expect(screen.queryByText("ITBIS (18%)")).toBeNull();
    expect(screen.getByText("ITBIS").nextElementSibling).toHaveTextContent(
      "RD$ 0.00",
    );
    expect(screen.getByText("TOTAL").nextElementSibling).toHaveTextContent(
      "RD$ 32.00",
    );
  });

  it("adds the ITBIS of every line when the cart mixes rates", async () => {
    useProductoStore.setState({
      productos: [PRODUCT, RATE_TWO_PRODUCT],
      fetchProductos: vi.fn(),
    });

    renderPos();

    await userEvent.click(
      screen.getAllByRole("button", { name: "Add to cart" })[0],
    );
    await userEvent.click(
      screen.getAllByRole("button", { name: "Add to cart" })[1],
    );

    // RD$ 32.00 at 18% is RD$ 5.76 and RD$ 50.00 at 16% is RD$ 8.00.
    expect(screen.getByText("Subtotal").nextElementSibling).toHaveTextContent(
      "RD$ 82.00",
    );
    expect(screen.getByText("ITBIS").nextElementSibling).toHaveTextContent(
      "RD$ 13.76",
    );
    expect(screen.getByText("TOTAL").nextElementSibling).toHaveTextContent(
      "RD$ 95.76",
    );
    expect(screen.queryByText("ITBIS (18%)")).toBeNull();
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


  it("creates the sale pending and completes it right away when the sale is checked out", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({ status: "Pending" }),
    );
    expect(completeVenta).toHaveBeenCalledWith(
      "sale-1",
      false,
    );
  });

  it("leaves the sale pending when the draft is saved", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: "Save Draft" }));

    expect(createVenta).toHaveBeenCalledTimes(1);
    expect(completeVenta).not.toHaveBeenCalled(
      "a draft is a pending sale: the seller completes it later",
    );
  });

  it("issues a consumption document by default, even when the client has a tax id", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    useVentaStore.setState({ createVenta });
    useClienteStore.setState({
      clientes: [{ ...CLIENT, taxId: "101500018" }],
    });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    // The consumption invoice is the one without fiscal value: it is the
    // default and it is valid at any amount.
    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({ documentType: "Consumer" }),
    );
  });

  it("refuses a fiscal credit when the client has no tax id", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const addToast = vi.fn();
    useVentaStore.setState({ createVenta });
    useUIStore.setState({ addToast });
    useClienteStore.setState({ clientes: [{ ...CLIENT, taxId: null }] });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(
      screen.getByRole("combobox", { name: "Document type" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /fiscal credit/i }),
    );

    // The choice was refused: the sale never became a fiscal credit.
    expect(createVenta).not.toHaveBeenCalled();
    expect(addToast).toHaveBeenCalledWith(
      "A fiscal credit needs the client tax id.",
      "warning",
    );
  });

  it("issues a consumption document when the client has no tax id", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    useVentaStore.setState({ createVenta });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({ documentType: "Consumer" }),
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

  it("discards a pending sale and goes back to the list", async () => {
    const cancelVenta = vi.fn(async () => {});
    const onCancel = vi.fn();
    useVentaStore.setState({ cancelVenta });

    render(
      <NuevaVenta editingSaleId="sale-1" onSave={vi.fn()} onCancel={onCancel} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: i18n.t("ventas.discardSale") }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: i18n.t("ventas.confirmCancelSale") }),
    );

    expect(cancelVenta).toHaveBeenCalledWith("sale-1");
    expect(onCancel).toHaveBeenCalled();
  });

  it("loads the client collection with a page size of 100", () => {
    const fetchClientes = vi.fn();
    useClienteStore.setState({ fetchClientes });

    render(
      <MemoryRouter>
        <Ventas />
      </MemoryRouter>,
    );

    expect(fetchClientes).toHaveBeenCalledWith(1, 100);
  });

  it("loads the product collection with a page size of 100", () => {
    const fetchProductos = vi.fn();
    useProductoStore.setState({ fetchProductos });

    renderPos();

    expect(fetchProductos).toHaveBeenCalledWith(1, 100);
  });
});
