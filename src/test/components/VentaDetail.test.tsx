import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/electronicInvoiceService", () => ({
  electronicInvoiceService: {
    getById: vi.fn(),
    retry: vi.fn(),
    getQrBlob: vi.fn(),
    qrUrl: vi.fn(
      (id: string) =>
        `http://localhost:5106/api/ElectronicInvoices/${id}/qr.svg`,
    ),
  },
}));

import i18n from "../../i18n";
import { electronicInvoiceService } from "../../infrastructure/api/electronicInvoiceService";
import { VentaDetail } from "../../pages/Ventas/components/VentaDetail";
import type { ElectronicInvoiceDto, SaleDto } from "../../domain/types";

const QR_BLOB = new Blob(["<svg/>"], { type: "image/svg+xml" });

const invoice = (
  overrides: Partial<ElectronicInvoiceDto> = {},
): ElectronicInvoiceDto => ({
  id: "inv-1",
  companyId: "co-1",
  saleId: "sale-1",
  encf: "B0100000001",
  documentType: "Consumer",
  issuerTaxId: "1-01-00000-0-0",
  receiverTaxId: null,
  subtotal: 100,
  itbis: 18,
  total: 118,
  status: "Accepted",
  trackId: "track-1",
  securityCode: "s3cr3t",
  qrUrl: "https://dgii.do/verificar/1234",
  verdictNote: null,
  requiresReview: false,
  signedAt: "2026-11-01T10:00:00Z",
  sentAt: "2026-11-01T10:05:00Z",
  ...overrides,
});

const venta = (overrides: Partial<SaleDto> = {}): SaleDto => ({
  id: "sale-1",
  code: "Vent-001",
  companyId: "co-1",
  clienteId: null,
  clienteName: "Acme Corp",
  status: "Completed",
  total: 118,
  notes: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
  items: [],
  electronicInvoiceId: "inv-1",
  fiscalState: null,
  fiscalNote: null,
  ...overrides,
});

const renderDetail = (sale: SaleDto = venta()) =>
  render(
    <VentaDetail venta={sale} clienteId={sale.clienteId} onClose={vi.fn()} />,
  );

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(electronicInvoiceService.getById).mockResolvedValue(invoice());
  vi.mocked(electronicInvoiceService.getQrBlob).mockResolvedValue(QR_BLOB);
  Object.defineProperty(URL, "createObjectURL", {
    writable: true,
    value: vi.fn(() => "blob:qr-1"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    writable: true,
    value: vi.fn(),
  });
});

describe("VentaDetail fiscal document", () => {
  it("shows the state of the document with the vocabulary of the DGII", async () => {
    vi.mocked(electronicInvoiceService.getById).mockResolvedValue(
      invoice({ status: "Rejected" }),
    );

    renderDetail();

    expect(
      await screen.findByText(i18n.t("ventas.fiscalStatus.rejected")),
    ).toBeInTheDocument();
  });

  it("shows the verdict of the DGII", async () => {
    vi.mocked(electronicInvoiceService.getById).mockResolvedValue(
      invoice({
        status: "Rejected",
        verdictNote: "El RNC del receptor no existe en la DGII",
      }),
    );

    renderDetail();

    expect(
      await screen.findByText("El RNC del receptor no existe en la DGII"),
    ).toBeInTheDocument();
  });

  it("shows the QR of the document", async () => {
    renderDetail();

    const qr = await screen.findByAltText(i18n.t("ventas.fiscalQr"));
    expect(qr).toHaveAttribute("src", "blob:qr-1");
  });

  it("releases the QR when the detail closes", async () => {
    const { unmount } = renderDetail();

    await screen.findByAltText(i18n.t("ventas.fiscalQr"));
    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:qr-1");
  });

  it("asks the API to send the document again and shows the new state", async () => {
    vi.mocked(electronicInvoiceService.getById).mockResolvedValue(
      invoice({ status: "Rejected" }),
    );
    vi.mocked(electronicInvoiceService.retry).mockResolvedValue(
      invoice({ status: "Sent" }),
    );

    renderDetail();

    const retry = await screen.findByRole("button", {
      name: i18n.t("ventas.retryIssuance"),
    });
    await userEvent.click(retry);

    await waitFor(() =>
      expect(electronicInvoiceService.retry).toHaveBeenCalledWith("inv-1"),
    );
    expect(
      await screen.findByText(i18n.t("ventas.fiscalStatus.sent")),
    ).toBeInTheDocument();
  });

  it("offers the retry for a document that is waiting for a review", async () => {
    vi.mocked(electronicInvoiceService.getById).mockResolvedValue(
      invoice({ status: "Signed", requiresReview: true }),
    );

    renderDetail();

    expect(
      await screen.findByRole("button", {
        name: i18n.t("ventas.retryIssuance"),
      }),
    ).toBeInTheDocument();
  });

  it("does not offer the retry for a document the DGII already accepted", async () => {
    vi.mocked(electronicInvoiceService.getById).mockResolvedValue(
      invoice({ status: "Accepted" }),
    );

    renderDetail();

    expect(
      await screen.findByText(i18n.t("ventas.fiscalStatus.accepted")),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: i18n.t("ventas.retryIssuance") }),
    ).not.toBeInTheDocument();
  });

  it("shows no fiscal section for a sale without a document", async () => {
    renderDetail(
      venta({ electronicInvoiceId: null, fiscalState: null, fiscalNote: null }),
    );

    expect(
      screen.queryByText(i18n.t("ventas.fiscalDocument")),
    ).not.toBeInTheDocument();
    expect(electronicInvoiceService.getById).not.toHaveBeenCalled();
  });

  it("keeps showing the sale it showed before the fiscal section", async () => {
    renderDetail(
      venta({
        clienteName: "Acme Corp",
        total: 118,
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            productName: "Laptop Pro",
            quantity: 2,
            unitPrice: 50,
            subtotal: 100,
          },
        ],
      }),
    );

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Laptop Pro")).toBeInTheDocument();
    expect(screen.getByText("RD$ 118.00")).toBeInTheDocument();
  });

  it("counts the distinct products and not the lines of the sale", () => {
    renderDetail(
      venta({
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            productName: "Laptop Pro",
            quantity: 2,
            unitPrice: 50,
            subtotal: 100,
          },
          {
            id: "item-2",
            productId: "prod-1",
            productName: "Laptop Pro",
            quantity: 1,
            unitPrice: 50,
            subtotal: 50,
          },
        ],
      }),
    );

    // El back puede mandar el mismo producto en dos lineas: la etiqueta
    // cuenta los productos distintos.
    expect(
      screen.getByText(`${i18n.t("ventas.items")} · 1`),
    ).toBeInTheDocument();

    // Las unidades se quedan como estan: la suma de las lineas.
    expect(screen.getByText(`3 ${i18n.t("ventas.units")}`)).toBeInTheDocument();
  });
});
