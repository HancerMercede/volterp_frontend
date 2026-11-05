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

function VentasListHarness({
  ventas,
  pageNumber = 1,
  totalCount = 50,
}: {
  ventas: SaleDto[];
  pageNumber?: number;
  totalCount?: number;
}) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <VentasList
      ventas={ventas}
      totalCount={totalCount}
      onVentaClick={vi.fn()}
      onDelete={vi.fn()}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      pageNumber={pageNumber}
      onPageChange={vi.fn()}
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

  it("renders every row of the page it receives, even on page 2", () => {
    const pageTwo = Array.from({ length: 10 }, (_, index) =>
      createVenta({
        id: index + 11,
        code: `Vent-0${index + 11}`,
        clienteName: `Cliente ${index + 11}`,
      }),
    );

    render(<VentasListHarness ventas={pageTwo} pageNumber={2} />);

    expect(screen.getByText("Cliente 11")).toBeInTheDocument();
    expect(screen.getByText("Cliente 20")).toBeInTheDocument();
    expect(screen.queryByText("Cliente 1")).not.toBeInTheDocument();
  });
});
