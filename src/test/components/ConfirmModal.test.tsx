import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmModal } from "../../components/UI/ConfirmModal";

const baseProps = {
  isOpen: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  title: "¿Eliminar la venta?",
  message: "Esta accion no se puede deshacer.",
};

const context = {
  title: "Venta #0192b9c7",
  subtitle: "Supermercado La Providencia · 2 productos",
  amount: "RD$ 1,085.60",
};

describe("ConfirmModal", () => {
  it("renders the title and the message", () => {
    render(<ConfirmModal {...baseProps} />);

    expect(screen.getByText("¿Eliminar la venta?")).toBeInTheDocument();
    expect(screen.getByText("Esta accion no se puede deshacer.")).toBeInTheDocument();
  });

  it("renders the context with its title, subtitle and amount", () => {
    render(<ConfirmModal {...baseProps} context={context} />);

    expect(screen.getByTestId("confirm-context")).toBeInTheDocument();
    expect(screen.getByText("Venta #0192b9c7")).toBeInTheDocument();
    expect(
      screen.getByText("Supermercado La Providencia · 2 productos"),
    ).toBeInTheDocument();
    expect(screen.getByText("RD$ 1,085.60")).toBeInTheDocument();
  });

  it("renders no context block when the resource is unknown", () => {
    render(<ConfirmModal {...baseProps} />);

    expect(screen.queryByTestId("confirm-context")).toBeNull();
  });

  it("confirms and closes", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        {...baseProps}
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmLabel="Sí, eliminar"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("cancels without confirming", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        {...baseProps}
        onConfirm={onConfirm}
        onCancel={onCancel}
        cancelLabel="Cancelar"
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("closes on escape", async () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...baseProps} onCancel={onCancel} />);

    await userEvent.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("marks the danger variant confirm button as destructive", () => {
    render(<ConfirmModal {...baseProps} variant="danger" />);

    const confirm = screen.getByRole("button", { name: "Eliminar" });

    expect(confirm.className).toContain("danger");
  });

  it("renders nothing when closed", () => {
    render(<ConfirmModal {...baseProps} isOpen={false} />);

    expect(screen.queryByText("¿Eliminar la venta?")).toBeNull();
  });
});
