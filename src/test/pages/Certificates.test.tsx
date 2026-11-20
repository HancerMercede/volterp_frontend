import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../i18n";
import { EntityStatus } from "../../domain/constants/electronicInvoicing";
import type { CompanyCertificateDto, PagedResult } from "../../domain/types";
import { useCompanyCertificateStore } from "../../stores/companyCertificateStore";
import { Certificates } from "../../pages/FacturacionElectronica/Certificates/Certificates";

vi.mock("../../infrastructure/api/companyCertificateService", () => ({
  companyCertificateService: {
    getCertificates: vi.fn(),
    getCertificateById: vi.fn(),
    createCertificate: vi.fn(),
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

import { companyCertificateService } from "../../infrastructure/api/companyCertificateService";

const mockService = companyCertificateService as unknown as {
  getCertificates: ReturnType<typeof vi.fn>;
  createCertificate: ReturnType<typeof vi.fn>;
};

const CERTIFICATE: CompanyCertificateDto = {
  id: "cert-1",
  companyId: "company-1",
  name: "Certificado de producción",
  taxId: "101010101",
  expiresAt: "2026-12-31T00:00:00Z",
  status: EntityStatus.Active,
  isExpired: false,
};

const page = (
  items: CompanyCertificateDto[],
): PagedResult<CompanyCertificateDto> => ({
  rowCount: items.length,
  pageNumber: 1,
  pageSize: 10,
  pageCount: 1,
  items,
});

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  vi.clearAllMocks();
  useCompanyCertificateStore.setState({
    certificates: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
  });
  mockService.getCertificates.mockResolvedValue(page([CERTIFICATE]));
  mockService.createCertificate.mockResolvedValue({
    ...CERTIFICATE,
    id: "cert-2",
    name: "Certificado nuevo",
  });
});

describe("Certificates", () => {
  it("muestra los certificados que devuelve el backend", async () => {
    render(<Certificates />);

    expect(
      await screen.findByText("Certificado de producción"),
    ).toBeInTheDocument();
    expect(screen.getByText("101010101")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("marca el certificado expirado con el aviso del backend", async () => {
    mockService.getCertificates.mockResolvedValue(
      page([{ ...CERTIFICATE, isExpired: true }]),
    );

    render(<Certificates />);

    expect(await screen.findByText("Expirado")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando el tenant no tiene certificados", async () => {
    mockService.getCertificates.mockResolvedValue(page([]));

    render(<Certificates />);

    expect(
      await screen.findByText("Todavía no hay certificados cargados."),
    ).toBeInTheDocument();
  });

  it("no ofrece editar ni borrar porque el backend no expone esos endpoints", async () => {
    render(<Certificates />);

    await screen.findByText("Certificado de producción");

    expect(screen.queryByText(i18n.t("common.actions"))).not.toBeInTheDocument();
  });

  it("envía el alta con el payload que espera el store", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Certificates />);

    await user.click(
      await screen.findByRole("button", { name: /Nuevo certificado/ }),
    );

    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Certificado de producción" },
    });
    fireEvent.change(screen.getByLabelText(/RNC/), {
      target: { value: "101010101" },
    });
    fireEvent.change(screen.getByLabelText(/Vence/), {
      target: { value: "2026-12-31" },
    });
    fireEvent.change(screen.getByLabelText(/Credencial/), {
      target: { value: "-----BEGIN CERTIFICATE-----" },
    });

    await user.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() => {
      expect(mockService.createCertificate).toHaveBeenCalledWith({
        name: "Certificado de producción",
        taxId: "101010101",
        expiresAt: "2026-12-31T00:00:00",
        credential: "-----BEGIN CERTIFICATE-----",
      });
    });
  });

  it("muestra el error del backend cuando el alta es rechazada", async () => {
    const user = userEvent.setup({ delay: null });
    mockService.createCertificate.mockRejectedValue(
      new Error("The certificate is already registered"),
    );

    render(<Certificates />);

    await user.click(
      await screen.findByRole("button", { name: /Nuevo certificado/ }),
    );

    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Certificado duplicado" },
    });
    fireEvent.change(screen.getByLabelText(/RNC/), {
      target: { value: "101010101" },
    });
    fireEvent.change(screen.getByLabelText(/Vence/), {
      target: { value: "2026-12-31" },
    });
    fireEvent.change(screen.getByLabelText(/Credencial/), {
      target: { value: "credencial" },
    });

    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The certificate is already registered",
    );
  });
});
