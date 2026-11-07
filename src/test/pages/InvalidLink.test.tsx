import { render, screen } from "@testing-library/react";
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
import { InvalidLink } from "../../pages/InvalidLink/InvalidLink";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/invalid-link"]}>
      <Routes>
        <Route path="/invalid-link" element={<InvalidLink />} />
      </Routes>
    </MemoryRouter>,
  );

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("InvalidLink", () => {
  it("explains that the link is no longer usable", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "This link is not valid" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The link expired or was already used. Request a new one to continue.",
      ),
    ).toBeInTheDocument();
  });

  it("offers a new link and a way back to the login", () => {
    renderPage();

    expect(
      screen.getByRole("link", { name: "Request a new link" }),
    ).toHaveAttribute("href", "/forgot-password");
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
