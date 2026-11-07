import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import "../../i18n";
import { ClienteSelector } from "../../pages/Ventas/components/ClienteSelector";
import type { Client } from "../../domain/types";

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

const renderSelector = (selectedClienteId: string | null) =>
  render(
    <ClienteSelector
      clientes={[CLIENT]}
      selectedClienteId={selectedClienteId}
      onClienteSelect={vi.fn()}
    />,
  );

const StatefulSelector = () => {
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(
    "c1",
  );
  return (
    <ClienteSelector
      clientes={[CLIENT, OTHER_CLIENT]}
      selectedClienteId={selectedClienteId}
      onClienteSelect={setSelectedClienteId}
    />
  );
};

describe("ClienteSelector", () => {
  it("shows the selected client with the phone and a change action", () => {
    renderSelector("c1");

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("809-555-1201")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });

  it("shows the client initials in the avatar", () => {
    renderSelector("c1");

    expect(screen.getByText("AC")).toBeInTheDocument();
  });

  it("goes back to the picker when the change action is pressed", async () => {
    renderSelector("c1");

    await userEvent.click(screen.getByRole("button", { name: "Change" }));

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows the client name in the combobox after pressing change", async () => {
    renderSelector("c1");

    await userEvent.click(screen.getByRole("button", { name: "Change" }));

    expect(screen.getByRole("combobox")).toHaveValue("Acme Corp");
  });

  it("returns to the card after picking another client", async () => {
    render(<StatefulSelector />);

    await userEvent.click(screen.getByRole("button", { name: "Change" }));
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(
      screen.getByRole("button", { name: /Distribuidora Aurora/ }),
    );

    expect(screen.getByText("Distribuidora Aurora")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });

  it("shows the search placeholder and the empty label", async () => {
    render(
      <ClienteSelector
        clientes={[]}
        selectedClienteId={null}
        onClienteSelect={vi.fn()}
      />,
    );

    const combobox = screen.getByRole("combobox", { name: "Client" });
    expect(combobox).toHaveAttribute(
      "placeholder",
      "Search client by name, email or code...",
    );

    await userEvent.click(combobox);
    expect(screen.getByText("No clients found")).toBeInTheDocument();
  });
});
