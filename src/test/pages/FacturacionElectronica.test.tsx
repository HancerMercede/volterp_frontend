import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../i18n";
import { FacturacionElectronica } from "../../pages/FacturacionElectronica/FacturacionElectronica";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <FacturacionElectronica />
    </MemoryRouter>,
  );

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FacturacionElectronica", () => {
  it("muestra las seis secciones del modulo", () => {
    renderPage();

    expect(
      screen.getByText("Facturación electrónica"),
    ).toBeInTheDocument();
    expect(screen.getByText("Emisores")).toBeInTheDocument();
    expect(screen.getByText("Rangos de e-NCF")).toBeInTheDocument();
    expect(screen.getByText("Certificados")).toBeInTheDocument();
    expect(screen.getByText("Comprobantes")).toBeInTheDocument();
    expect(screen.getByText("Recepción")).toBeInTheDocument();
    expect(screen.getByText("Configuración fiscal")).toBeInTheDocument();
  });

  it("lleva a la seccion de emisores", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Emisores/ }));

    expect(navigate).toHaveBeenCalledWith("/facturacion/emisores");
  });

  it("lleva a la seccion de comprobantes", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /Comprobantes/ }));

    expect(navigate).toHaveBeenCalledWith("/facturacion/comprobantes");
  });
});
