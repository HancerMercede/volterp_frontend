import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../i18n";
import { useAuthStore } from "../../stores/authStore";
import { useCompanyIssuerStore } from "../../stores/companyIssuerStore";
import { useUIStore } from "../../stores/uiStore";
import { Issuers } from "../../pages/FacturacionElectronica/Issuers/Issuers";
import type { CompanyIssuer } from "../../domain/types";

const ISSUERS: CompanyIssuer[] = [
  {
    id: "i1",
    companyId: "c1",
    taxId: "101-12345-6",
    legalName: "Distribuidora Aurora S.R.L.",
    isActive: true,
  },
  {
    id: "i2",
    companyId: "c1",
    taxId: "201-98765-4",
    legalName: "Comercial del Norte S.A.",
    isActive: false,
  },
];

const signIn = () => {
  useAuthStore.setState({
    token: "token-1",
    user: {
      username: "user",
      email: "user@example.com",
      fullName: "User",
      role: "admin",
      companyId: "c1",
    },
  });
};

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  vi.clearAllMocks();
  signIn();
  useCompanyIssuerStore.setState({
    issuers: ISSUERS,
    loading: false,
    error: null,
    totalCount: ISSUERS.length,
    pageCount: 1,
    fetchIssuers: vi.fn(),
    addIssuer: vi.fn(async () => ISSUERS[0]),
    updateIssuer: vi.fn(async () => ISSUERS[0]),
  });
  useUIStore.setState({
    toasts: [],
    modals: [],
    isLoading: false,
    addToast: vi.fn(),
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

describe("Issuers", () => {
  it("muestra los emisores del store", () => {
    render(<Issuers />);

    expect(screen.getByText("101-12345-6")).toBeInTheDocument();
    expect(screen.getByText("Distribuidora Aurora S.R.L.")).toBeInTheDocument();
    expect(screen.getByText("201-98765-4")).toBeInTheDocument();
    expect(screen.getByText("Comercial del Norte S.A.")).toBeInTheDocument();
  });

  it("carga los emisores del tenant paginados", () => {
    const fetchIssuers = vi.fn();
    useCompanyIssuerStore.setState({ fetchIssuers });

    render(<Issuers />);

    expect(fetchIssuers).toHaveBeenCalledWith(1, 10);
  });

  it("muestra el estado vacío cuando el tenant no tiene emisores", () => {
    useCompanyIssuerStore.setState({ issuers: [], totalCount: 0 });

    render(<Issuers />);

    expect(
      screen.getByText(i18n.t("facturacion.issuers.empty")),
    ).toBeInTheDocument();
  });

  it("el modal de alta manda el payload que espera el store", async () => {
    const addIssuer = vi.fn(async () => ISSUERS[0]);
    useCompanyIssuerStore.setState({ addIssuer });

    render(<Issuers />);

    await userEvent.click(
      screen.getByRole("button", { name: /Nuevo emisor/ }),
    );
    await userEvent.type(screen.getByLabelText(/RNC/), "101-12345-6");
    await userEvent.type(
      screen.getByLabelText(/Razón social/),
      "Distribuidora Aurora S.R.L.",
    );
    await userEvent.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() => {
      expect(addIssuer).toHaveBeenCalledWith({
        taxId: "101-12345-6",
        legalName: "Distribuidora Aurora S.R.L.",
      });
    });
  });

  it("el formulario de edición no ofrece el RNC porque el backend no lo actualiza", async () => {
    render(<Issuers />);

    const row = screen.getByText("101-12345-6").closest("tr");
    expect(row).not.toBeNull();
    await userEvent.click(within(row as HTMLElement).getByTitle("Editar"));

    expect(screen.queryByLabelText(/RNC/)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Razón social/)).toHaveValue(
      "Distribuidora Aurora S.R.L.",
    );
    expect(screen.getByRole("switch", { name: "Activo" })).toBeChecked();
  });

  it("el modal de edición manda solo la razón social y el estado", async () => {
    const updateIssuer = vi.fn(async () => ISSUERS[0]);
    useCompanyIssuerStore.setState({ updateIssuer });

    render(<Issuers />);

    const row = screen.getByText("101-12345-6").closest("tr");
    expect(row).not.toBeNull();
    await userEvent.click(within(row as HTMLElement).getByTitle("Editar"));

    await userEvent.clear(screen.getByLabelText(/Razón social/));
    await userEvent.type(
      screen.getByLabelText(/Razón social/),
      "Distribuidora Aurora S.R.L.",
    );
    await userEvent.click(screen.getByRole("switch", { name: "Activo" }));
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(updateIssuer).toHaveBeenCalledWith("i1", {
        legalName: "Distribuidora Aurora S.R.L.",
        isActive: false,
      });
    });
  });
});
