import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { Accounts } from "../../pages/Contabilidad/Accounts/Accounts";
import { accountService } from "../../infrastructure/api/accountService";
import { useAccountStore } from "../../stores/accountStore";
import { useAuthStore } from "../../stores/authStore";
import type { AccountDto, PagedResult } from "../../domain/types";

vi.mock("../../infrastructure/api/accountService", () => ({
  accountService: {
    getAccounts: vi.fn(),
    getAccountById: vi.fn(),
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

const service = vi.mocked(accountService);

const CASH: AccountDto = {
  id: "a1",
  code: "1100",
  name: "Caja",
  accountType: "Asset",
  parentId: null,
  isPostable: true,
  isActive: true,
  notes: null,
};

const paged = (items: AccountDto[]): PagedResult<AccountDto> => ({
  items,
  rowCount: items.length,
  pageNumber: 1,
  pageSize: 200,
  pageCount: 1,
});

const userWithRole = (role: string) => ({
  username: "user",
  email: "user@erp.com",
  fullName: "User",
  role,
  companyId: "c1",
});

const renderAccounts = () =>
  render(
    <MemoryRouter>
      <Accounts />
    </MemoryRouter>,
  );

const newAccountButton = () =>
  screen.getByRole("button", {
    name: new RegExp(i18n.t("contabilidad.accounts.new"), "i"),
  });

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: userWithRole("admin") });
  useAccountStore.setState({
    accounts: [],
    totalCount: 0,
    pageCount: 0,
    loading: false,
    error: null,
  });
  service.getAccounts.mockResolvedValue(paged([CASH]));
  service.createAccount.mockResolvedValue(CASH);
  service.updateAccount.mockResolvedValue(CASH);
  service.deleteAccount.mockResolvedValue(undefined);
});

describe("Accounts permission gate", () => {
  it("shows the save actions for a superadmin", async () => {
    useAuthStore.setState({ user: userWithRole("superadmin") });
    renderAccounts();
    await screen.findByText("Caja", { selector: "span[data-depth]" });

    expect(newAccountButton()).toBeInTheDocument();
    expect(screen.getAllByTitle("Editar")).toHaveLength(1);
    expect(screen.getAllByTitle("Eliminar")).toHaveLength(1);
  });
  it.each(["inventario", "rrhh"])(
    "hides every save action for the %s role",
    async (role) => {
      useAuthStore.setState({ user: userWithRole(role) });
      renderAccounts();
      await screen.findByText("Caja", { selector: "span[data-depth]" });

      expect(
        screen.queryByRole("button", {
          name: new RegExp(i18n.t("contabilidad.accounts.new"), "i"),
        }),
      ).toBeNull();
      expect(screen.queryAllByTitle("Editar")).toHaveLength(0);
      expect(screen.queryAllByTitle("Eliminar")).toHaveLength(0);
    },
  );

  it("hides every save action without a session", async () => {
    useAuthStore.setState({ user: null });
    renderAccounts();
    await screen.findByText("Caja", { selector: "span[data-depth]" });

    expect(
      screen.queryByRole("button", {
        name: new RegExp(i18n.t("contabilidad.accounts.new"), "i"),
      }),
    ).toBeNull();
    expect(screen.queryAllByTitle("Editar")).toHaveLength(0);
    expect(screen.queryAllByTitle("Eliminar")).toHaveLength(0);
  });

  it("never calls the write service for a role that cannot manage accounts", async () => {
    useAuthStore.setState({ user: userWithRole("inventario") });
    renderAccounts();
    await waitFor(() => expect(service.getAccounts).toHaveBeenCalled());

    expect(service.createAccount).not.toHaveBeenCalled();
    expect(service.updateAccount).not.toHaveBeenCalled();
    expect(service.deleteAccount).not.toHaveBeenCalled();
  });

  it("blocks the submit of an open form when the role loses the permission", async () => {
    renderAccounts();
    await screen.findByText("Caja", { selector: "span[data-depth]" });
    await userEvent.click(newAccountButton());

    useAuthStore.setState({ user: userWithRole("inventario") });

    const dialog = screen.getByRole("dialog");
    await userEvent.type(
      within(dialog).getByLabelText(
        new RegExp(i18n.t("contabilidad.accounts.code"), "i"),
      ),
      "1100",
    );
    await userEvent.type(
      within(dialog).getByLabelText(
        new RegExp(i18n.t("contabilidad.accounts.name"), "i"),
      ),
      "Caja",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: i18n.t("common.create") }),
    );

    expect(within(dialog).getByRole("alert")).toBeInTheDocument();
    expect(service.createAccount).not.toHaveBeenCalled();
  });
});
