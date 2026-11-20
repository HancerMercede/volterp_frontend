import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../i18n";
import { VentaDetail } from "../../pages/Ventas/components/VentaDetail";
import type { SaleDto } from "../../domain/types";

const createVenta = (overrides: Partial<SaleDto> = {}): SaleDto =>
  ({
    id: "1",
    code: "Vent-001",
    companyId: "1",
    clienteId: null,
    clienteName: "Acme Corp",
    status: "Completed",
    total: 5000,
    notes: null,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: null,
    items: [],
    documentType: null,
    receptorTaxId: null,
    issuerTaxId: null,
    subtotal: null,
    itbis: null,
    electronicInvoiceId: null,
    fiscalState: null,
    fiscalNote: null,
    ...overrides,
  }) as SaleDto;

function renderDetail(venta: SaleDto) {
  return render(
    <MemoryRouter>
      <VentaDetail venta={venta} clienteId={null} onClose={vi.fn()} />
    </MemoryRouter>,
  );
}

function fiscalSection() {
  const heading = screen.getByText(i18n.t("ventas.fiscalDetails"));
  const section = heading.closest("section");
  expect(section).not.toBeNull();
  return within(section as HTMLElement);
}

describe("VentaDetail", () => {
  it("shows the fiscal data the backend sent", () => {
    renderDetail(
      createVenta({
        documentType: "Consumer",
        issuerTaxId: "101",
        receptorTaxId: "202",
        subtotal: 1000,
        itbis: 180,
        fiscalState: "RequiresReview",
        fiscalNote: "Observación textual del backend",
      }),
    );

    const fiscal = fiscalSection();

    expect(fiscal.getByText("Consumer")).toBeInTheDocument();
    expect(fiscal.getByText("101")).toBeInTheDocument();
    expect(fiscal.getByText("202")).toBeInTheDocument();
    expect(fiscal.getByText("RD$ 1,000.00")).toBeInTheDocument();
    expect(fiscal.getByText("RD$ 180.00")).toBeInTheDocument();
    expect(fiscal.getByText("RequiresReview")).toBeInTheDocument();
    expect(
      fiscal.getByText("Observación textual del backend"),
    ).toBeInTheDocument();
  });

  it("shows an empty fiscal state when the sale has no fiscal data", () => {
    renderDetail(createVenta());

    expect(screen.getByText(i18n.t("ventas.noFiscalData"))).toBeInTheDocument();
  });

  it("links to the comprobantes module when the sale has an electronic invoice", () => {
    renderDetail(createVenta({ electronicInvoiceId: "inv-1" }));

    const link = screen.getByRole("link", {
      name: i18n.t("ventas.viewInvoice"),
    });
    expect(link).toHaveAttribute("href", "/facturacion/comprobantes");
  });

  it("does not link to the comprobantes module when the sale has no electronic invoice", () => {
    renderDetail(createVenta());

    expect(
      screen.queryByRole("link", { name: i18n.t("ventas.viewInvoice") }),
    ).not.toBeInTheDocument();
  });

  it("keeps showing the sale summary", () => {
    renderDetail(createVenta({ total: 5000 }));

    expect(screen.getByText("RD$ 5,000.00")).toBeInTheDocument();
  });
});
