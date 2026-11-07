import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/authService", () => ({
  authService: {
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    activateAccount: vi.fn(),
    getLinkStatus: vi.fn(),
  },
}));

import i18n from "../../i18n";
import { authService } from "../../infrastructure/api/authService";
import { ActivateAccount } from "../../pages/ActivateAccount/ActivateAccount";

const TOKEN = "token-123";

const renderPage = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/invalid-link" element={<div>Invalid link destination</div>} />
      </Routes>
    </MemoryRouter>,
  );

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authService.getLinkStatus).mockResolvedValue({
    valid: true,
    email: "user@example.com",
    expiresAt: null,
  });
  vi.mocked(authService.activateAccount).mockResolvedValue(undefined);
});

const fillPasswords = async (password: string, confirm: string) => {
  await userEvent.type(screen.getByLabelText("New password"), password);
  await userEvent.type(screen.getByLabelText("Confirm password"), confirm);
};

describe("ActivateAccount", () => {
  it("validates the link and renders the account email with the password form", async () => {
    renderPage(`/activate-account?token=${TOKEN}`);

    expect(await screen.findByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByLabelText("Account email")).toHaveValue(
      "user@example.com",
    );
    expect(authService.getLinkStatus).toHaveBeenCalledWith(
      TOKEN,
      "activation",
    );
  });

  it("activates the account and shows the confirmation", async () => {
    renderPage(`/activate-account?token=${TOKEN}`);
    await screen.findByLabelText("New password");

    await fillPasswords("secret123", "secret123");
    await userEvent.click(
      screen.getByRole("button", { name: "Activate account" }),
    );

    await waitFor(() =>
      expect(authService.activateAccount).toHaveBeenCalledWith({
        token: TOKEN,
        password: "secret123",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Account activated" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your account is now active. You can sign in."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("rejects mismatched passwords without calling the service", async () => {
    renderPage(`/activate-account?token=${TOKEN}`);
    await screen.findByLabelText("New password");

    await fillPasswords("secret123", "secret456");
    await userEvent.click(
      screen.getByRole("button", { name: "Activate account" }),
    );

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
    expect(authService.activateAccount).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 6 characters without calling the service", async () => {
    renderPage(`/activate-account?token=${TOKEN}`);
    await screen.findByLabelText("New password");

    await fillPasswords("abc", "abc");
    fireEvent.submit(screen.getByLabelText("New password").closest("form")!);

    expect(
      await screen.findByText("Password must be at least 6 characters"),
    ).toBeInTheDocument();
    expect(authService.activateAccount).not.toHaveBeenCalled();
  });

  it("redirects to the invalid link screen when the token is missing", async () => {
    renderPage("/activate-account");

    expect(
      await screen.findByText("Invalid link destination"),
    ).toBeInTheDocument();
    expect(authService.getLinkStatus).not.toHaveBeenCalled();
  });

  it("redirects to the invalid link screen when the link is not valid", async () => {
    vi.mocked(authService.getLinkStatus).mockResolvedValue({
      valid: false,
      email: null,
      expiresAt: null,
    });
    renderPage(`/activate-account?token=${TOKEN}`);

    expect(
      await screen.findByText("Invalid link destination"),
    ).toBeInTheDocument();
  });

  it("redirects to the invalid link screen when the activation is rejected", async () => {
    vi.mocked(authService.activateAccount).mockRejectedValue(
      new Error("Token expired"),
    );
    renderPage(`/activate-account?token=${TOKEN}`);
    await screen.findByLabelText("New password");

    await fillPasswords("secret123", "secret123");
    await userEvent.click(
      screen.getByRole("button", { name: "Activate account" }),
    );

    expect(
      await screen.findByText("Invalid link destination"),
    ).toBeInTheDocument();
  });
});
