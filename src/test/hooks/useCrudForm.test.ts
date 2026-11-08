import { act, renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { FormEvent } from "react";
import i18n from "../../i18n";
import { useCrudForm } from "../../hooks/useCrudForm";

const FIELDS = [
  { name: "name", label: "Name", type: "text" as const },
];

const submitEvent = { preventDefault: vi.fn() } as unknown as FormEvent;

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

afterAll(async () => {
  await i18n.changeLanguage("es");
});

describe("useCrudForm submit", () => {
  it("keeps the server message when the save fails", async () => {
    const onUpdate = vi
      .fn()
      .mockRejectedValue(new Error("phone can't be null or empty."));
    const { result } = renderHook(() =>
      useCrudForm({
        fields: FIELDS,
        defaultValues: { name: "HM Software Solutions" },
        onCreate: vi.fn(),
        onUpdate,
      }),
    );

    act(() => {
      result.current.handleEdit({ name: "HM Software Solutions" }, "co-1");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(result.current.submitError).toBe("phone can't be null or empty.");
  });

  it("does not reach the server when a required field is empty", async () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() =>
      useCrudForm({
        fields: [
          { name: "name", label: "Name", type: "text" as const, required: true },
        ],
        defaultValues: { name: "" },
        onCreate: vi.fn(),
        onUpdate,
      }),
    );

    act(() => {
      result.current.handleEdit({ name: "" }, "co-1");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(onUpdate).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe("This field is required");
  });

  it("changes the message when the language changes", async () => {
    const { result } = renderHook(() =>
      useCrudForm({
        fields: [
          { name: "name", label: "Name", type: "text" as const, required: true },
        ],
        defaultValues: { name: "" },
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleEdit({ name: "" }, "co-1");
    });
    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    await act(async () => {
      await i18n.changeLanguage("es");
    });

    await act(async () => {
      await result.current.handleSubmit(submitEvent);
    });

    expect(result.current.errors.name).toBe("Este campo es requerido");
  });
});

describe("useCrudForm isDirty", () => {
  it("is clean on a fresh form", () => {
    const { result } = renderHook(() =>
      useCrudForm({
        fields: FIELDS,
        defaultValues: { name: "" },
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
      }),
    );

    expect(result.current.isDirty).toBe(false);
  });

  it("turns dirty when a field changes", () => {
    const { result } = renderHook(() =>
      useCrudForm({
        fields: FIELDS,
        defaultValues: { name: "" },
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
      }),
    );

    act(() => {
      result.current.setFieldValue("name", "Cerveza");
    });

    expect(result.current.isDirty).toBe(true);
  });

  it("is clean again after reset", () => {
    const { result } = renderHook(() =>
      useCrudForm({
        fields: FIELDS,
        defaultValues: { name: "" },
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
      }),
    );

    act(() => {
      result.current.setFieldValue("name", "Cerveza");
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isDirty).toBe(false);
  });

  it("treats the loaded entity as the baseline when editing", () => {
    const { result } = renderHook(() =>
      useCrudForm({
        fields: FIELDS,
        defaultValues: { name: "" },
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
        mapEntityToForm: (entity) => ({ name: entity.name as string }),
      }),
    );

    act(() => {
      result.current.handleEdit({ name: "Cerveza" }, "p-1");
    });

    // Opening a form must not look like an unsaved change.
    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.setFieldValue("name", "Cerveza 355ml");
    });

    expect(result.current.isDirty).toBe(true);
  });

  it("stays clean when a field is set back to its original value", () => {
    const { result } = renderHook(() =>
      useCrudForm({
        fields: FIELDS,
        defaultValues: { name: "Cerveza" },
        onCreate: vi.fn(),
        onUpdate: vi.fn(),
      }),
    );

    act(() => {
      result.current.setFieldValue("name", "Otra");
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.setFieldValue("name", "Cerveza");
    });

    expect(result.current.isDirty).toBe(false);
  });
});
