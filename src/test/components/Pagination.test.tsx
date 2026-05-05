import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "../../components/UI/Pagination";
import type { PaginationInfo } from "../../utils/pagination";

const createPaginationInfo = (
  overrides: Partial<PaginationInfo> = {},
): PaginationInfo => ({
  total: 100,
  page: 1,
  pageSize: 10,
  totalPages: 10,
  hasNext: true,
  hasPrev: false,
  ...overrides,
});

describe("Pagination", () => {
  it("returns null when totalPages is 1 or less", () => {
    const { container } = render(
      <Pagination
        pagination={createPaginationInfo({ totalPages: 1 })}
        onPageChange={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when totalPages is 0", () => {
    const { container } = render(
      <Pagination
        pagination={createPaginationInfo({ totalPages: 0 })}
        onPageChange={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders page numbers when totalPages > 1", () => {
    render(
      <Pagination
        pagination={createPaginationInfo({ totalPages: 5, page: 3 })}
        onPageChange={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(1);
  });

  it("disables prev buttons when hasPrev is false", () => {
    render(
      <Pagination
        pagination={createPaginationInfo({ hasPrev: false })}
        onPageChange={vi.fn()}
      />,
    );
    const prevButtons = screen.getAllByTitle("Página anterior");
    prevButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("disables next buttons when hasNext is false", () => {
    render(
      <Pagination
        pagination={createPaginationInfo({
          hasNext: false,
          page: 10,
          totalPages: 10,
        })}
        onPageChange={vi.fn()}
      />,
    );
    const nextButtons = screen.getAllByTitle("Siguiente página");
    nextButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("calls onPageChange with page 1 when first page button clicked", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        pagination={createPaginationInfo({ page: 5, hasPrev: true })}
        onPageChange={onPageChange}
      />,
    );
    const firstPageBtn = screen.getByTitle("Primera página");
    fireEvent.click(firstPageBtn);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange with page - 1 when prev button clicked", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        pagination={createPaginationInfo({ page: 5, hasPrev: true })}
        onPageChange={onPageChange}
      />,
    );
    const prevBtn = screen.getByTitle("Página anterior");
    fireEvent.click(prevBtn);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("calls onPageChange with page + 1 when next button clicked", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        pagination={createPaginationInfo({ page: 5, hasNext: true })}
        onPageChange={onPageChange}
      />,
    );
    const nextBtn = screen.getByTitle("Siguiente página");
    fireEvent.click(nextBtn);
    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it("calls onPageChange with totalPages when last page button clicked", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        pagination={createPaginationInfo({
          page: 5,
          totalPages: 10,
          hasNext: true,
        })}
        onPageChange={onPageChange}
      />,
    );
    const lastPageBtn = screen.getByTitle("Última página");
    fireEvent.click(lastPageBtn);
    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it("renders info text showing page range", () => {
    render(
      <Pagination
        pagination={createPaginationInfo({ page: 2, pageSize: 10, total: 100 })}
        onPageChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/Mostrando 11 - 20 de 100/)).toBeInTheDocument();
  });
});
