import { render, screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/companyService", () => ({
  companyService: {
    getCompany: vi.fn().mockResolvedValue(null),
    updateCompany: vi.fn(),
  },
}));

import i18n from "../../i18n";
import { useAuthStore } from "../../stores/authStore";
import { useCompanyStore } from "../../stores/companyStore";
import { Configuracion } from "../../pages/Configuracion/Configuracion";

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
