import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/companyService", () => ({
  companyService: {
    getCompany: vi.fn().mockResolvedValue(null),
    getCompanies: vi.fn(),
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

describe("Configuracion companies tab", () => {
  it("warns that a required field is empty instead of failing silently", async () => {
    vi.mocked(companyService.getCompanies).mockResolvedValue({
      rowCount: 1,
      pageNumber: 1,
      pageSize: 10,
      pageCount: 1,
      items: [COMPANY],
    });
    signIn("superadmin");
    render(<Configuracion />);

    await userEvent.click(screen.getByRole("button", { name: "Companies" }));
    await userEvent.click(await screen.findByRole("button", { name: "Editar" }));

    const phone = screen.getByDisplayValue(COMPANY.phone);
    await userEvent.clear(phone);
    expect((phone as HTMLInputElement).value).toBe("");
    await userEvent.click(
      screen.getByRole("button", { name: i18n.t("empresas.form.save") }),
    );

    expect(
      await screen.findByText(`${i18n.t("empresas.form.phone")} es requerido`),
    ).toBeInTheDocument();
    expect(companyService.updateCompany).not.toHaveBeenCalled();
  });
});

describe("Configuracion company form", () => {
  it("tells the user that a required field is empty when the save fails", async () => {
    vi.mocked(companyService.getCompany).mockResolvedValue(COMPANY);
    vi.mocked(companyService.updateCompany).mockRejectedValue(
      new Error("name can't be null or empty."),
    );
    signIn("superadmin");
    render(<Configuracion />);

    // The first Save button belongs to the company form, the second one to the inert general settings.
    await screen.findAllByRole("button", { name: i18n.t("common.save") });
    const [saveCompany] = screen.getAllByRole("button", {
      name: i18n.t("common.save"),
    });

    await userEvent.clear(screen.getByDisplayValue(COMPANY.name));
    await userEvent.click(saveCompany);

    expect(companyService.updateCompany).toHaveBeenCalledWith(
      "co-1",
      expect.objectContaining({ name: "" }),
    );
    await waitFor(() => {
      const [toast] = useUIStore.getState().toasts;
      expect(toast).toMatchObject({
        type: "error",
        message: "name can't be null or empty.",
      });
    });
  });
});
