import { useDashboardStore } from '../../stores/dashboardStore';

describe('dashboardStore', () => {
  describe('initial state', () => {
    it('has stats with expected properties', () => {
      const { stats } = useDashboardStore.getState();
      expect(stats).toHaveProperty('ventas');
      expect(stats).toHaveProperty('compras');
      expect(stats).toHaveProperty('clientes');
      expect(stats).toHaveProperty('utilidad');
    });

    it('has actividades array', () => {
      const { actividades } = useDashboardStore.getState();
      expect(Array.isArray(actividades)).toBe(true);
    });

    it('has recordatorios array', () => {
      const { recordatorios } = useDashboardStore.getState();
      expect(Array.isArray(recordatorios)).toBe(true);
    });

    it('stats contain numeric values', () => {
      const { stats } = useDashboardStore.getState();
      expect(typeof stats.ventas).toBe('number');
      expect(typeof stats.compras).toBe('number');
      expect(typeof stats.clientes).toBe('number');
      expect(typeof stats.utilidad).toBe('number');
    });
  });
});