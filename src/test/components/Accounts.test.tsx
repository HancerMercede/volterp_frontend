import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { Accounts } from "../../pages/Contabilidad/Accounts/Accounts";
import { accountService } from "../../infrastructure/api/accountService";
import { useAccountStore } from "../../stores/accountStore";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
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

const BANK: AccountDto = {
  id: "a2",
  code: "1101",
  name: "Banco",
  accountType: "Asset",
  parentId: "a1",
  isPostable: true,
  isActive: true,
  notes: null,
};

const RETIRED: AccountDto = {
  id: "a3",
  code: "1200",
  name: "Cuenta cerrada",
  accountType: "Liability",
  parentId: null,
  isPostable: false,
  isActive: false,
  notes: null,
};

const ADMIN = {
  username: "admin",
  email: "admin@erp.com",
  fullName: "Admin",
  role: "admin",
  companyId: "c1",
};

const paged = (items: AccountDto[]): PagedResult<AccountDto> => ({
  items,
  rowCount: items.length,
  pageNumber: 1,
  pageSize: 200,
  pageCount: 1,
});

const toasts: { message: string; type: string }[] = [];

const accountName = (name: string) =>
  screen.getByText(name, { selector: "span[data-depth]" });

const renderAccounts = () =>
  render(
    <MemoryRouter>
      <Accounts />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  toasts.length = 0;
  useAuthStore.setState({ user: ADMIN });
  useUIStore.setState({
    addToast: (message: string, type: string) => {
      toasts.push({ message, type });
    },
  });
  useAccountStore.setState({
    accounts: [],
    totalCount: 0,
    pageCount: 0,
    loading: false,
    error: null,
  });
  service.getAccounts.mockResolvedValue(paged([]));
  service.createAccount.mockResolvedValue(CASH);
  service.updateAccount.mockResolvedValue(CASH);
  service.deleteAccount.mockResolvedValue(undefined);
});

const openCreateForm = async () => {
  await userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(i18n.t("contabilidad.accounts.new"), "i"),
    }),
  );
};

const fillCodeAndName = async (code: string, name: string) => {
  await userEvent.type(
    screen.getByLabelText(new RegExp(i18n.t("contabilidad.accounts.code"), "i")),
    code,
  );
  await userEvent.type(
    screen.getByLabelText(new RegExp(i18n.t("contabilidad.accounts.name"), "i")),
    name,
  );
};

const submitForm = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: i18n.t("common.create") }),
  );
};

describe("Accounts", () => {
  it("loads the catalog through the account service", async () => {
    renderAccounts();

    await waitFor(() => expect(service.getAccounts).toHaveBeenCalled());
    expect(service.getAccounts).toHaveBeenCalledWith(1, expect.any(Number));
  });

  it("lists the accounts returned by the service", async () => {
    service.getAccounts.mockResolvedValue(paged([CASH, BANK]));
    renderAccounts();

    expect(
      await screen.findByText("Caja", { selector: "span[data-depth]" }),
    ).toBeInTheDocument();
    expect(accountName("Banco")).toBeInTheDocument();
  });

  it("sorts the catalog by code because the backend does not order it", async () => {
    service.getAccounts.mockResolvedValue(paged([BANK, RETIRED, CASH]));
    renderAccounts();

    const rows = await screen.findAllByRole("row");
    expect(rows[1]).toHaveTextContent("1100");
    expect(rows[2]).toHaveTextContent("1101");
    expect(rows[3]).toHaveTextContent("1200");
  });

  it("nests a child account under its parent", async () => {
    service.getAccounts.mockResolvedValue(paged([CASH, BANK]));
    renderAccounts();

    expect(
      await screen.findByText("Caja", { selector: "span[data-depth]" }),
    ).toHaveAttribute("data-depth", "0");
    expect(accountName("Banco")).toHaveAttribute("data-depth", "1");
  });

  it("lists the inactive accounts and marks them", async () => {
    service.getAccounts.mockResolvedValue(paged([RETIRED]));
    renderAccounts();

    expect(
      await screen.findByText("Cuenta cerrada", { selector: "span[data-depth]" }),
    ).toHaveAttribute("data-active", "false");
  });

  it("creates an account with the values of the form", async () => {
    renderAccounts();
    await openCreateForm();
    await fillCodeAndName("1100", "Caja");
    await submitForm();

    await waitFor(() =>
      expect(service.createAccount).toHaveBeenCalledWith({
        code: "1100",
        name: "Caja",
        accountType: "Asset",
        parentId: null,
        isPostable: true,
        isActive: true,
        notes: null,
      }),
    );
  });

  it("shows the backend rejection verbatim", async () => {
    service.createAccount.mockRejectedValue(
      new Error("The code is already in use."),
    );
    renderAccounts();
    await openCreateForm();
    await fillCodeAndName("1100", "Caja");
    await submitForm();

    expect(
      await within(screen.getByRole("dialog")).findByText(
        "The code is already in use.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the backend rejection when an account with children is deleted", async () => {
    service.getAccounts.mockResolvedValue(paged([CASH, BANK]));
    service.deleteAccount.mockRejectedValue(
      new Error(
        "The account cannot be deleted because it has child accounts.",
      ),
    );
    renderAccounts();
    await screen.findByText("Caja", { selector: "span[data-depth]" });

    await userEvent.click(screen.getAllByTitle("Eliminar")[0]);
    await userEvent.click(
      screen.getByRole("button", { name: i18n.t("common.confirmDeleteAction") }),
    );

    await waitFor(() =>
      expect(toasts).toContainEqual({
        message:
          "The account cannot be deleted because it has child accounts.",
        type: "error",
      }),
    );
  });

  it("shows the save actions for an admin", async () => {
    service.getAccounts.mockResolvedValue(paged([CASH]));
    renderAccounts();
    await screen.findByText("Caja", { selector: "span[data-depth]" });

    expect(
      screen.getByRole("button", {
        name: new RegExp(i18n.t("contabilidad.accounts.new"), "i"),
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByTitle("Editar")).toHaveLength(1);
  });

  it("hides the save actions for a role that cannot manage accounts", async () => {
    useAuthStore.setState({ user: { ...ADMIN, role: "ventas" } });
    service.getAccounts.mockResolvedValue(paged([CASH]));
    renderAccounts();
    await screen.findByText("Caja", { selector: "span[data-depth]" });

    expect(
      screen.queryByRole("button", {
        name: new RegExp(i18n.t("contabilidad.accounts.new"), "i"),
      }),
    ).toBeNull();
    expect(screen.queryAllByTitle("Editar")).toHaveLength(0);
  });

  it("hides the save actions for the contabilidad role, which the accounts endpoints reject", async () => {
    useAuthStore.setState({ user: { ...ADMIN, role: "contabilidad" } });
    service.getAccounts.mockResolvedValue(paged([CASH]));
    renderAccounts();
    await screen.findByText("Caja", { selector: "span[data-depth]" });

    expect(
      screen.queryByRole("button", {
        name: new RegExp(i18n.t("contabilidad.accounts.new"), "i"),
      }),
    ).toBeNull();
    expect(screen.queryAllByTitle("Editar")).toHaveLength(0);
  });

  it("hides the delete action for a role without delete permission on contabilidad", async () => {
    useAuthStore.setState({ user: { ...ADMIN, role: "contabilidad" } });
    service.getAccounts.mockResolvedValue(paged([CASH]));
    renderAccounts();
    await screen.findByText("Caja", { selector: "span[data-depth]" });

    expect(screen.queryAllByTitle("Eliminar")).toHaveLength(0);
  });
});
