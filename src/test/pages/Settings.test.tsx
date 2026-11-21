import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../i18n";
import { Settings } from "../../pages/FacturacionElectronica/Settings/Settings";
import { apiCredentialService } from "../../infrastructure/api/apiCredentialService";
import { companyEmissionModeService } from "../../infrastructure/api/companyEmissionModeService";
import { normalFiscalSequenceService } from "../../infrastructure/api/normalFiscalSequenceService";
import { useApiCredentialStore } from "../../stores/apiCredentialStore";
import { useCompanyEmissionModeStore } from "../../stores/companyEmissionModeStore";
import { useNormalFiscalSequenceStore } from "../../stores/normalFiscalSequenceStore";
import { useUIStore } from "../../stores/uiStore";
import { useAuthStore } from "../../stores/authStore";
import { NotificationContainer } from "../../components/UI";
import type {
  ApiCredentialDto,
  CompanyEmissionModeDto,
  NormalFiscalSequenceDto,
  PagedResult,
} from "../../domain/types";

vi.mock("../../infrastructure/api/companyEmissionModeService", () => ({
  companyEmissionModeService: {
    getEmissionMode: vi.fn(),
    updateEmissionMode: vi.fn(),
    updateContingency: vi.fn(),
  },
}));

vi.mock("../../infrastructure/api/apiCredentialService", () => ({
  apiCredentialService: {
    getCredentials: vi.fn(),
    createCredential: vi.fn(),
    deleteCredential: vi.fn(),
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

const mockEmissionModeService = companyEmissionModeService as unknown as {
  getEmissionMode: ReturnType<typeof vi.fn>;
  updateEmissionMode: ReturnType<typeof vi.fn>;
  updateContingency: ReturnType<typeof vi.fn>;
};

const mockCredentialService = apiCredentialService as unknown as {
  getCredentials: ReturnType<typeof vi.fn>;
  createCredential: ReturnType<typeof vi.fn>;
  deleteCredential: ReturnType<typeof vi.fn>;
};

const mockSequenceService = normalFiscalSequenceService as unknown as {
  getNormalSequences: ReturnType<typeof vi.fn>;
  createNormalSequence: ReturnType<typeof vi.fn>;
  updateNormalSequence: ReturnType<typeof vi.fn>;
};

const EMISSION_MODE: CompanyEmissionModeDto = {
  emissionMode: "Electronic",
  contingencyStatus: "None",
  contingencyStartsAt: null,
  contingencyEndsAt: null,
};

const CREDENTIAL: ApiCredentialDto = {
  id: "cred-1",
  name: "Integracion contabilidad",
  keyId: "key-123",
  status: "Active",
  expiresAt: null,
  updatedAt: null,
  isExpired: false,
  createdAt: "2026-11-19T10:00:00Z",
};

const SEQUENCE: NormalFiscalSequenceDto = {
  id: "seq-1",
  companyId: "company-1",
  issuerTaxId: "101010101",
  documentType: "Consumer",
  from: 1,
  to: 100,
  currentSequence: 1,
  expiresAt: null,
  hasRoom: true,
};

const paged = <T,>(items: T[]): PagedResult<T> => ({
  rowCount: items.length,
  pageNumber: 1,
  pageSize: 10,
  pageCount: 1,
  items,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <Settings />
      <NotificationContainer />
    </MemoryRouter>,
  );

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  vi.clearAllMocks();
  mockEmissionModeService.getEmissionMode.mockResolvedValue(EMISSION_MODE);
  mockEmissionModeService.updateEmissionMode.mockResolvedValue({
    ...EMISSION_MODE,
    emissionMode: "Normal",
  });
  mockEmissionModeService.updateContingency.mockResolvedValue({
    ...EMISSION_MODE,
    contingencyStatus: "Partial",
  });
  mockCredentialService.getCredentials.mockResolvedValue(paged([CREDENTIAL]));
  mockCredentialService.createCredential.mockResolvedValue({
    id: "cred-2",
    name: "Nueva integracion",
    keyId: "key-999",
    secret: "s3cr3t",
    expiresAt: null,
  });
  mockCredentialService.deleteCredential.mockResolvedValue(undefined);
  mockSequenceService.getNormalSequences.mockResolvedValue(paged([SEQUENCE]));
  mockSequenceService.createNormalSequence.mockResolvedValue(SEQUENCE);
  mockSequenceService.updateNormalSequence.mockResolvedValue(SEQUENCE);

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
  useNormalFiscalSequenceStore.setState({
    normalSequences: [],
    loading: false,
    error: null,
    totalCount: 0,
    pageCount: 0,
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

import { usePermissionStore } from "../../stores/permissionStore";

// Los permisos ahora los da la API: el test declara lo que el llamador
// puede hacer, como lo haria el servidor.
usePermissionStore.setState({
  permissions: new Set([
    "facturacion.read",
    "facturacion.write",
    "facturacion.delete",
  ]),
  status: "ready",
});

describe("Settings", () => {
  it("muestra el modo de emision y la contingencia actuales", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText("Modo de emisión")).toHaveValue(
        "Electronic",
      ),
    );

    const emissionCard = screen
      .getByRole("heading", { name: "Modo de emisión" })
      .closest("section") as HTMLElement;
    expect(
      within(emissionCard).getByText("Electronic", { selector: "p" }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Contingencia")).toHaveValue("None");
    const contingencyCard = screen
      .getByRole("heading", { name: "Contingencia" })
      .closest("section") as HTMLElement;
    expect(
      within(contingencyCard).getByText("None", { selector: "p" }),
    ).toBeInTheDocument();
  });

  it("guarda el modo de emision que elige el usuario", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText("Modo de emisión")).toHaveValue(
        "Electronic",
      ),
    );

    await user.selectOptions(screen.getByLabelText("Modo de emisión"), "Normal");
    await user.click(
      screen.getByRole("button", { name: "Guardar el modo de emisión" }),
    );

    await waitFor(() =>
      expect(mockEmissionModeService.updateEmissionMode).toHaveBeenCalledWith({
        emissionMode: "Normal",
      }),
    );
  });

  it("guarda la contingencia con sus fechas", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByLabelText("Contingencia")).toHaveValue("None"),
    );

    await user.selectOptions(screen.getByLabelText("Contingencia"), "Partial");
    fireEvent.change(screen.getByLabelText("Inicio de la contingencia"), {
      target: { value: "2026-11-19T10:00" },
    });
    fireEvent.change(screen.getByLabelText("Fin de la contingencia"), {
      target: { value: "2026-11-20T18:00" },
    });
    await user.click(
      screen.getByRole("button", { name: "Guardar la contingencia" }),
    );

    await waitFor(() =>
      expect(mockEmissionModeService.updateContingency).toHaveBeenCalledWith({
        status: "Partial",
        startsAt: new Date("2026-11-19T10:00").toISOString(),
        endsAt: new Date("2026-11-20T18:00").toISOString(),
      }),
    );
  });

  it("lista las credenciales y las secuencias normales", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Integracion contabilidad")).toBeInTheDocument(),
    );

    expect(screen.getByText("key-123")).toBeInTheDocument();
    expect(screen.getByText("101010101")).toBeInTheDocument();
    expect(screen.getByText("Consumer")).toBeInTheDocument();
  });

  it("muestra el secret de la credencial una sola vez", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Integracion contabilidad")).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole("button", { name: /Nueva credencial/ }),
    );
    await user.type(screen.getByLabelText(/Nombre/), "Nueva integracion");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() =>
      expect(mockCredentialService.createCredential).toHaveBeenCalledWith(
        "Nueva integracion",
        null,
      ),
    );

    await waitFor(() =>
      expect(screen.getAllByText("s3cr3t")).toHaveLength(1),
    );
    expect(
      screen.getByText(
        "El secret se muestra una sola vez. Copialo ahora: el backend no lo vuelve a devolver.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Cerrar" })[0]);

    await waitFor(() => expect(screen.queryByText("s3cr3t")).toBeNull());
  });

  it("muestra literal el error del backend cuando la credencial no se emite", async () => {
    mockCredentialService.createCredential.mockRejectedValue(
      new Error("El nombre ya existe"),
    );
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Integracion contabilidad")).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole("button", { name: /Nueva credencial/ }),
    );
    await user.type(screen.getByLabelText(/Nombre/), "Nueva integracion");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByRole("alert")).toHaveTextContent(
        "El nombre ya existe",
      ),
    );
  });

  it("revoca una credencial previa confirmacion", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Integracion contabilidad")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Revocar" }));

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent(
      "Revocar la credencial Integracion contabilidad? Las integraciones que la usen dejan de poder firmar.",
    );

    await user.click(within(dialog).getByRole("button", { name: "Revocar" }));

    await waitFor(() =>
      expect(mockCredentialService.deleteCredential).toHaveBeenCalledWith(
        "cred-1",
      ),
    );
  });

  it("crea una secuencia normal", async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("101010101")).toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole("button", { name: /Nueva secuencia normal/ }),
    );
    await user.type(screen.getByLabelText(/RNC emisor/), "202020202");
    await user.selectOptions(
      screen.getByLabelText(/Tipo de comprobante/),
      "DebitNote",
    );
    await user.type(screen.getByLabelText(/^Desde/), "1");
    await user.type(screen.getByLabelText(/^Hasta/), "500");
    await user.type(screen.getByLabelText(/Posición/), "1");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() =>
      expect(mockSequenceService.createNormalSequence).toHaveBeenCalledWith({
        issuerTaxId: "202020202",
        documentType: "DebitNote",
        from: 1,
        to: 500,
        position: 1,
        expiresAt: null,
      }),
    );
  });
});
