import { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../i18n";
import { VentasList } from "../../pages/Ventas/components/VentasList";
import type { SaleDto } from "../../domain/types";

const createVenta = (overrides: Partial<SaleDto> = {}): SaleDto =>
  ({
    id: '1',
    code: "Vent-001",
    companyId: '1',
    clienteId: null,
    clienteName: "Acme Corp",
    status: "Completed",
    total: 100,
    notes: null,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: null,
    items: [],
    ...overrides,
  }) as SaleDto;

const VENTAS = [
  createVenta(),
  createVenta({
    id: '2',
    code: "Vent-002",
    clienteName: "Other Corp",
  }),
];

function VentasListHarness({
  ventas,
  pageNumber = 1,
  totalCount = 50,
  onCancel = vi.fn(),
}: {
  ventas: SaleDto[];
  pageNumber?: number;
  totalCount?: number;
  onCancel?: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <MemoryRouter>
      <VentasList
        ventas={ventas}
        totalCount={totalCount}
        onVentaClick={vi.fn()}
        onDelete={vi.fn()}
        onCancel={onCancel}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        pageNumber={pageNumber}
        onPageChange={vi.fn()}
      />
    </MemoryRouter>
  );
}

const search = (term: string) => {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: term } });
};

const rowOf = (code: string): HTMLElement => {
  const row = within(screen.getByRole("table"))
    .getAllByRole("row")
    .find((candidate) => within(candidate).queryByText(code));

  if (!row) throw new Error(`No row for ${code}`);
  return row;
};

describe("VentasList", () => {
  it("finds a sale by its business code", () => {
    render(<VentasListHarness ventas={VENTAS} />);

    search("vent-001");

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.queryByText("Other Corp")).not.toBeInTheDocument();
  });

  it("keeps filtering by client name", () => {
    render(<VentasListHarness ventas={VENTAS} />);

    search("Other");

    expect(screen.getByText("Other Corp")).toBeInTheDocument();
    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
  });

  it("renders the business code column", () => {
    render(<VentasListHarness ventas={VENTAS} />);

    expect(screen.getByText("Vent-001")).toBeInTheDocument();
    expect(screen.getByText("Vent-002")).toBeInTheDocument();
  });

  it("shows the detail action for a completed sale and keeps the edit action for a pending one", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({ id: "1", code: "Vent-001", status: "Completed" }),
          createVenta({ id: "2", code: "Vent-002", status: "Pending" }),
        ]}
      />,
    );

    const detailAction = screen.getByTitle(i18n.t("common.detail"));
    expect(detailAction).toHaveAttribute("data-action", "detail");

    const editAction = screen.getByTitle(i18n.t("common.edit"));
    expect(editAction).toHaveAttribute("data-action", "edit");
  });

  it("shows the fiscal state of the sale in its own column, with the vocabulary of the DGII", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            electronicInvoiceId: "inv-1",
            fiscalState: "Rejected",
          }),
          createVenta({
            id: "2",
            code: "Vent-002",
            electronicInvoiceId: "inv-2",
            fiscalState: "InProcess",
          }),
        ]}
      />,
    );

    expect(screen.getByText(i18n.t("ventas.fiscalState"))).toBeInTheDocument();
    expect(
      within(rowOf("Vent-001")).getByText(
        i18n.t("ventas.fiscalStatus.rejected"),
      ),
    ).toBeInTheDocument();
    expect(
      within(rowOf("Vent-002")).getByText(
        i18n.t("ventas.fiscalStatus.inProcess"),
      ),
    ).toBeInTheDocument();
  });

  it("keeps the fiscal state apart from the payment status of the sale", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            status: "Completed",
            electronicInvoiceId: "inv-1",
            fiscalState: "Rejected",
          }),
        ]}
      />,
    );

    const row = rowOf("Vent-001");
    expect(
      within(row).getByText(i18n.t("ventas.completed")),
    ).toBeInTheDocument();
    expect(
      within(row).getByText(i18n.t("ventas.fiscalStatus.rejected")),
    ).toBeInTheDocument();
  });

  it("shows the state of the document of a sale that the DGII already accepted", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            electronicInvoiceId: "inv-1",
            fiscalState: null,
            fiscalStatus: "Accepted",
          }),
        ]}
      />,
    );

    const row = rowOf("Vent-001");
    expect(
      within(row).getByText(i18n.t("ventas.fiscalStatus.accepted")),
    ).toBeInTheDocument();
  });

  it("falls back to the coarse state while the document is still in flight", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            electronicInvoiceId: "inv-1",
            fiscalState: "PendingEmission",
            fiscalStatus: null,
          }),
        ]}
      />,
    );

    const row = rowOf("Vent-001");
    expect(
      within(row).getByText(i18n.t("ventas.fiscalStatus.pendingEmission")),
    ).toBeInTheDocument();
  });

  it("shows nothing in the fiscal column for a sale without a document", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            electronicInvoiceId: null,
            fiscalState: null,
          }),
        ]}
      />,
    );

    const row = rowOf("Vent-001");
    expect(
      within(row).queryByText(i18n.t("ventas.fiscalStatus.rejected")),
    ).not.toBeInTheDocument();
    expect(
      within(row).queryByText(i18n.t("ventas.fiscalStatus.inProcess")),
    ).not.toBeInTheDocument();
    expect(
      within(row).queryByText(i18n.t("ventas.fiscalStatus.pendingEmission")),
    ).not.toBeInTheDocument();
    expect(
      within(row).queryByText(i18n.t("ventas.fiscalStatus.accepted")),
    ).not.toBeInTheDocument();
  });

  it("renders every row of the page it receives, even on page 2", () => {
    const pageTwo = Array.from({ length: 10 }, (_, index) =>
      createVenta({
        id: index + 11,
        code: `Vent-0${index + 11}`,
        clienteName: `Cliente ${index + 11}`,
      }),
    );

    render(<VentasListHarness ventas={pageTwo} pageNumber={2} />);

    expect(screen.getByText("Cliente 11")).toBeInTheDocument();
    expect(screen.getByText("Cliente 20")).toBeInTheDocument();
    expect(screen.queryByText("Cliente 1")).not.toBeInTheDocument();
  });

  it("shows the fiscal state the backend sent", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            fiscalState: "Rejected",
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole("columnheader", { name: i18n.t("ventas.fiscalState") }),
    ).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  it("shows the empty fiscal state when the backend sends a value outside the contract", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            fiscalState:
              "NotAFiscalState" as unknown as SaleDto["fiscalState"],
          }),
        ]}
      />,
    );

    expect(screen.getByText(i18n.t("ventas.emptyValue"))).toBeInTheDocument();
    expect(screen.queryByText("NotAFiscalState")).not.toBeInTheDocument();
  });

  it("offers the cancel action only on a pending sale", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({ id: "1", code: "Vent-001", status: "Pending" }),
          createVenta({ id: "2", code: "Vent-002", status: "Completed" }),
        ]}
      />,
    );

    expect(
      within(rowOf("Vent-001")).getByRole("button", {
        name: i18n.t("ventas.cancelSale"),
      }),
    ).toBeInTheDocument();
    expect(
      within(rowOf("Vent-002")).queryByRole("button", {
        name: i18n.t("ventas.cancelSale"),
      }),
    ).not.toBeInTheDocument();
  });

  it("cancels the sale the cashier chose", () => {
    const onCancel = vi.fn();

    render(
      <VentasListHarness
        ventas={[
          createVenta({ id: "1", code: "Vent-001", status: "Pending" }),
        ]}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(
      within(rowOf("Vent-001")).getByRole("button", {
        name: i18n.t("ventas.cancelSale"),
      }),
    );

    expect(onCancel).toHaveBeenCalledWith("1");
  });

  it("shows a cancelled sale as cancelled", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            status: "Cancelled" as unknown as SaleDto["status"],
          }),
        ]}
      />,
    );

    expect(
      within(rowOf("Vent-001")).getByText(i18n.t("ventas.cancelled")),
    ).toBeInTheDocument();
  });

  it("links to the comprobantes module only for a sale with an electronic invoice", () => {
    render(
      <VentasListHarness
        ventas={[
          createVenta({
            id: "1",
            code: "Vent-001",
            electronicInvoiceId: "inv-1",
          }),
          createVenta({
            id: "2",
            code: "Vent-002",
            electronicInvoiceId: null,
          }),
        ]}
      />,
    );

    const link = screen.getByRole("link", {
      name: i18n.t("ventas.viewInvoice"),
    });
    expect(link).toHaveAttribute("href", "/facturacion/comprobantes");
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
