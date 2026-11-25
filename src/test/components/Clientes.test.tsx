import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { Clientes } from "../../pages/Clientes/Clientes";
import { useClienteStore } from "../../stores/clienteStore";
import { useUIStore } from "../../stores/uiStore";
import type { Client } from "../../domain/types";

const CLIENTE: Client = {
  id: "cl-1",
  code: "CLI-001",
  name: "Ferreteria del Norte",
  email: "compras@ferreteria.do",
  taxId: "101-500-018",
  phone: "809-000-0000",
  address: "Calle 1",
  isActive: true,
  imageUrl: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
};

const CLIENTE_SIN_RNC: Client = {
  ...CLIENTE,
  id: "cl-2",
  code: "CLI-002",
  name: "Colmado La Esquina",
  taxId: null,
};

beforeEach(() => {
  useUIStore.setState({ addToast: vi.fn() });
  useClienteStore.setState({
    clientes: [CLIENTE],
    totalCount: 1,
    fetchClientes: vi.fn(),
    addCliente: vi.fn(),
    updateCliente: vi.fn(),
    deleteCliente: vi.fn(),
  });
});

const openForm = async () => {
  await userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(i18n.t("clientes.newClient"), "i"),
    }),
  );
};

const taxIdInput = () =>
  screen.getByLabelText(new RegExp(i18n.t("clientes.clientTaxId"), "i"));

const fillRequiredFields = async () => {
  await userEvent.type(
    screen.getByLabelText(new RegExp(i18n.t("clientes.clientName"), "i")),
    "Ferreteria del Norte",
  );
  await userEvent.type(
    screen.getByLabelText(new RegExp(i18n.t("clientes.clientEmail"), "i")),
    "compras@ferreteria.do",
  );
  await userEvent.type(
    screen.getByLabelText(new RegExp(i18n.t("clientes.clientPhone"), "i")),
    "809-000-0000",
  );
};

const submit = async () => {
  await userEvent.click(
    screen.getByRole("button", { name: i18n.t("common.create") }),
  );
};

describe("Clientes", () => {
  it("creates the client with the tax id trimmed", async () => {
    const addCliente = vi.fn();
    useClienteStore.setState({ addCliente });

    render(<Clientes />);
    await openForm();
    await fillRequiredFields();
    await userEvent.type(taxIdInput(), "  101-500-018  ");
    await submit();

    expect(addCliente).toHaveBeenCalledWith(
      expect.objectContaining({ taxId: "101-500-018" }),
    );
  });

  it("creates the client with a null tax id when the field is left empty", async () => {
    const addCliente = vi.fn();
    useClienteStore.setState({ addCliente });

    render(<Clientes />);
    await openForm();
    await fillRequiredFields();
    await submit();

    expect(addCliente).toHaveBeenCalledWith(
      expect.objectContaining({ taxId: null }),
    );
  });

  it("shows the tax id of the client when editing", async () => {
    render(<Clientes />);

    await userEvent.click(screen.getByTitle("Editar"));

    expect(taxIdInput()).toHaveValue("101-500-018");
  });

  it("shows an empty tax id when the client has none", async () => {
    useClienteStore.setState({ clientes: [CLIENTE_SIN_RNC], totalCount: 1 });

    render(<Clientes />);

    await userEvent.click(screen.getByTitle("Editar"));

    expect(taxIdInput()).toHaveValue("");
  });

  it("updates the client with the tax id trimmed", async () => {
    const updateCliente = vi.fn();
    useClienteStore.setState({ updateCliente });

    render(<Clientes />);
    await userEvent.click(screen.getByTitle("Editar"));

    await userEvent.clear(taxIdInput());
    await userEvent.type(taxIdInput(), " 101-999-999 ");
    await userEvent.click(
      screen.getByRole("button", { name: i18n.t("common.saveChanges") }),
    );

    expect(updateCliente).toHaveBeenCalledWith(
      CLIENTE.id,
      expect.objectContaining({ taxId: "101-999-999" }),
    );
  });

  it("updates the client with a null tax id when the field is cleared", async () => {
    const updateCliente = vi.fn();
    useClienteStore.setState({ updateCliente });

    render(<Clientes />);
    await userEvent.click(screen.getByTitle("Editar"));

    await userEvent.clear(taxIdInput());
    await userEvent.click(
      screen.getByRole("button", { name: i18n.t("common.saveChanges") }),
    );

    expect(updateCliente).toHaveBeenCalledWith(
      CLIENTE.id,
      expect.objectContaining({ taxId: null }),
    );
  });
});
