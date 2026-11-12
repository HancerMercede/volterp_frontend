import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { Contabilidad } from "../../pages/Contabilidad/Contabilidad";
import { useTransaccionStore } from "../../stores/transaccionStore";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="pathname">{location.pathname}</span>;
}

function renderContabilidad() {
  render(
    <MemoryRouter initialEntries={["/contabilidad"]}>
      <Contabilidad />
      <LocationProbe />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useTransaccionStore.setState({
    transacciones: [],
    totalCount: 0,
    pageCount: 0,
    loading: false,
    error: null,
    fetchTransacciones: vi.fn(),
    addTransaccion: vi.fn(),
    updateTransaccion: vi.fn(),
    deleteTransaccion: vi.fn(),
  });
});

describe("Contabilidad", () => {
  it("shows the transactions report of the module", () => {
    renderContabilidad();

    expect(
      screen.getByRole("button", {
        name: new RegExp(i18n.t("contabilidad.newTransaction"), "i"),
      }),
    ).toBeInTheDocument();
  });

  it("navigates to the accounts tab", async () => {
    renderContabilidad();

    await userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`^${i18n.t("contabilidad.navAccounts")}$`, "i"),
      }),
    );

    expect(screen.getByTestId("pathname")).toHaveTextContent(
      "/contabilidad/cuentas",
    );
  });

  it("navigates to the accounts receivable tab", async () => {
    renderContabilidad();

    await userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(
          `^${i18n.t("contabilidad.navAccountsReceivable")}$`,
          "i",
        ),
      }),
    );

    expect(screen.getByTestId("pathname")).toHaveTextContent("/contabilidad/cxc");
  });

  it("navigates to the accounts payable tab", async () => {
    renderContabilidad();

    await userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`^${i18n.t("contabilidad.navAccountsPayable")}$`, "i"),
      }),
    );

    expect(screen.getByTestId("pathname")).toHaveTextContent("/contabilidad/cxp");
  });
});
