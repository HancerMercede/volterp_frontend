import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "../../i18n";
import { ClienteSelector } from "../../pages/Ventas/components/ClienteSelector";
import type { Client } from "../../domain/types";

/**
 * Caracterizacion del picker de cliente del POS.
 *
 * El componente compartido `SearchableSelect` reporta `onChange("")` en cada
 * tecla (para no borrar el texto mientras se escribe). `ClienteSelector`
 * interpreta ese "" como "sin seleccion" y por eso escribir borra la
 * seleccion. Estos tests fijan ese comportamiento de HOY: cuando se corrija,
 * el test que lo describe cambia a proposito.
 */

const CLIENT: Client = {
  id: "c1",
  code: "CLI-001",
  name: "Acme Corp",
  email: "ventas@acme.do",
  phone: "809-555-1201",
  address: "Calle 1",
  isActive: true,
  imageUrl: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
};

const OTHER_CLIENT: Client = {
  ...CLIENT,
  id: "c2",
  code: "CLI-002",
  name: "Distribuidora Aurora",
  email: "compras@aurora.do",
};

const StatefulSelector = ({ onChange }: { onChange?: (id: string | null) => void }) => {
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(
    "c1",
  );
  return (
    <ClienteSelector
      clientes={[CLIENT, OTHER_CLIENT]}
      selectedClienteId={selectedClienteId}
      onClienteSelect={(id) => {
        onChange?.(id);
        setSelectedClienteId(id);
      }}
    />
  );
};

describe("ClienteSelector — caracterizacion del picker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mantiene la seleccion cuando el usuario escribe en el buscador", async () => {
    const onClienteSelect = vi.fn();
    render(
      <ClienteSelector
        clientes={[CLIENT]}
        selectedClienteId="c1"
        onClienteSelect={onClienteSelect}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Change" }));
    await userEvent.type(screen.getByRole("combobox", { name: "Client" }), "Ac");

    expect(onClienteSelect).not.toHaveBeenCalledWith(null);
  });

  it("deja el texto escrito en el input mientras se busca", async () => {
    render(<StatefulSelector />);

    await userEvent.click(screen.getByRole("button", { name: "Change" }));
    await userEvent.type(screen.getByRole("combobox", { name: "Client" }), "Ac");

    // El texto exacto depende de como el input resuelva la seleccion del
    // label al enfocar; lo que se fija es que el texto escrito queda a la
    // vista mientras se busca.
    const input = screen.getByRole("combobox", {
      name: "Client",
    }) as HTMLInputElement;
    expect(input.value).toContain("Ac");
    // El picker sigue abierto porque se esta buscando; la card vuelve cuando
    // se elige una opcion.
    expect(screen.queryByRole("button", { name: "Change" })).toBeNull();
  });

  it("vuelve a la card cuando se elige una opcion de la lista", async () => {
    const onChange = vi.fn();
    render(<StatefulSelector onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Change" }));
    await userEvent.click(screen.getByRole("combobox", { name: "Client" }));
    await userEvent.click(
      screen.getByRole("button", { name: /Distribuidora Aurora/ }),
    );

    expect(onChange).toHaveBeenLastCalledWith("c2");
    expect(screen.getByText("Distribuidora Aurora")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });
});
