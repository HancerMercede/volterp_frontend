import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../i18n";
import {
  EcfDocumentType,
  ReceivedElectronicInvoiceApprovalStatus,
} from "../../domain/constants/electronicInvoicing";
import type { ReceivedElectronicInvoiceDto } from "../../domain/types";
import { useReceivedElectronicInvoiceStore } from "../../stores/receivedElectronicInvoiceStore";
import { Reception } from "../../pages/FacturacionElectronica/Reception/Reception";

vi.mock("../../infrastructure/api/receivedElectronicInvoiceService", () => ({
  receivedElectronicInvoiceService: {
    decideCommercialApproval: vi.fn(),
  },
}));

vi.mock("../../hooks/usePermission", () => ({
  usePermission: () => ({
    hasPermission: () => true,
    canRead: () => true,
    canWrite: () => true,
    canDelete: () => false,
    getModulePermissions: () => undefined,
    isAdmin: false,
    userRole: "ventas",
  }),
}));

import { receivedElectronicInvoiceService } from "../../infrastructure/api/receivedElectronicInvoiceService";

const mockService = receivedElectronicInvoiceService as unknown as {
  decideCommercialApproval: ReturnType<typeof vi.fn>;
};

const RECEIVED: ReceivedElectronicInvoiceDto = {
  id: "invoice-123",
  issuerTaxId: "301010101",
  receiverTaxId: "101010101",
  encf: "B0100000001",
  documentType: EcfDocumentType.Consumer,
  signedAt: "2026-11-19T10:00:00Z",
  receivedAt: "2026-11-19T10:05:00Z",
  approvalStatus: ReceivedElectronicInvoiceApprovalStatus.Approved,
  approvalDecidedBy: "user@test.com",
  approvalDecidedAt: "2026-11-19T10:06:00Z",
  approvalReason: "Documento válido",
  alreadyReceived: false,
};

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  vi.clearAllMocks();
  useReceivedElectronicInvoiceStore.setState({
    decision: null,
    loading: false,
    error: null,
  });
  mockService.decideCommercialApproval.mockResolvedValue(RECEIVED);
});

const openTheForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: /Registrar decisión/ }));
};

describe("Reception", () => {
  it("muestra el estado vacío cuando todavía no hay decisión registrada", () => {
    render(<Reception />);

    expect(
      screen.getByText(
        "Registra la decisión comercial de un comprobante recibido.",
      ),
    ).toBeInTheDocument();
  });

  it("envía la aprobación con el id del comprobante y el motivo", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Reception />);

    await openTheForm(user);

    fireEvent.change(screen.getByLabelText(/Id del comprobante recibido/), {
      target: { value: "invoice-123" },
    });
    await user.selectOptions(screen.getByLabelText(/Decisión/), "approved");
    fireEvent.change(screen.getByLabelText(/Motivo/), {
      target: { value: "Documento válido" },
    });

    await user.click(screen.getByRole("button", { name: "Registrar decisión" }));

    await waitFor(() => {
      expect(mockService.decideCommercialApproval).toHaveBeenCalledWith(
        "invoice-123",
        { approved: true, reason: "Documento válido" },
      );
    });
  });

  it("envía el rechazo con el id del comprobante y el motivo", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Reception />);

    await openTheForm(user);

    fireEvent.change(screen.getByLabelText(/Id del comprobante recibido/), {
      target: { value: "invoice-123" },
    });
    await user.selectOptions(screen.getByLabelText(/Decisión/), "rejected");
    fireEvent.change(screen.getByLabelText(/Motivo/), {
      target: { value: "Comprobante duplicado" },
    });

    await user.click(screen.getByRole("button", { name: "Registrar decisión" }));

    await waitFor(() => {
      expect(mockService.decideCommercialApproval).toHaveBeenCalledWith(
        "invoice-123",
        { approved: false, reason: "Comprobante duplicado" },
      );
    });
  });

  it("muestra el DTO que devuelve el backend con el estado crudo", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Reception />);

    await openTheForm(user);

    fireEvent.change(screen.getByLabelText(/Id del comprobante recibido/), {
      target: { value: "invoice-123" },
    });
    await user.click(screen.getByRole("button", { name: "Registrar decisión" }));

    expect(await screen.findByText("301010101")).toBeInTheDocument();
    expect(screen.getByText("B0100000001")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("user@test.com")).toBeInTheDocument();
    expect(screen.getByText("Documento válido")).toBeInTheDocument();
  });

  it("muestra el error del backend cuando rechaza la decisión", async () => {
    const user = userEvent.setup({ delay: null });
    mockService.decideCommercialApproval.mockRejectedValue(
      new Error("The reason is required to reject a received invoice"),
    );

    render(<Reception />);

    await openTheForm(user);

    fireEvent.change(screen.getByLabelText(/Id del comprobante recibido/), {
      target: { value: "invoice-123" },
    });
    await user.selectOptions(screen.getByLabelText(/Decisión/), "rejected");
    await user.click(screen.getByRole("button", { name: "Registrar decisión" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The reason is required to reject a received invoice",
    );
  });
});
