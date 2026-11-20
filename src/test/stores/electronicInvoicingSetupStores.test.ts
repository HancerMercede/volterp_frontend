import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/companyIssuerService", () => ({
  companyIssuerService: {
    getIssuers: vi.fn(),
    getIssuerById: vi.fn(),
    createIssuer: vi.fn(),
    updateIssuer: vi.fn(),
  },
}));

vi.mock("../../infrastructure/api/electronicInvoiceSequenceService", () => ({
  electronicInvoiceSequenceService: {
    getSequences: vi.fn(),
    getSequenceById: vi.fn(),
    createSequence: vi.fn(),
    updateSequence: vi.fn(),
    annulSequence: vi.fn(),
  },
}));

vi.mock("../../infrastructure/api/companyCertificateService", () => ({
  companyCertificateService: {
    getCertificates: vi.fn(),
    getCertificateById: vi.fn(),
    createCertificate: vi.fn(),
  },
}));

vi.mock("../../infrastructure/api/normalFiscalSequenceService", () => ({
  normalFiscalSequenceService: {
    getNormalSequences: vi.fn(),
    getNormalSequenceById: vi.fn(),
    createNormalSequence: vi.fn(),
    updateNormalSequence: vi.fn(),
  },
}));

import { companyIssuerService } from "../../infrastructure/api/companyIssuerService";
import { electronicInvoiceSequenceService } from "../../infrastructure/api/electronicInvoiceSequenceService";
import { companyCertificateService } from "../../infrastructure/api/companyCertificateService";
import { normalFiscalSequenceService } from "../../infrastructure/api/normalFiscalSequenceService";
import { useCompanyIssuerStore } from "../../stores/companyIssuerStore";
import { useElectronicInvoiceSequenceStore } from "../../stores/electronicInvoiceSequenceStore";
import { useCompanyCertificateStore } from "../../stores/companyCertificateStore";
import { useNormalFiscalSequenceStore } from "../../stores/normalFiscalSequenceStore";
import type {
  CompanyIssuerDto,
  ElectronicInvoiceSequenceDto,
} from "../../domain/types";

const issuer = (id: string): CompanyIssuerDto => ({
  id,
  companyId: "company-1",
  taxId: "101010101",
  legalName: "Empresa Demo",
  isActive: true,
});

const sequence = (id: string): ElectronicInvoiceSequenceDto => ({
  id,
  companyId: "company-1",
  issuerTaxId: "101010101",
  documentType: "FiscalCredit",
  from: 1,
  to: 10,
  currentSequence: 1,
  expiresAt: null,
  hasRoom: true,
});

beforeEach(() => {
  vi.clearAllMocks();
  useCompanyIssuerStore.setState({
    issuers: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  useElectronicInvoiceSequenceStore.setState({
    sequences: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  useCompanyCertificateStore.setState({
    certificates: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  useNormalFiscalSequenceStore.setState({
    normalSequences: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
});

describe("e-CF setup stores", () => {
  it("fills the issuer list with the paged result", async () => {
    vi.mocked(companyIssuerService.getIssuers).mockResolvedValue({
      rowCount: 21,
      pageNumber: 1,
      pageSize: 10,
      pageCount: 3,
      items: [issuer("issuer-1")],
    });

    await useCompanyIssuerStore.getState().fetchIssuers();

    const state = useCompanyIssuerStore.getState();
    expect(state.issuers).toHaveLength(1);
    expect(state.totalCount).toBe(21);
    expect(state.pageCount).toBe(3);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("keeps the error in the state when a reader fails", async () => {
    vi.mocked(companyIssuerService.getIssuers).mockRejectedValue(
      new Error("Boom"),
    );

    await expect(
      useCompanyIssuerStore.getState().fetchIssuers(),
    ).resolves.toBeUndefined();

    const state = useCompanyIssuerStore.getState();
    expect(state.error).toBe("Boom");
    expect(state.loading).toBe(false);
    expect(state.issuers).toEqual([]);
  });

  it("re-throws when a mutation fails", async () => {
    vi.mocked(companyIssuerService.createIssuer).mockRejectedValue(
      new Error("Boom"),
    );

    await expect(
      useCompanyIssuerStore.getState().addIssuer({
        taxId: "101010101",
        legalName: "Empresa Demo",
      }),
    ).rejects.toThrow("Boom");

    expect(useCompanyIssuerStore.getState().error).toBe("Boom");
  });

  it("adds the created issuer to the list", async () => {
    vi.mocked(companyIssuerService.createIssuer).mockResolvedValue(
      issuer("issuer-1"),
    );

    await useCompanyIssuerStore.getState().addIssuer({
      taxId: "101010101",
      legalName: "Empresa Demo",
    });

    const state = useCompanyIssuerStore.getState();
    expect(state.issuers).toHaveLength(1);
    expect(state.totalCount).toBe(1);
  });

  it("removes an annulled range from the list", async () => {
    vi.mocked(electronicInvoiceSequenceService.getSequences).mockResolvedValue({
      rowCount: 1,
      pageNumber: 1,
      pageSize: 10,
      pageCount: 1,
      items: [sequence("range-1")],
    });
    vi.mocked(electronicInvoiceSequenceService.annulSequence).mockResolvedValue({
      code: "2000",
      name: "Anulacion successful",
      messages: ["Rango anulado"],
      annulledAt: "2026-11-19T00:00:00Z",
    });

    await useElectronicInvoiceSequenceStore.getState().fetchSequences();
    const result = await useElectronicInvoiceSequenceStore
      .getState()
      .annulSequence("range-1");

    expect(result.messages).toEqual(["Rango anulado"]);
    expect(useElectronicInvoiceSequenceStore.getState().sequences).toEqual([]);
  });

  it("fills the certificate list with the paged result", async () => {
    vi.mocked(companyCertificateService.getCertificates).mockResolvedValue({
      rowCount: 1,
      pageNumber: 1,
      pageSize: 10,
      pageCount: 1,
      items: [
        {
          id: "certificate-1",
          companyId: "company-1",
          name: "Certificado principal",
          taxId: "101010101",
          expiresAt: "2027-01-01T00:00:00Z",
          status: "Active",
          isExpired: false,
        },
      ],
    });

    await useCompanyCertificateStore.getState().fetchCertificates();

    expect(useCompanyCertificateStore.getState().certificates).toHaveLength(1);
  });

  it("fills the normal fiscal sequences list", async () => {
    vi.mocked(normalFiscalSequenceService.getNormalSequences).mockResolvedValue({
      rowCount: 1,
      pageNumber: 1,
      pageSize: 10,
      pageCount: 1,
      items: [
        {
          id: "normal-1",
          companyId: "company-1",
          issuerTaxId: "101010101",
          documentType: "Consumer",
          from: 1,
          to: 10,
          currentSequence: 1,
          expiresAt: null,
          hasRoom: true,
        },
      ],
    });

    await useNormalFiscalSequenceStore.getState().fetchNormalSequences();

    expect(useNormalFiscalSequenceStore.getState().normalSequences).toHaveLength(
      1,
    );
  });
});
