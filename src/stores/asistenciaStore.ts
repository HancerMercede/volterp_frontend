import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RegistroPonche, HorarioEmpleado, ConfiguracionAsistencia, ResumenAsistencia } from '../domain/entities/Asistencia';
import { configuracionAsistenciaDefault, horariosMock, registrosAsistenciaMock, resumenAsistencia } from '../data/asistenciaMockData';

interface AsistenciaState {
  registros: RegistroPonche[];
  horarios: HorarioEmpleado[];
  configuracion: ConfiguracionAsistencia;
  registroActual: { tipo: 'entrada' | 'salida' | 'pausa'; hora: string } | null;

  registrarPonche: (empleadoId: string, tipo: 'entrada' | 'salida' | 'pausa') => void;
  getRegistrosPorEmpleado: (empleadoId: string) => RegistroPonche[];
  getRegistrosPorFecha: (fecha: string) => RegistroPonche[];
  getResumen: (empleadoId?: string) => ResumenAsistencia;
  getTardanzasPorMes: () => { dia: string; tardanzas: number }[];
  getAsistenciaSemanal: () => { dia: string; porcentaje: number }[];
  getHorasExtrasPorSemana: () => { semana: string; regulares: number; extras: number }[];
  toggleHabilitado: () => void;
  setConfiguracion: (config: Partial<ConfiguracionAsistencia>) => void;
}

export const useAsistenciaStore = create<AsistenciaState>()(
  persist(
    (set, get) => ({
      registros: registrosAsistenciaMock,
      horarios: horariosMock,
      configuracion: configuracionAsistenciaDefault,
      registroActual: null,

      registrarPonche: (empleadoId, tipo) => {
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        const hora = ahora.toTimeString().slice(0, 5);

        const nuevoRegistro: RegistroPonche = {
          id: `PON-${Date.now()}`,
          empleadoId,
          fecha,
          hora,
          tipo,
          estado: 'a_tiempo',
          ubicacion: { lat: 18.4861, lng: -69.9312 },
          creadoEn: ahora.toISOString(),
        };

        set((state) => ({
          registros: [...state.registros, nuevoRegistro],
          registroActual: { tipo, hora },
        }));
      },

      getRegistrosPorEmpleado: (empleadoId) => {
        return get().registros.filter((r) => r.empleadoId === empleadoId);
      },

      getRegistrosPorFecha: (fecha) => {
        return get().registros.filter((r) => r.fecha === fecha);
      },

      getResumen: (empleadoId) => {
        if (empleadoId) {
          const resumen = resumenAsistencia.find((r) => r.empleadoId === empleadoId);
          if (resumen) {
            return {
              empleadosHoy: 0,
              totalEmpleados: 0,
              tardanzasSemana: resumen.tardanzas,
              horasExtrasMes: resumen.horasExtras,
              porcentajeAsistenciaMes: Math.round((resumen.diasAsistidos / resumen.totalDias) * 100),
            };
          }
        }

        const hoy = new Date().toISOString().split('T')[0];
        const empleadosHoy = new Set(
          get().registros.filter((r) => r.fecha === hoy && r.tipo === 'entrada').map((r) => r.empleadoId)
        ).size;

        return {
          empleadosHoy,
          totalEmpleados: 15,
          tardanzasSemana: Math.floor(Math.random() * 8) + 2,
          horasExtrasMes: Math.floor(Math.random() * 40) + 10,
          porcentajeAsistenciaMes: 87,
        };
      },

      getTardanzasPorMes: () => {
        const dias: { dia: string; tardanzas: number }[] = [];
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const tardanzas = get().registros.filter(
            (r) => r.fecha === dateStr && r.estado === 'tardanza'
          ).length;
          dias.push({
            dia: date.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' }),
            tardanzas,
          });
        }
        return dias;
      },

      getAsistenciaSemanal: () => {
        const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const hoy = new Date();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1);

        return diasSemana.map((dia, i) => {
          const fecha = new Date(inicioSemana);
          fecha.setDate(inicioSemana.getDate() + i);
          const fechaStr = fecha.toISOString().split('T')[0];

          const registrosDia = get().registros.filter((r) => r.fecha === fechaStr);
          const tardanzas = registrosDia.filter((r) => r.estado === 'tardanza').length;
          const aTiempo = registrosDia.filter((r) => r.estado === 'a_tiempo').length;
          const total = tardanzas + aTiempo;

          return {
            dia,
            porcentaje: total > 0 ? Math.round((aTiempo / total) * 100) : 0,
          };
        });
      },

      getHorasExtrasPorSemana: () => {
        return [
          { semana: 'Sem 1', regulares: 40, extras: 8 },
          { semana: 'Sem 2', regulares: 40, extras: 12 },
          { semana: 'Sem 3', regulares: 40, extras: 6 },
          { semana: 'Sem 4', regulares: 40, extras: 15 },
        ];
      },

      toggleHabilitado: () => {
        set((state) => ({
          configuracion: { ...state.configuracion, enabled: !state.configuracion.enabled },
        }));
      },

      setConfiguracion: (config) => {
        set((state) => ({
          configuracion: { ...state.configuracion, ...config },
        }));
      },
    }),
    {
      name: 'asistencia-storage',
    }
  )
);