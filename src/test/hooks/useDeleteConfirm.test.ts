import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeleteConfirm } from '../../hooks/useDeleteConfirm';
import { useUIStore } from '../../stores/uiStore';

const SUCCESS_MESSAGE = 'Compra eliminada';

beforeEach(() => {
  useUIStore.setState({ toasts: [], modals: [], isLoading: false });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDeleteConfirm', () => {
  it('opens the confirmation for the selected id', () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    expect(result.current.showDeleteConfirm).toBe(false);

    act(() => {
      result.current.handleDelete('abc');
    });

    expect(result.current.showDeleteConfirm).toBe(true);
  });

  it('deletes the selected id and reports success', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    act(() => {
      result.current.handleDelete('abc');
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(onDelete).toHaveBeenCalledWith('abc');
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(useUIStore.getState().toasts).toEqual([
      expect.objectContaining({ message: SUCCESS_MESSAGE, type: 'success' }),
    ]);
  });

  it('reports the failure and skips the success toast when the delete rejects', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error('No se pudo eliminar'));
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    act(() => {
      result.current.handleDelete('abc');
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(useUIStore.getState().toasts).toEqual([
      expect.objectContaining({ message: 'No se pudo eliminar', type: 'error' }),
    ]);
    expect(useUIStore.getState().toasts.some((t) => t.type === 'success')).toBe(false);
  });

  it('falls back to a generic message when the rejection carries no message', async () => {
    const onDelete = vi.fn().mockRejectedValue('boom');
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    act(() => {
      result.current.handleDelete('abc');
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(useUIStore.getState().toasts).toEqual([
      expect.objectContaining({ type: 'error' }),
    ]);
    expect(useUIStore.getState().toasts[0].message).toBeTruthy();
  });

  it('does not delete nor report anything when no id is selected', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(onDelete).not.toHaveBeenCalled();
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it('keeps a new selection intact when a previous delete is still in flight', async () => {
    let resolveFirst!: () => void;
    const firstDelete = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });
    const onDelete = vi
      .fn()
      .mockImplementationOnce(() => firstDelete)
      .mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    act(() => {
      result.current.handleDelete('abc');
    });

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.confirmDelete();
    });

    // Another row is selected while the first delete is still in flight.
    act(() => {
      result.current.handleDelete('def');
    });

    await act(async () => {
      resolveFirst();
      await pending;
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(onDelete).toHaveBeenLastCalledWith('def');
  });

  it('exposes the pending id so callers can describe the resource', () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    expect(result.current.deleteId).toBeNull();

    act(() => {
      result.current.handleDelete('abc');
    });

    expect(result.current.deleteId).toBe('abc');

    act(() => {
      result.current.cancelDelete();
    });

    expect(result.current.deleteId).toBeNull();
  });

  it('closes the confirmation and clears the selected id on cancel', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    act(() => {
      result.current.handleDelete('abc');
    });

    act(() => {
      result.current.cancelDelete();
    });

    expect(result.current.showDeleteConfirm).toBe(false);

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(onDelete).not.toHaveBeenCalled();
    expect(useUIStore.getState().toasts).toHaveLength(0);
  });

  it('emits the success toast only after the delete resolves', async () => {
    let resolveDelete!: () => void;
    const onDelete = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    act(() => {
      result.current.handleDelete('abc');
    });

    let pending!: Promise<void>;
    act(() => {
      pending = result.current.confirmDelete();
    });

    expect(onDelete).toHaveBeenCalledWith('abc');
    expect(useUIStore.getState().toasts).toHaveLength(0);

    await act(async () => {
      resolveDelete();
      await pending;
    });

    expect(useUIStore.getState().toasts).toEqual([
      expect.objectContaining({ message: SUCCESS_MESSAGE, type: 'success' }),
    ]);
  });

  it('falls back to a non-empty message when the rejection has an empty message', async () => {
    const onDelete = vi.fn().mockRejectedValue(new Error(''));
    const { result } = renderHook(() =>
      useDeleteConfirm({ onDelete, successMessage: SUCCESS_MESSAGE }),
    );

    act(() => {
      result.current.handleDelete('abc');
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    const [toast] = useUIStore.getState().toasts;
    expect(toast.type).toBe('error');
    expect(toast.message.trim().length).toBeGreaterThan(0);
  });
});
