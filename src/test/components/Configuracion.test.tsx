import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/companyService", () => ({
  companyService: {
    getCompany: vi.fn().mockResolvedValue(null),
    updateCompany: vi.fn(),
  },
}));

import i18n from "../../i18n";
import { companyService } from "../../infrastructure/api/companyService";
import { useAuthStore } from "../../stores/authStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useUIStore } from "../../stores/uiStore";
import { Configuracion } from "../../pages/Configuracion/Configuracion";
import type { CompanyDto } from "../../domain/types";

const signIn = (role: string) => {
  useAuthStore.setState({
    token: "token-1",
    user: {
      username: "user",
      email: "user@example.com",
      fullName: "User",
      role,
      companyId: "co-1",
    },
  });
};

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ token: null, user: null });
  useCompanyStore.setState({ currentCompany: null, loading: false });
  useUIStore.setState({ toasts: [], modals: [], isLoading: false });
});

describe("Configuracion admin tabs", () => {
  it("gives the users tab to an admin", () => {
    signIn("admin");
    render(<Configuracion />);

    expect(screen.getByRole("button", { name: "Users" })).toBeInTheDocument();
  });

  it("keeps the companies tab for the super admin", () => {
    signIn("superadmin");
    render(<Configuracion />);

    expect(screen.getByRole("button", { name: "Users" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Companies" }),
    ).toBeInTheDocument();
  });

  it("hides the admin tabs from a non admin role", () => {
    signIn("ventas");
    render(<Configuracion />);

    expect(screen.queryByRole("button", { name: "Users" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Companies" })).toBeNull();
  });
});

describe("Configuracion company form", () => {
  const COMPANY: CompanyDto = {
    id: "co-1",
    name: "HM Software Solutions",
    taxId: "HM123456789",
    logoUrl: null,
    isActive: true,
    address: "Av. 27 de Febrero",
    legalName: "HM Software Solutions S.R.L.",
    phone: "809-555-0101",
    email: "contacto@hm.do",
  };

  it("shows the backend message when the company cannot be saved", async () => {
    vi.mocked(companyService.getCompany).mockResolvedValue(COMPANY);
    vi.mocked(companyService.updateCompany).mockRejectedValue(
      new Error("The tax id must be a valid RNC or citizen ID."),
    );
    signIn("superadmin");
    render(<Configuracion />);

    // The page has two Save buttons: the company form and the inert general
    // settings form. The first one belongs to the company form.
    await screen.findAllByRole("button", { name: i18n.t("common.save") });
    const [saveCompany] = screen.getAllByRole("button", {
      name: i18n.t("common.save"),
    });

    await userEvent.click(saveCompany);

    await waitFor(() => {
      const [toast] = useUIStore.getState().toasts;
      expect(toast).toMatchObject({
        type: "error",
        message: "The tax id must be a valid RNC or citizen ID.",
      });
    });
  });
});
