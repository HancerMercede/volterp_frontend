import { useDashboardStore } from '../../stores/dashboardStore';
import { describe, expect, it } from 'vitest';

describe('dashboardStore', () => {
  describe('initial state', () => {
    it('starts with null dashboard data', () => {
      const state = useDashboardStore.getState();
      expect(state.dashboard).toBeNull();
    });

    it('starts with loading false', () => {
      const { loading } = useDashboardStore.getState();
      expect(loading).toBe(false);
    });

    it('starts with null error', () => {
      const { error } = useDashboardStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('actions', () => {
    it('sets error correctly', () => {
      const { setError } = useDashboardStore.getState();
      setError('Something went wrong');
      expect(useDashboardStore.getState().error).toBe('Something went wrong');

      useDashboardStore.getState().setError(null);
      expect(useDashboardStore.getState().error).toBeNull();
    });
  });
});
