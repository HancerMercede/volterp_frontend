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
import { ResetPassword } from "../../pages/ResetPassword/ResetPassword";

const TOKEN = "token-123";

const renderPage = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
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
  vi.mocked(authService.resetPassword).mockResolvedValue(undefined);
});

const fillPasswords = async (password: string, confirm: string) => {
  await userEvent.type(screen.getByLabelText("New password"), password);
  await userEvent.type(screen.getByLabelText("Confirm password"), confirm);
};

describe("ResetPassword", () => {
  it("validates the link and renders the password form", async () => {
    renderPage(`/reset-password?token=${TOKEN}`);

    expect(await screen.findByLabelText("New password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(authService.getLinkStatus).toHaveBeenCalledWith(
      TOKEN,
      "password-reset",
    );
  });

  it("sends the new password and shows the confirmation", async () => {
    renderPage(`/reset-password?token=${TOKEN}`);
    await screen.findByLabelText("New password");

    await fillPasswords("secret123", "secret123");
    await userEvent.click(
      screen.getByRole("button", { name: "Save new password" }),
    );

    await waitFor(() =>
      expect(authService.resetPassword).toHaveBeenCalledWith({
        token: TOKEN,
        password: "secret123",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Password updated" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("You can now sign in with your new password."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("rejects mismatched passwords without calling the service", async () => {
    renderPage(`/reset-password?token=${TOKEN}`);
    await screen.findByLabelText("New password");

    await fillPasswords("secret123", "secret456");
    await userEvent.click(
      screen.getByRole("button", { name: "Save new password" }),
    );

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than 6 characters without calling the service", async () => {
    renderPage(`/reset-password?token=${TOKEN}`);
    await screen.findByLabelText("New password");

    await fillPasswords("abc", "abc");
    fireEvent.submit(screen.getByLabelText("New password").closest("form")!);

    expect(
      await screen.findByText("Password must be at least 6 characters"),
    ).toBeInTheDocument();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it("redirects to the invalid link screen when the token is missing", async () => {
    renderPage("/reset-password");

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
    renderPage(`/reset-password?token=${TOKEN}`);

    expect(
      await screen.findByText("Invalid link destination"),
    ).toBeInTheDocument();
  });

  it("redirects to the invalid link screen when the service fails", async () => {
    vi.mocked(authService.getLinkStatus).mockRejectedValue(
      new Error("Network unavailable"),
    );
    renderPage(`/reset-password?token=${TOKEN}`);

    expect(
      await screen.findByText("Invalid link destination"),
    ).toBeInTheDocument();
  });

  it("redirects to the invalid link screen when the reset is rejected", async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue(
      new Error("Token expired"),
    );
    renderPage(`/reset-password?token=${TOKEN}`);
    await screen.findByLabelText("New password");

    await fillPasswords("secret123", "secret123");
    await userEvent.click(
      screen.getByRole("button", { name: "Save new password" }),
    );

    expect(
      await screen.findByText("Invalid link destination"),
    ).toBeInTheDocument();
  });
});
