import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "../../i18n";
import { VentasList } from "../../pages/Ventas/components/VentasList";
import type { SaleDto } from "../../domain/types";

const createVenta = (overrides: Partial<SaleDto> = {}): SaleDto =>
  ({
    id: '1',
    code: "Vent-001",
    companyId: '1',
    clienteId: null,
    clienteName: "Acme Corp",
    status: "Completed",
    total: 100,
    notes: null,
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: null,
    items: [],
    ...overrides,
  }) as SaleDto;

const VENTAS = [
  createVenta(),
  createVenta({
    id: '2',
    code: "Vent-002",
    clienteName: "Other Corp",
  }),
];

function VentasListHarness({ ventas }: { ventas: SaleDto[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <VentasList
      ventas={ventas}
      onVentaClick={vi.fn()}
      onDelete={vi.fn()}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      pageNumber={pageNumber}
      onPageChange={setPageNumber}
    />
  );
}

const search = (term: string) => {
  fireEvent.change(screen.getByRole("textbox"), { target: { value: term } });
};

describe("VentasList", () => {
  it("finds a sale by its business code", () => {
    render(<VentasListHarness ventas={VENTAS} />);

    search("vent-001");

    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.queryByText("Other Corp")).not.toBeInTheDocument();
  });

  it("keeps filtering by client name", () => {
    render(<VentasListHarness ventas={VENTAS} />);

    search("Other");

    expect(screen.getByText("Other Corp")).toBeInTheDocument();
    expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
  });

  it("renders the business code column", () => {
    render(<VentasListHarness ventas={VENTAS} />);

    expect(screen.getByText("Vent-001")).toBeInTheDocument();
    expect(screen.getByText("Vent-002")).toBeInTheDocument();
  });
});
