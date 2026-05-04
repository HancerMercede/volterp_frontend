export type TipoRegistro = 'entrada' | 'salida' | 'pausa';
export type EstadoAsistencia = 'a_tiempo' | 'tardanza' | 'ausencia';
export type TipoHora = 'regular' | 'extra';

export interface Ubicacion {
  lat: number;
  lng: number;
  direccion?: string;
}

export interface RegistroPonche {
  id: string;
  empleadoId: string;
  fecha: string;
  hora: string;
  tipo: TipoRegistro;
  ubicacion?: Ubicacion;
  estado: EstadoAsistencia;
  observaciones?: string;
  creadoEn: string;
}

export interface HorarioEmpleado {
  id: string;
  empleadoId: string;
  horaEntrada: string;
  horaSalida: string;
  diasLaborales: ('lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo')[];
  ubicacionSucursal: Ubicacion & { radioMetros: number };
  permiteHorasExtras: boolean;
  horaExtraInicio: string;
}

export interface ConfiguracionAsistencia {
  enabled: boolean;
  rangoMetros: number;
  generaHorasExtras: boolean;
  horasLaboralesBase: number;
  umbralHorasExtra: number;
}

export interface EstadisticaAsistencia {
  totalDias: number;
  diasAsistidos: number;
  tardanzas: number;
  horasRegulares: number;
  horasExtras: number;
  porcentajeAsistencia: number;
}

export interface ResumenAsistencia {
  empleadosHoy: number;
  totalEmpleados: number;
  tardanzasSemana: number;
  horasExtrasMes: number;
  porcentajeAsistenciaMes: number;
}