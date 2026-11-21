import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "../../i18n";
import { useAuthStore } from "../../stores/authStore";
import { useElectronicInvoiceSequenceStore } from "../../stores/electronicInvoiceSequenceStore";
import { useUIStore } from "../../stores/uiStore";
import { Ranges } from "../../pages/FacturacionElectronica/Ranges/Ranges";
import type { EcfDocumentType } from "../../domain/constants/electronicInvoicing";
import type { ElectronicInvoiceSequence } from "../../domain/types";

const SEQUENCES: ElectronicInvoiceSequence[] = [
  {
    id: "s1",
    companyId: "c1",
    issuerTaxId: "101-12345-6",
    documentType: "Consumer",
    from: 1,
    to: 100,
    currentSequence: 12,
    expiresAt: "2026-12-31T00:00:00",
    hasRoom: true,
  },
  {
    id: "s2",
    companyId: "c1",
    issuerTaxId: "201-98765-4",
    documentType: "FiscalCredit",
    from: 1,
    to: 50,
    currentSequence: 50,
    expiresAt: null,
    hasRoom: false,
  },
];

const signIn = () => {
  useAuthStore.setState({
    token: "token-1",
    user: {
      username: "user",
      email: "user@example.com",
      fullName: "User",
      role: "admin",
      companyId: "c1",
    },
  });
};

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

beforeEach(() => {
  vi.clearAllMocks();
  signIn();
  useElectronicInvoiceSequenceStore.setState({
    sequences: SEQUENCES,
    loading: false,
    error: null,
    totalCount: SEQUENCES.length,
    pageCount: 1,
    fetchSequences: vi.fn(),
    addSequence: vi.fn(async () => SEQUENCES[0]),
    updateSequence: vi.fn(async () => SEQUENCES[0]),
    annulSequence: vi.fn(async () => ({
      code: "0101",
      name: "Anulacion",
      messages: ["El rango fue anulado por la DGII"],
      annulledAt: "2026-11-20T15:00:00",
    })),
  });
  useUIStore.setState({
    toasts: [],
    modals: [],
    isLoading: false,
    addToast: vi.fn(),
  });
});

const rowOf = (text: string) => {
  const row = screen.getByText(text).closest("tr");
  expect(row).not.toBeNull();
  return row as HTMLElement;
};

import { usePermissionStore } from "../../stores/permissionStore";

// Los permisos ahora los da la API: el test declara lo que el llamador
// puede hacer, como lo haria el servidor.
usePermissionStore.setState({
  permissions: new Set([
    "facturacion.read",
    "facturacion.write",
    "facturacion.delete",
  ]),
  status: "ready",
});

describe("Ranges", () => {
  it("muestra los rangos del store", () => {
    render(<Ranges />);

    expect(screen.getByText("101-12345-6")).toBeInTheDocument();
    expect(screen.getByText("Consumer")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("2026-12-31")).toBeInTheDocument();
  });

  it("muestra el tipo de comprobante tal como lo manda el backend", () => {
    render(<Ranges />);

    expect(screen.getByText("Consumer")).toBeInTheDocument();
    expect(screen.getByText("FiscalCredit")).toBeInTheDocument();
  });

  it("un tipo de comprobante fuera del contrato se muestra como desconocido", () => {
    useElectronicInvoiceSequenceStore.setState({
      sequences: [
        {
          ...SEQUENCES[0],
          documentType: "0" as unknown as EcfDocumentType,
        },
      ],
      totalCount: 1,
    });

    render(<Ranges />);

    expect(
      screen.getByText(i18n.t("facturacion.common.unknown")),
    ).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando el tenant no tiene rangos", () => {
    useElectronicInvoiceSequenceStore.setState({ sequences: [], totalCount: 0 });

    render(<Ranges />);

    expect(
      screen.getByText(i18n.t("facturacion.ranges.empty")),
    ).toBeInTheDocument();
  });

  it("el modal de alta manda el payload que espera el store", async () => {
    const addSequence = vi.fn(async () => SEQUENCES[0]);
    useElectronicInvoiceSequenceStore.setState({ addSequence });

    render(<Ranges />);

    await userEvent.click(screen.getByRole("button", { name: /Nuevo rango/ }));

    await userEvent.type(
      screen.getByLabelText(/RNC emisor/),
      "101-12345-6",
    );
    await userEvent.selectOptions(
      screen.getByLabelText(/Tipo de comprobante/),
      "Consumer",
    );
    fireEvent.change(screen.getByLabelText(/Desde/), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/Hasta/), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/Posición/), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText(/Vence/), {
      target: { value: "2026-12-31" },
    });

    await userEvent.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() => {
      expect(addSequence).toHaveBeenCalledWith({
        issuerTaxId: "101-12345-6",
        documentType: "Consumer",
        from: 1,
        to: 100,
        position: 0,
        expiresAt: "2026-12-31",
      });
    });
  });

  it("la anulación muestra los mensajes que devolvió el backend", async () => {
    const annulSequence = vi.fn(async () => ({
      code: "0101",
      name: "Anulacion",
      messages: ["El rango fue anulado por la DGII"],
      annulledAt: "2026-11-20T15:00:00",
    }));
    useElectronicInvoiceSequenceStore.setState({ annulSequence });

    render(<Ranges />);

    await userEvent.click(
      within(rowOf("101-12345-6")).getByRole("button", { name: "Anular rango" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(
      await screen.findByText("El rango fue anulado por la DGII"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t("facturacion.ranges.annulSuccess")),
    ).toBeInTheDocument();
    expect(annulSequence).toHaveBeenCalledWith("s1");
  });

  it("la anulación fallida muestra el error del backend", async () => {
    const annulSequence = vi.fn(async () => {
      throw new Error("The range was already annulled.");
    });
    useElectronicInvoiceSequenceStore.setState({ annulSequence });

    render(<Ranges />);

    await userEvent.click(
      within(rowOf("101-12345-6")).getByRole("button", { name: "Anular rango" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(
      await screen.findByText("The range was already annulled."),
    ).toBeInTheDocument();
  });

  it("el formulario de edición no deja cambiar el emisor, el tipo ni el inicio del rango", async () => {
    render(<Ranges />);

    await userEvent.click(
      within(rowOf("101-12345-6")).getByTitle("Editar"),
    );

    expect(screen.getByLabelText(/RNC emisor/)).toBeDisabled();
    expect(screen.getByLabelText(/Tipo de comprobante/)).toBeDisabled();
    expect(screen.getByLabelText(/Desde/)).toBeDisabled();
    expect(screen.getByLabelText(/Hasta/)).not.toBeDisabled();
    expect(screen.getByLabelText(/Posición/)).not.toBeDisabled();
  });
});
