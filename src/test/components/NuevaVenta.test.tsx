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

// Una venta que llega al monto desde el que el comprobante tiene que
// nombrar a su comprador.
const BIG_PRODUCT: Product = {
  ...PRODUCT,
  id: "p4",
  code: "PRD-004",
  name: "Aire acondicionado",
  price: 250000,
  stock: 5,
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

const PENDING_SALE: SaleDto = {
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
  documentType: "FiscalCredit",
};

beforeEach(() => {
  useProductoStore.setState({ productos: [PRODUCT], fetchProductos: vi.fn() });
  useClienteStore.setState({ clientes: [CLIENT], fetchClientes: vi.fn() });
  useCompanyStore.setState({
    currentCompany: { id: "c1", name: "Acme Corp" } as Company,
  });
  useVentaStore.setState({ ventas: [], createVenta: vi.fn(async () => {}) });
});

const renderPos = (buyerTaxIdRequiredFrom?: number) =>
  render(
    <NuevaVenta
      editingSaleId={null}
      buyerTaxIdRequiredFrom={buyerTaxIdRequiredFrom}
      onSave={vi.fn()}
      onCancel={vi.fn()}
    />,
  );

const renderEditando = (venta: SaleDto, buyerTaxIdRequiredFrom?: number) => {
  useVentaStore.setState({ ventas: [venta] });
  return render(
    <NuevaVenta
      editingSaleId={venta.id}
      buyerTaxIdRequiredFrom={buyerTaxIdRequiredFrom}
      onSave={vi.fn()}
      onCancel={vi.fn()}
    />,
  );
};

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
      true,
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

  it("issues a sale without a document by default, even when the client has a tax id", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    useVentaStore.setState({ createVenta });
    useClienteStore.setState({
      clientes: [{ ...CLIENT, taxId: "101500018" }],
    });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    // La venta sin comprobante viaja con la bandera del back: el documento
    // lo decide el back, no el front.
    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: "Consumer",
        isCommercialInvoice: true,
      }),
    );
  });

  it("issues the sale without a document by default", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: "Consumer",
        isCommercialInvoice: true,
      }),
    );
    expect(completeVenta).toHaveBeenCalledWith("sale-1", true);
  });

  it("brings the type of the sale that is being completed", () => {
    renderEditando(PENDING_SALE);

    expect(screen.getByRole("combobox", { name: "Document type" })).toHaveValue(
      "Fiscal credit (E31)",
    );
  });

  it("brings the commercial type when the sale has no document", () => {
    renderEditando({ ...PENDING_SALE, documentType: null });

    expect(screen.getByRole("combobox", { name: "Document type" })).toHaveValue(
      "Commercial invoice (no document)",
    );
  });

  it("brings the commercial type when the sale has a consumption document", () => {
    renderEditando({ ...PENDING_SALE, documentType: "Consumer" });

    // Toda venta que no es un credito fiscal se completa como comercial.
    expect(screen.getByRole("combobox", { name: "Document type" })).toHaveValue(
      "Commercial invoice (no document)",
    );
  });

  it("clears the cart and the client when the sale is completed", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(screen.getByText("1 item")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(screen.getByText("0 items")).toBeInTheDocument();
    expect(screen.queryByText("Acme Corp")).toBeNull();
  });

  it("clears the cart and the client when the sale is saved as a draft", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    useVentaStore.setState({ createVenta });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: "Save Draft" }));

    // El borrador deja la caja limpia, como el completado.
    expect(screen.getByText("0 items")).toBeInTheDocument();
    expect(screen.queryByText("Acme Corp")).toBeNull();
  });

  it("completes the sale that is being edited without creating another one", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-2" }) as SaleDto);
    const updateVenta = vi.fn(async () => {});
    const completeVenta = vi.fn();
    useVentaStore.setState({ createVenta, updateVenta, completeVenta });

    renderEditando({ ...PENDING_SALE, documentType: null });

    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    // La venta cargada del listado se completa: no se crea otra.
    expect(updateVenta).toHaveBeenCalledWith("sale-1", expect.anything());
    expect(completeVenta).toHaveBeenCalledWith("sale-1", true);
    expect(createVenta).not.toHaveBeenCalled();
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
      "A fiscal credit needs the buyer's tax ID.",
      "warning",
    );
  });

  it("carries the tax id of the buyer the cashier typed in the sale", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });

    renderPos();

    await chooseClient();
    await userEvent.type(screen.getByLabelText("Buyer tax ID"), "101500018");
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({ receptorTaxId: "101500018" }),
    );
  });

  it("carries the tax id of the buyer in the update of a pending sale", async () => {
    const updateVenta = vi.fn(async () => {});
    const completeVenta = vi.fn();
    useVentaStore.setState({ updateVenta, completeVenta });

    renderEditando(PENDING_SALE);

    await userEvent.type(screen.getByLabelText("Buyer tax ID"), "101500018");
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(updateVenta).toHaveBeenCalledWith(
      "sale-1",
      expect.objectContaining({ receptorTaxId: "101500018" }),
    );
  });

  it("shows the tax id of the buyer that the pending sale carries", () => {
    renderEditando({ ...PENDING_SALE, receptorTaxId: "101500018" });

    expect(screen.getByLabelText("Buyer tax ID")).toHaveValue("101500018");
  });

  it("accepts a fiscal credit when the cashier types the tax id and the client has none", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    const addToast = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });
    useUIStore.setState({ addToast });
    useClienteStore.setState({ clientes: [{ ...CLIENT, taxId: null }] });

    renderPos();

    await chooseClient();
    await userEvent.type(screen.getByLabelText("Buyer tax ID"), "101500018");
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(
      screen.getByRole("combobox", { name: "Document type" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /fiscal credit/i }),
    );
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(addToast).not.toHaveBeenCalledWith(
      "A fiscal credit needs the buyer's tax ID.",
      "warning",
    );
    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: "FiscalCredit",
        receptorTaxId: "101500018",
      }),
    );
  });

  it("clears the tax id of the buyer when the caja is cleared", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });

    renderPos();

    await chooseClient();
    await userEvent.type(screen.getByLabelText("Buyer tax ID"), "101500018");
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(screen.getByLabelText("Buyer tax ID")).toHaveValue("");
  });

  it("warns when the consumption reaches the amount that has to name its buyer", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    const addToast = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });
    useUIStore.setState({ addToast });
    useProductoStore.setState({ productos: [BIG_PRODUCT], fetchProductos: vi.fn() });

    renderPos(250000);

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(addToast).toHaveBeenCalledWith(
      "This document needs the buyer's tax ID.",
      "warning",
    );
    expect(createVenta).not.toHaveBeenCalled();
  });

  it("does not warn when the consumption is below the amount that has to name its buyer", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    const completeVenta = vi.fn();
    const addToast = vi.fn();
    useVentaStore.setState({ createVenta, completeVenta });
    useUIStore.setState({ addToast });

    renderPos(250000);

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(addToast).not.toHaveBeenCalledWith(
      "This document needs the buyer's tax ID.",
      "warning",
    );
    expect(createVenta).toHaveBeenCalled();
  });

  it("issues the sale without a document when the client has no tax id", async () => {
    const createVenta = vi.fn(async () => ({ id: "sale-1" }) as SaleDto);
    useVentaStore.setState({ createVenta });

    renderPos();

    await chooseClient();
    await userEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(createVenta).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: "Consumer",
        isCommercialInvoice: true,
      }),
    );
  });

  it("groups the lines of the same product into one line of the cart", () => {
    const ventaConLineasRepetidas: SaleDto = {
      ...PENDING_SALE,
      items: [
        {
          id: "i1",
          productId: "p1",
          productName: "Leche entera",
          quantity: 2,
          unitPrice: 32,
          subtotal: 64,
        },
        {
          id: "i2",
          productId: "p1",
          productName: "Leche entera",
          quantity: 3,
          unitPrice: 32,
          subtotal: 96,
        },
      ],
    };

    renderEditando(ventaConLineasRepetidas);

    // El back puede mandar el mismo producto en dos lineas: el carrito las
    // junta en una sola, con la cantidad sumada y el subtotal recalculado.
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("TOTAL").nextElementSibling).toHaveTextContent(
      "RD$ 188.80",
    );
  });

  it("does not send the duplicated lines back when the sale is completed", async () => {
    const updateVenta = vi.fn(async () => {});
    const completeVenta = vi.fn();
    useVentaStore.setState({ updateVenta, completeVenta });
    useVentaStore.setState({
      ventas: [
        {
          ...PENDING_SALE,
          documentType: null,
          items: [
            {
              id: "i1",
              productId: "p1",
              productName: "Leche entera",
              quantity: 2,
              unitPrice: 32,
              subtotal: 64,
            },
            {
              id: "i2",
              productId: "p1",
              productName: "Leche entera",
              quantity: 3,
              unitPrice: 32,
              subtotal: 96,
            },
          ],
        },
      ],
    });

    render(
      <NuevaVenta editingSaleId="sale-1" onSave={vi.fn()} onCancel={vi.fn()} />,
    );

    await userEvent.click(screen.getByRole("button", { name: /Complete Sale/ }));

    expect(updateVenta).toHaveBeenCalledWith(
      "sale-1",
      expect.objectContaining({
        items: [
          expect.objectContaining({
            productId: "p1",
            quantity: 5,
            subtotal: 160,
          }),
        ],
      }),
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
