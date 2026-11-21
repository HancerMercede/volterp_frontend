import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/fetchWithAuth", () => ({
  fetchWithAuth: vi.fn(),
  fetchWithAuthJson: vi.fn(),
  fetchWithAuthBlob: vi.fn(),
}));

import {
  fetchWithAuth,
  fetchWithAuthBlob,
  fetchWithAuthJson,
} from "../../infrastructure/api/fetchWithAuth";
import { companyIssuerService } from "../../infrastructure/api/companyIssuerService";
import { electronicInvoiceService } from "../../infrastructure/api/electronicInvoiceService";
import { electronicInvoiceSequenceService } from "../../infrastructure/api/electronicInvoiceSequenceService";
import { companyCertificateService } from "../../infrastructure/api/companyCertificateService";
import { companyEmissionModeService } from "../../infrastructure/api/companyEmissionModeService";
import { apiCredentialService } from "../../infrastructure/api/apiCredentialService";
import { normalFiscalSequenceService } from "../../infrastructure/api/normalFiscalSequenceService";
import { receivedElectronicInvoiceService } from "../../infrastructure/api/receivedElectronicInvoiceService";

const jsonMock = vi.mocked(fetchWithAuthJson);
const rawMock = vi.mocked(fetchWithAuth);
const blobMock = vi.mocked(fetchWithAuthBlob);

beforeEach(() => {
  vi.clearAllMocks();
  jsonMock.mockResolvedValue(undefined as never);
  rawMock.mockResolvedValue(undefined as never);
  blobMock.mockResolvedValue(new Blob());
});

describe("e-CF services contract", () => {
  it("lists the issuers of the tenant with the paged query", async () => {
    await companyIssuerService.getIssuers(2, 20);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/CompanyIssuers?pageNumber=2&pageSize=20"),
    );
  });

  it("reads one issuer by id", async () => {
    await companyIssuerService.getIssuerById("issuer-1");

    expect(jsonMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/CompanyIssuers/issuer-1"),
    );
  });

  it("creates an issuer without sending the company", async () => {
    await companyIssuerService.createIssuer({
      taxId: "101010101",
      legalName: "Empresa Demo",
    });

    const [url, options] = jsonMock.mock.calls[0];
    expect(url).toEqual(expect.stringContaining("/api/CompanyIssuers"));
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({
      taxId: "101010101",
      legalName: "Empresa Demo",
    });
  });

  it("updates an issuer with the legal name and the active flag", async () => {
    await companyIssuerService.updateIssuer("issuer-1", {
      legalName: "Empresa Demo",
      isActive: false,
    });

    const [url, options] = jsonMock.mock.calls[0];
    expect(url).toEqual(expect.stringContaining("/api/CompanyIssuers/issuer-1"));
    expect(options?.method).toBe("PUT");
    expect(JSON.parse(String(options?.body))).toEqual({
      legalName: "Empresa Demo",
      isActive: false,
    });
  });

  it("reads the state surface of the electronic invoices with the limit", async () => {
    await electronicInvoiceService.getStateSurface();

    expect(jsonMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/ElectronicInvoices/state?limit=50"),
    );
  });

  it("retries an electronic invoice with a POST", async () => {
    await electronicInvoiceService.retryInvoice("invoice-1");

    const [url, options] = jsonMock.mock.calls[0];
    expect(url).toEqual(
      expect.stringContaining("/api/ElectronicInvoices/invoice-1/retry"),
    );
    expect(options?.method).toBe("POST");
  });

  it("reads the QR code and the printable invoice as blobs", async () => {
    await electronicInvoiceService.getQrSvg("invoice-1");
    await electronicInvoiceService.getQrPng("invoice-1");
    await electronicInvoiceService.getPrintableInvoice("invoice-1");

    expect(blobMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/ElectronicInvoices/invoice-1/qr.svg"),
    );
    expect(blobMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/ElectronicInvoices/invoice-1/qr.png"),
    );
    expect(blobMock).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("/api/ElectronicInvoicePrint/invoice-1"),
    );
  });

  it("lists, creates, updates and annuls the e-NCF ranges", async () => {
    await electronicInvoiceSequenceService.getSequences();
    expect(jsonMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/ElectronicInvoiceSequences?pageNumber=1&pageSize=10",
      ),
    );

    await electronicInvoiceSequenceService.createSequence({
      issuerTaxId: "101010101",
      documentType: "FiscalCredit",
      from: 1,
      to: 10,
      position: 1,
      expiresAt: null,
    });
    const [, createOptions] = jsonMock.mock.calls[1];
    expect(createOptions?.method).toBe("POST");
    expect(JSON.parse(String(createOptions?.body))).toEqual({
      issuerTaxId: "101010101",
      documentType: "FiscalCredit",
      from: 1,
      to: 10,
      position: 1,
      expiresAt: null,
    });

    await electronicInvoiceSequenceService.annulSequence("range-1");
    const [annulUrl, annulOptions] = jsonMock.mock.calls[2];
    expect(annulUrl).toEqual(
      expect.stringContaining("/api/ElectronicInvoiceSequences/range-1/annul"),
    );
    expect(annulOptions?.method).toBe("POST");
  });

  it("creates a certificate with the opaque credential", async () => {
    await companyCertificateService.createCertificate({
      name: "Certificado principal",
      taxId: "101010101",
      expiresAt: "2027-01-01T00:00:00Z",
      credential: "opaque-credential",
    });

    const [url, options] = jsonMock.mock.calls[0];
    expect(url).toEqual(
      expect.stringContaining("/api/CompanyCertificates"),
    );
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({
      name: "Certificado principal",
      taxId: "101010101",
      expiresAt: "2027-01-01T00:00:00Z",
      credential: "opaque-credential",
    });
  });

  it("reads and updates the emission mode of the company", async () => {
    await companyEmissionModeService.getEmissionMode();
    expect(jsonMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/CompanyEmissionMode"),
    );

    await companyEmissionModeService.updateEmissionMode({
      emissionMode: "Electronic",
    });
    const [modeUrl, modeOptions] = jsonMock.mock.calls[1];
    expect(modeUrl).toEqual(
      expect.stringContaining("/api/CompanyEmissionMode"),
    );
    expect(modeOptions?.method).toBe("PUT");
    expect(JSON.parse(String(modeOptions?.body))).toEqual({
      emissionMode: "Electronic",
    });

    await companyEmissionModeService.updateContingency({
      status: "Partial",
      startsAt: "2026-01-01T00:00:00Z",
      endsAt: null,
    });
    const [contingencyUrl, contingencyOptions] = jsonMock.mock.calls[2];
    expect(contingencyUrl).toEqual(
      expect.stringContaining("/api/CompanyEmissionMode/contingency"),
    );
    expect(contingencyOptions?.method).toBe("PUT");
    expect(JSON.parse(String(contingencyOptions?.body))).toEqual({
      status: "Partial",
      startsAt: "2026-01-01T00:00:00Z",
      endsAt: null,
    });
  });

  it("issues an API credential and revokes it with a DELETE", async () => {
    await apiCredentialService.createCredential("Integración POS", null);
    const [url, options] = jsonMock.mock.calls[0];
    expect(url).toEqual(expect.stringContaining("/api/ApiCredentials"));
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({
      name: "Integración POS",
      expiresAt: null,
    });

    await apiCredentialService.deleteCredential("credential-1");
    const [deleteUrl, deleteOptions] = rawMock.mock.calls[0];
    expect(deleteUrl).toEqual(
      expect.stringContaining("/api/ApiCredentials/credential-1"),
    );
    expect(deleteOptions?.method).toBe("DELETE");
    expect(deleteOptions?.body).toBeUndefined();
  });

  it("lists, creates and updates the normal fiscal sequences", async () => {
    await normalFiscalSequenceService.getNormalSequences();
    expect(jsonMock).toHaveBeenCalledWith(
      expect.stringContaining(
        "/api/NormalFiscalSequences?pageNumber=1&pageSize=10",
      ),
    );

    await normalFiscalSequenceService.createNormalSequence({
      issuerTaxId: "101010101",
      documentType: "Consumer",
      from: 1,
      to: 10,
      position: 1,
      expiresAt: null,
    });
    const [, createOptions] = jsonMock.mock.calls[1];
    expect(createOptions?.method).toBe("POST");
    expect(JSON.parse(String(createOptions?.body))).toEqual({
      issuerTaxId: "101010101",
      documentType: "Consumer",
      from: 1,
      to: 10,
      position: 1,
      expiresAt: null,
    });

    await normalFiscalSequenceService.updateNormalSequence("normal-1", {
      issuerTaxId: "101010101",
      documentType: "Consumer",
      from: 1,
      to: 20,
      position: 1,
      expiresAt: null,
    });
    const [updateUrl, updateOptions] = jsonMock.mock.calls[2];
    expect(updateUrl).toEqual(
      expect.stringContaining("/api/NormalFiscalSequences/normal-1"),
    );
    expect(updateOptions?.method).toBe("PUT");
  });

  it("records the commercial approval of a received e-CF", async () => {
    await receivedElectronicInvoiceService.decideCommercialApproval(
      "received-1",
      { approved: true, reason: "Mercadería conforme" },
    );

    const [url, options] = jsonMock.mock.calls[0];
    expect(url).toEqual(
      expect.stringContaining(
        "/api/ElectronicInvoiceReception/received-1/commercial-approval",
      ),
    );
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({
      approved: true,
      reason: "Mercadería conforme",
    });
  });

  it("never sends the company in a request body", async () => {
    await companyIssuerService.createIssuer({
      taxId: "101010101",
      legalName: "Empresa Demo",
    });
    await companyCertificateService.createCertificate({
      name: "Certificado principal",
      taxId: "101010101",
      expiresAt: "2027-01-01T00:00:00Z",
      credential: "opaque-credential",
    });
    await electronicInvoiceSequenceService.createSequence({
      issuerTaxId: "101010101",
      documentType: "FiscalCredit",
      from: 1,
      to: 10,
      position: 1,
      expiresAt: null,
    });

    const bodies = jsonMock.mock.calls
      .map(([, options]) => options?.body)
      .filter(Boolean)
      .map((body) => JSON.parse(String(body)));

    expect(bodies.length).toBeGreaterThan(0);
    for (const body of bodies) {
      expect(body).not.toHaveProperty("companyId");
    }
  });
});
