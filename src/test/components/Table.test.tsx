import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "../../i18n";
import { Table } from "../../components/UI/Table";

const COLUMNS = [{ key: "name" as const, header: "Name" }];

describe("Table", () => {
  it("keeps the default edit action when no per-row action is provided", () => {
    render(
      <Table
        data={[{ id: "1", name: "Row" }]}
        columns={COLUMNS}
        onEdit={vi.fn()}
      />,
    );

    const editAction = screen.getByTitle("Editar");

    expect(editAction).toBeInTheDocument();
    expect(editAction).toHaveAttribute("data-action", "edit");
  });
});
