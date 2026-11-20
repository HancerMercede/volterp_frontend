import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/electronicInvoiceService", () => ({
  electronicInvoiceService: {
    getStateSurface: vi.fn(),
    retryInvoice: vi.fn(),
    getQrSvg: vi.fn(),
    getQrPng: vi.fn(),
    getPrintableInvoice: vi.fn(),
  },
}));

vi.mock("../../infrastructure/api/companyEmissionModeService", () => ({
  companyEmissionModeService: {
    getEmissionMode: vi.fn(),
    updateContingency: vi.fn(),
    updateEmissionMode: vi.fn(),
  },
}));

vi.mock("../../infrastructure/api/apiCredentialService", () => ({
  apiCredentialService: {
    getCredentials: vi.fn(),
    createCredential: vi.fn(),
    deleteCredential: vi.fn(),
  },
}));

vi.mock("../../infrastructure/api/receivedElectronicInvoiceService", () => ({
  receivedElectronicInvoiceService: {
    decideCommercialApproval: vi.fn(),
  },
}));

import { electronicInvoiceService } from "../../infrastructure/api/electronicInvoiceService";
import { companyEmissionModeService } from "../../infrastructure/api/companyEmissionModeService";
import { apiCredentialService } from "../../infrastructure/api/apiCredentialService";
import { receivedElectronicInvoiceService } from "../../infrastructure/api/receivedElectronicInvoiceService";
import { useElectronicInvoiceStore } from "../../stores/electronicInvoiceStore";
import { useCompanyEmissionModeStore } from "../../stores/companyEmissionModeStore";
import { useApiCredentialStore } from "../../stores/apiCredentialStore";
import { useReceivedElectronicInvoiceStore } from "../../stores/receivedElectronicInvoiceStore";
import type { ElectronicInvoiceStateDto } from "../../domain/types";

const invoice = (
  id: string,
  status: ElectronicInvoiceStateDto["status"],
): ElectronicInvoiceStateDto => ({
  id,
  saleId: `sale-${id}`,
  encf: `B01${id}`,
  documentType: "FiscalCredit",
  fiscalState: "InProcess",
  status,
  verdictNote: null,
  rawResponse: null,
  lastError: null,
  requiresReview: false,
  sentAt: null,
  nextCheckAt: null,
  receivedAt: null,
  statusCheckCount: 0,
  sequenceConsumed: null,
});

beforeEach(() => {
  vi.clearAllMocks();
  useElectronicInvoiceStore.setState({
    invoices: [],
    counts: null,
    loading: false,
    error: null,
  });
  useCompanyEmissionModeStore.setState({
    emissionMode: null,
    loading: false,
    error: null,
  });
  useApiCredentialStore.setState({
    credentials: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  useReceivedElectronicInvoiceStore.setState({
    decision: null,
    loading: false,
    error: null,
  });
});

describe("e-CF operation stores", () => {
  it("keeps the state surface counts and invoices", async () => {
    vi.mocked(electronicInvoiceService.getStateSurface).mockResolvedValue({
      counts: {
        pendingEmission: 1,
        inProcess: 1,
        rejected: 0,
        requiresReview: 0,
        total: 2,
      },
      invoices: [invoice("invoice-1", "Sent")],
    });

    await useElectronicInvoiceStore.getState().fetchStateSurface();

    const state = useElectronicInvoiceStore.getState();
    expect(state.invoices).toHaveLength(1);
    expect(state.counts?.total).toBe(2);
  });

  it("reflects the new status of an invoice after a retry", async () => {
    vi.mocked(electronicInvoiceService.getStateSurface).mockResolvedValue({
      counts: {
        pendingEmission: 0,
        inProcess: 1,
        rejected: 0,
        requiresReview: 0,
        total: 1,
      },
      invoices: [invoice("invoice-1", "Rejected")],
    });
    vi.mocked(electronicInvoiceService.retryInvoice).mockResolvedValue({
      id: "invoice-1",
      companyId: "company-1",
      saleId: "sale-invoice-1",
      encf: "B01invoice-1",
      documentType: "FiscalCredit",
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
      sentAt: null,
    });

    await useElectronicInvoiceStore.getState().fetchStateSurface();
    await useElectronicInvoiceStore.getState().retryInvoice("invoice-1");

    expect(useElectronicInvoiceStore.getState().invoices[0].status).toBe("Sent");
  });

  it("replaces the emission mode of the company", async () => {
    vi.mocked(companyEmissionModeService.getEmissionMode).mockResolvedValue({
      emissionMode: "Electronic",
      contingencyStatus: "None",
      contingencyStartsAt: null,
      contingencyEndsAt: null,
    });
    vi.mocked(companyEmissionModeService.updateEmissionMode).mockResolvedValue({
      emissionMode: "Normal",
      contingencyStatus: "None",
      contingencyStartsAt: null,
      contingencyEndsAt: null,
    });

    await useCompanyEmissionModeStore.getState().fetchEmissionMode();
    await useCompanyEmissionModeStore
      .getState()
      .updateEmissionMode({ emissionMode: "Normal" });

    expect(
      useCompanyEmissionModeStore.getState().emissionMode?.emissionMode,
    ).toBe("Normal");
  });

  it("returns the issued credential with its secret", async () => {
    vi.mocked(apiCredentialService.createCredential).mockResolvedValue({
      id: "credential-1",
      name: "Integración POS",
      keyId: "key-1",
      secret: "the-secret",
      expiresAt: null,
    });

    const issued = await useApiCredentialStore
      .getState()
      .createCredential("Integración POS", null);

    expect(issued.secret).toBe("the-secret");
  });

  it("keeps the commercial approval decision of a received e-CF", async () => {
    vi.mocked(
      receivedElectronicInvoiceService.decideCommercialApproval,
    ).mockResolvedValue({
      id: "received-1",
      issuerTaxId: "101010101",
      receiverTaxId: "202020202",
      encf: "B01received-1",
      documentType: "FiscalCredit",
      signedAt: "2026-11-19T00:00:00Z",
      receivedAt: "2026-11-19T00:05:00Z",
      approvalStatus: "Approved",
      approvalDecidedBy: "user-1",
      approvalDecidedAt: "2026-11-19T00:06:00Z",
      approvalReason: "Mercadería conforme",
      alreadyReceived: false,
    });

    await useReceivedElectronicInvoiceStore
      .getState()
      .decideCommercialApproval("received-1", {
        approved: true,
        reason: "Mercadería conforme",
      });

    expect(
      useReceivedElectronicInvoiceStore.getState().decision?.approvalStatus,
    ).toBe("Approved");
  });
});
