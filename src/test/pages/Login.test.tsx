import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";

import i18n from "../../i18n";
import { Login } from "../../pages/Login/Login";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Login />
    </MemoryRouter>,
  );

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

describe("Login", () => {
  it("translates the form and the copy of the brand panel", () => {
    renderPage();

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(
      screen.getByText("Comprehensive business management system"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sales and inventory management")).toBeInTheDocument();
    expect(
      screen.getByText("Payroll and human resources control"),
    ).toBeInTheDocument();
    expect(screen.getByText("Real-time reports and analytics")).toBeInTheDocument();
  });

  it("keeps the wordmark as it is", () => {
    renderPage();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("VOLT ERP");
  });
});
