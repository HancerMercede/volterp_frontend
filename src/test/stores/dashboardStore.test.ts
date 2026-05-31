import { useDashboardStore } from '../../stores/dashboardStore';
import { dashboardStats, actividades, recordatorios } from '../../data/mockData';
import { describe, expect, it } from 'vitest';

describe('dashboardStore', () => {
  describe('carga inicial de datos mock', () => {
    it('carga stats correctos del mock', () => {
      const { stats } = useDashboardStore.getState();

      // Verificar estructura y valores del mock
      expect(stats.ventas).toBe(dashboardStats.ventas);
      expect(stats.compras).toBe(dashboardStats.compras);
      expect(stats.clientes).toBe(dashboardStats.clientes);
      expect(stats.utilidad).toBe(dashboardStats.utilidad);
    });

    it('carga actividades del mock', () => {
      const { actividades: storeActividades } = useDashboardStore.getState();

      // Verificar que coinciden con mock y tienen estructura correcta
      expect(storeActividades).toEqual(actividades);
      storeActividades.forEach(act => {
        expect(act).toHaveProperty('id');
        expect(act).toHaveProperty('texto');
        expect(act).toHaveProperty('hora');
        expect(act).toHaveProperty('tipo');
      });
    });

    it('carga recordatorios del mock', () => {
      const { recordatorios: storeRecordatorios } = useDashboardStore.getState();

      // Verificar que coinciden con mock
      expect(storeRecordatorios).toEqual(recordatorios);
    });
  });

  describe('verificación de integridad de datos', () => {
    it('stats contienen valores numéricos positivos', () => {
      const { stats } = useDashboardStore.getState();

      expect(stats.ventas).toBeGreaterThan(0);
      expect(stats.compras).toBeGreaterThan(0);
      expect(stats.clientes).toBeGreaterThan(0);
      expect(stats.utilidad).toBeGreaterThan(0);
    });

    it('cada actividad tiene tipo definido (string no vacío)', () => {
      const { actividades } = useDashboardStore.getState();

      actividades.forEach(act => {
        expect(act.tipo).toBeDefined();
        expect(typeof act.tipo).toBe('string');
        expect(act.tipo.length).toBeGreaterThan(0);
      });
    });
  });
});
