import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCrudForm } from "../../hooks/useCrudForm";

const FIELDS = [
  { name: "name", label: "Name", type: "text" as const },
];

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
