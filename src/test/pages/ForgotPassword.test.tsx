import { render, screen, waitFor } from "@testing-library/react";
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
import { ForgotPassword } from "../../pages/ForgotPassword/ForgotPassword";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/forgot-password"]}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </MemoryRouter>,
  );

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authService.forgotPassword).mockResolvedValue(undefined);
});

describe("ForgotPassword", () => {
  it("renders the email form", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Recover your access" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send link" }),
    ).toBeInTheDocument();
  });

  it("sends the email to the service and shows the confirmation", async () => {
    renderPage();

    await userEvent.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send link" }));

    await waitFor(() =>
      expect(authService.forgotPassword).toHaveBeenCalledWith({
        email: "user@example.com",
      }),
    );
    expect(
      await screen.findByRole("heading", { name: "Check your inbox" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
  });

  it("shows the service error and keeps the form", async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue(
      new Error("Network unavailable"),
    );
    renderPage();

    await userEvent.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send link" }));

    expect(await screen.findByText("Network unavailable")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("falls back to the generic error when the failure has no message", async () => {
    vi.mocked(authService.forgotPassword).mockRejectedValue("boom");
    renderPage();

    await userEvent.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send link" }));

    expect(
      await screen.findByText("The request could not be completed"),
    ).toBeInTheDocument();
  });

  it("returns to the form when the user asks to send the link again", async () => {
    renderPage();

    await userEvent.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send link" }));

    await userEvent.click(
      await screen.findByRole("button", { name: "Send again" }),
    );

    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
  });

  it("always links back to the login", async () => {
    renderPage();

    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/login",
    );

    await userEvent.type(
      screen.getByLabelText("Email"),
      "user@example.com",
    );
    await userEvent.click(screen.getByRole("button", { name: "Send link" }));

    expect(
      await screen.findByRole("link", { name: "Back to sign in" }),
    ).toHaveAttribute("href", "/login");
  });
});
