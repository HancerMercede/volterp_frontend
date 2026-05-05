import { useAsistenciaStore } from '../../stores/asistenciaStore';
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-05T10:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('asistenciaStore', () => {
  describe('initial state', () => {
    it('starts with null registroActual and default config enabled', () => {
      const { registroActual, configuracion } = useAsistenciaStore.getState();
      expect(registroActual).toBeNull();
      expect(configuracion.enabled).toBe(true);
      expect(configuracion.rangoMetros).toBe(100);
    });
  });

  describe('registrarPonche', () => {
    it('adds record with employee id, date, hora and sets registroActual', () => {
      useAsistenciaStore.getState().registrarPonche('emp-42', 'entrada');
      const newRecord = useAsistenciaStore.getState().registros.slice(-1)[0];
      const actual = useAsistenciaStore.getState().registroActual;

      expect(newRecord).toMatchObject({
        empleadoId: 'emp-42',
        fecha: '2026-05-05',
      });
      expect(actual).toMatchObject({ tipo: 'entrada', hora: expect.any(String) });
    });

    it('handles entrada, salida, and pausa types', () => {
      const tipos: Array<'entrada' | 'salida' | 'pausa'> = ['entrada', 'salida', 'pausa'];
      tipos.forEach((tipo) => {
        useAsistenciaStore.getState().registrarPonche('emp-1', tipo);
        expect(useAsistenciaStore.getState().registroActual?.tipo).toBe(tipo);
      });
    });

    it('generates unique ids for each record', () => {
      useAsistenciaStore.getState().registrarPonche('emp-1', 'entrada');
      vi.advanceTimersByTime(1000);
      useAsistenciaStore.getState().registrarPonche('emp-1', 'salida');
      const records = useAsistenciaStore.getState().registros.slice(-2);
      expect(records[0].id).not.toBe(records[1].id);
    });
  });

  describe('getRegistrosPorEmpleado', () => {
    it('filters records by employee and returns empty for non-existent', () => {
      useAsistenciaStore.setState({ registros: [] });
      useAsistenciaStore.getState().registrarPonche('emp-1', 'entrada');
      useAsistenciaStore.getState().registrarPonche('emp-2', 'entrada');
      useAsistenciaStore.getState().registrarPonche('emp-1', 'salida');

      const emp1 = useAsistenciaStore.getState().getRegistrosPorEmpleado('emp-1');
      const emp2 = useAsistenciaStore.getState().getRegistrosPorEmpleado('emp-2');
      const nonExistent = useAsistenciaStore.getState().getRegistrosPorEmpleado('emp-999');

      expect(emp1).toHaveLength(2);
      expect(emp2).toHaveLength(1);
      expect(nonExistent).toHaveLength(0);
    });
  });

  describe('getRegistrosPorFecha', () => {
    it('filters records by date and returns empty for date with no records', () => {
      const records = useAsistenciaStore.getState().getRegistrosPorFecha('2026-05-05');
      const empty = useAsistenciaStore.getState().getRegistrosPorFecha('2020-01-01');

      records.forEach(r => expect(r.fecha).toBe('2026-05-05'));
      expect(empty).toHaveLength(0);
    });
  });

  describe('toggleHabilitado', () => {
    it('toggles enabled state', () => {
      useAsistenciaStore.setState({
        configuracion: { ...useAsistenciaStore.getState().configuracion, enabled: true },
      });
      useAsistenciaStore.getState().toggleHabilitado();
      expect(useAsistenciaStore.getState().configuracion.enabled).toBe(false);
      useAsistenciaStore.getState().toggleHabilitado();
      expect(useAsistenciaStore.getState().configuracion.enabled).toBe(true);
    });
  });

  describe('setConfiguracion', () => {
    it('updates fields and preserves unchanged config', () => {
      const original = useAsistenciaStore.getState().configuracion;
      useAsistenciaStore.getState().setConfiguracion({ rangoMetros: 300 });

      const updated = useAsistenciaStore.getState().configuracion;
      expect(updated.rangoMetros).toBe(300);
      expect(updated.generaHorasExtras).toBe(original.generaHorasExtras);
      expect(updated.horasLaboralesBase).toBe(original.horasLaboralesBase);
    });
  });

  describe('getResumen', () => {
    it('returns object with expected numeric properties', () => {
      const resumen = useAsistenciaStore.getState().getResumen();
      expect(resumen).toMatchObject({
        empleadosHoy: expect.any(Number),
        totalEmpleados: expect.any(Number),
        tardanzasSemana: expect.any(Number),
        horasExtrasMes: expect.any(Number),
        porcentajeAsistenciaMes: expect.any(Number),
      });
    });
  });

  describe('getTardanzasPorMes', () => {
    it('returns 30 days with dia and tardanzas numeric values', () => {
      const result = useAsistenciaStore.getState().getTardanzasPorMes();
      expect(result).toHaveLength(30);
      result.forEach(item => {
        expect(item).toMatchObject({ dia: expect.any(String), tardanzas: expect.any(Number) });
      });
    });
  });

  describe('getAsistenciaSemanal', () => {
    it('returns 7 days with porcentaje between 0 and 100', () => {
      const result = useAsistenciaStore.getState().getAsistenciaSemanal();
      expect(result).toHaveLength(7);
      result.forEach(item => {
        expect(item.porcentaje).toBeGreaterThanOrEqual(0);
        expect(item.porcentaje).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('getHorasExtrasPorSemana', () => {
    it('returns 4 weeks with semana, regulares and extras numeric values', () => {
      const result = useAsistenciaStore.getState().getHorasExtrasPorSemana();
      expect(result).toHaveLength(4);
      result.forEach(item => {
        expect(item).toMatchObject({
          semana: expect.any(String),
          regulares: expect.any(Number),
          extras: expect.any(Number),
        });
      });
    });
  });
});