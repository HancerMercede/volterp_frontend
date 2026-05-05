import { useUIStore } from '../../stores/uiStore';
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  useUIStore.setState({ toasts: [], isLoading: false });
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('uiStore', () => {
  describe('addToast', () => {
    it('adds toast with correct type and message', () => {
      useUIStore.getState().addToast('Success message', 'success');
      const toast = useUIStore.getState().toasts[0];
      expect(toast).toMatchObject({ type: 'success', message: 'Success message' });
    });

    it('adds all toast types (success, error, info, warning)', () => {
      const types = ['success', 'error', 'info', 'warning'] as const;
      types.forEach((type, i) => {
        vi.advanceTimersByTime(1000);
        useUIStore.getState().addToast(`Message ${i}`, type);
      });

      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(4);
      expect(toasts.map(t => t.type)).toEqual(types);
    });

    it('appends multiple toasts in order with unique ids', () => {
      vi.advanceTimersByTime(1000);
      useUIStore.getState().addToast('First', 'info');
      vi.advanceTimersByTime(1000);
      useUIStore.getState().addToast('Second', 'error');

      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].message).toBe('First');
      expect(toasts[1].message).toBe('Second');
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('generates string ids from timestamps', () => {
      useUIStore.getState().addToast('Test', 'info');
      expect(useUIStore.getState().toasts[0].id).toMatch(/^\d+$/);
    });
  });

  describe('removeToast', () => {
    it('removes toast by id and does not affect other toasts', () => {
      vi.advanceTimersByTime(1000);
      useUIStore.getState().addToast('Keep', 'info');
      vi.advanceTimersByTime(1000);
      useUIStore.getState().addToast('Remove', 'error');

      const toRemoveId = useUIStore.getState().toasts[1].id;
      useUIStore.getState().removeToast(toRemoveId);

      const remaining = useUIStore.getState().toasts;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].message).toBe('Keep');
    });

    it('handles removing non-existent toast gracefully', () => {
      useUIStore.getState().addToast('Test', 'info');
      useUIStore.getState().removeToast('non-existent-id');
      expect(useUIStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('setLoading', () => {
    it('toggles isLoading state', () => {
      expect(useUIStore.getState().isLoading).toBe(false);
      useUIStore.getState().setLoading(true);
      expect(useUIStore.getState().isLoading).toBe(true);
      useUIStore.getState().setLoading(false);
      expect(useUIStore.getState().isLoading).toBe(false);
    });
  });
});