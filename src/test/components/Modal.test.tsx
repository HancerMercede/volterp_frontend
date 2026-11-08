import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "../../components/UI/Modal";

describe("Modal submit error", () => {
  it("shows the server rejection as an alert", () => {
    render(
      <Modal isOpen onClose={() => {}} title="Titulo" error="phone can't be null or empty.">
        <input aria-label="campo" />
      </Modal>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "phone can't be null or empty.",
    );
  });

  it("renders no alert when there is no error", () => {
    render(
      <Modal isOpen onClose={() => {}} title="Titulo">
        <input aria-label="campo" />
      </Modal>,
    );

    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("Modal click outside", () => {
  it("keeps the modal open when the press starts inside and the release lands outside", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Titulo">
        <input aria-label="campo" />
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    const overlay = dialog.parentElement as HTMLElement;

    fireEvent.mouseDown(screen.getByLabelText("campo"));
    fireEvent.mouseUp(overlay);
    fireEvent.click(overlay);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes when the press lands outside the modal", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Titulo">
        <input aria-label="campo" />
      </Modal>,
    );

    const overlay = screen.getByRole("dialog").parentElement as HTMLElement;

    fireEvent.mouseDown(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
