import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const renderSelector = (selectedClienteId: string | null) =>
  render(
    <ClienteSelector
      clientes={[CLIENT]}
      selectedClienteId={selectedClienteId}
      onClienteSelect={vi.fn()}
      searchValue={selectedClienteId ? CLIENT.name : ""}
      onSearchChange={vi.fn()}
    />,
  );

describe("ClienteSelector", () => {
  it("shows the selected client with the phone and a change action", () => {
    renderSelector("c1");

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("809-555-1201")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change" })).toBeInTheDocument();
  });

  it("goes back to the picker when the change action is pressed", async () => {
    renderSelector("c1");

    await userEvent.click(screen.getByRole("button", { name: "Change" }));

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
