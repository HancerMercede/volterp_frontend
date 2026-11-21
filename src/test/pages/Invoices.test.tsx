import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../i18n";
import { Invoices } from "../../pages/FacturacionElectronica/Invoices/Invoices";
import { electronicInvoiceService } from "../../infrastructure/api/electronicInvoiceService";
import { useElectronicInvoiceStore } from "../../stores/electronicInvoiceStore";
import { useUIStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import { NotificationContainer } from "../../components/UI";
import type {
  ElectronicInvoiceDto,
  ElectronicInvoiceStateDto,
  ElectronicInvoiceStateSurfaceDto,
} from "../../domain/types";

vi.mock("../../infrastructure/api/electronicInvoiceService", () => ({
  electronicInvoiceService: {
    getStateSurface: vi.fn(),
    retryInvoice: vi.fn(),
    getQrSvg: vi.fn(),
    getQrPng: vi.fn(),
    getPrintableInvoice: vi.fn(),
  },
}));

const mockService = electronicInvoiceService as unknown as {
  getStateSurface: ReturnType<typeof vi.fn>;
  retryInvoice: ReturnType<typeof vi.fn>;
  getQrSvg: ReturnType<typeof vi.fn>;
  getPrintableInvoice: ReturnType<typeof vi.fn>;
};

const REJECTED: ElectronicInvoiceStateDto = {
  id: "inv-rejected",
  saleId: "sale-1",
  encf: "B01P0000001",
  documentType: "Consumer",
  fiscalState: null,
  status: "Rejected",
  verdictNote: "Rechazado por la DGII",
  rawResponse: null,
  lastError: "Secuencia invalida",
  requiresReview: false,
  sentAt: "2026-11-19T10:00:00Z",
  receivedAt: null,
  nextCheckAt: "2026-11-19T11:00:00Z",
  statusCheckCount: 2,
  sequenceConsumed: null,
};

const ACCEPTED: ElectronicInvoiceStateDto = {
  id: "inv-accepted",
  saleId: "sale-2",
  encf: "B01P0000002",
  documentType: "FiscalCredit",
  fiscalState: "InProcess",
  status: "Sent",
  verdictNote: null,
  rawResponse: null,
  lastError: null,
  requiresReview: false,
  sentAt: "2026-11-19T12:00:00Z",
  receivedAt: "2026-11-19T12:30:00Z",
  nextCheckAt: null,
  statusCheckCount: 5,
  sequenceConsumed: true,
};

const SURFACE: ElectronicInvoiceStateSurfaceDto = {
  counts: {
    pendingEmission: 7,
    inProcess: 8,
    rejected: 9,
    requiresReview: 10,
    total: 34,
  },
  invoices: [REJECTED, ACCEPTED],
};

const RETRIED: ElectronicInvoiceDto = {
  id: "inv-rejected",
  companyId: "company-1",
  saleId: "sale-1",
  encf: "B01P0000001",
  documentType: "Consumer",
  issuerTaxId: "101010101",
  receiverTaxId: null,
  subtotal: 100,
  itbis: 18,
  total: 118,
  status: "Sent",
  trackId: null,
  securityCode: null,
  qrUrl: null,
  verdictNote: null,
  requiresReview: false,
  signedAt: null,
  sentAt: "2026-11-19T13:00:00Z",
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <Invoices />
      <NotificationContainer />
    </MemoryRouter>,
  );

const rowOf = (encf: string) =>
  screen.getByText(encf).closest("tr") as HTMLElement;

beforeAll(async () => {
  await i18n.changeLanguage("es");
  Object.defineProperty(URL, "createObjectURL", {
    writable: true,
    value: vi.fn(() => "blob:mock-url"),
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    writable: true,
    value: vi.fn(),
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  mockService.getStateSurface.mockResolvedValue(SURFACE);
  mockService.retryInvoice.mockResolvedValue(RETRIED);
  mockService.getQrSvg.mockResolvedValue(new Blob(["<svg/>"], { type: "image/svg+xml" }));
  mockService.getPrintableInvoice.mockResolvedValue(
    new Blob(["<html></html>"], { type: "text/html" }),
  );
  useElectronicInvoiceStore.setState({
    invoices: [],
    counts: null,
    loading: false,
    error: null,
  });
  useUIStore.setState({ toasts: [] });
  useAuthStore.setState({
    user: {
      username: "vendedor",
      email: "vendedor@acme.do",
      fullName: "Vendedor",
      role: "VENTAS",
      companyId: "company-1",
    },
    token: "token",
    isAuthenticated: true,
  });
});

describe("Invoices", () => {
  it("muestra los conteos que devuelve el backend", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Pendientes de emitir")).toBeInTheDocument(),
    );

    expect(screen.getByText("En proceso")).toBeInTheDocument();
    expect(screen.getByText("Rechazados")).toBeInTheDocument();
    expect(screen.getByText("Requieren revisión")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("34")).toBeInTheDocument();
  });

  it("muestra el veredicto y el error tal cual los manda el backend", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("B01P0000001")).toBeInTheDocument(),
    );

    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Rechazado por la DGII")).toBeInTheDocument();
    expect(screen.getByText("Secuencia invalida")).toBeInTheDocument();
    expect(screen.getByText("InProcess")).toBeInTheDocument();
    expect(screen.getByText("Consumer")).toBeInTheDocument();
  });

  it("reintenta el comprobante rechazado y avisa el resultado", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("B01P0000001")).toBeInTheDocument(),
    );

    await user.click(
      within(rowOf("B01P0000001")).getByRole("button", { name: "Reintentar" }),
    );

    await waitFor(() =>
      expect(mockService.retryInvoice).toHaveBeenCalledWith("inv-rejected"),
    );
    expect(await screen.findByText("Reintento enviado")).toBeInTheDocument();
  });

  it("muestra literal el error del backend cuando el reintento falla", async () => {
    mockService.retryInvoice.mockRejectedValue(
      new Error("DGII rechazo la secuencia"),
    );
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("B01P0000001")).toBeInTheDocument(),
    );

    await user.click(
      within(rowOf("B01P0000001")).getByRole("button", { name: "Reintentar" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "DGII rechazo la secuencia",
      ),
    );
  });

  it("muestra el QR del comprobante en su propia ventana", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("B01P0000001")).toBeInTheDocument(),
    );

    await user.click(
      within(rowOf("B01P0000001")).getByRole("button", { name: "Ver QR" }),
    );

    await waitFor(() =>
      expect(mockService.getQrSvg).toHaveBeenCalledWith("inv-rejected"),
    );
    const image = await screen.findByRole("img", { name: "B01P0000001" });
    expect(image).toHaveAttribute("src", "blob:mock-url");
  });

  it("abre la representacion impresa en una pestana nueva", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("B01P0000001")).toBeInTheDocument(),
    );

    await user.click(
      within(rowOf("B01P0000001")).getByRole("button", { name: "Imprimir" }),
    );

    await waitFor(() =>
      expect(mockService.getPrintableInvoice).toHaveBeenCalledWith(
        "inv-rejected",
      ),
    );
    expect(openSpy).toHaveBeenCalledWith("blob:mock-url", "_blank", "noopener");
    openSpy.mockRestore();
  });

  it("revoca los object URL al desmontar la pagina", async () => {
    const revokeObjectURL = vi.mocked(URL.revokeObjectURL);
    const user = userEvent.setup();
    const { unmount } = renderPage();

    await waitFor(() =>
      expect(screen.getByText("B01P0000001")).toBeInTheDocument(),
    );

    await user.click(
      within(rowOf("B01P0000001")).getByRole("button", { name: "Ver QR" }),
    );
    await screen.findByRole("img", { name: "B01P0000001" });

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("avisa cuando no hay comprobantes", async () => {
    mockService.getStateSurface.mockResolvedValue({
      counts: {
        pendingEmission: 0,
        inProcess: 0,
        rejected: 0,
        requiresReview: 0,
        total: 0,
      },
      invoices: [],
    });

    renderPage();

    expect(
      await screen.findByText("Todavía no hay comprobantes emitidos."),
    ).toBeInTheDocument();
  });

  it("filtra los comprobantes por el numero de e-NCF", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("B01P0000001")).toBeInTheDocument(),
    );

    await user.type(screen.getByRole("textbox"), "B01P0000002");

    expect(screen.queryByText("B01P0000001")).not.toBeInTheDocument();
    expect(screen.getByText("B01P0000002")).toBeInTheDocument();
  });

  it("no ofrece reintento en un comprobante que no lo necesita", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("B01P0000002")).toBeInTheDocument(),
    );

    expect(
      within(rowOf("B01P0000002")).queryByRole("button", { name: "Reintentar" }),
    ).not.toBeInTheDocument();
  });
});
