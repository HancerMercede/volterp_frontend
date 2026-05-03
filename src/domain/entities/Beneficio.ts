export type TipoBeneficio = "seguro_medico" | "vacaciones" | "permiso" | "prima" | "formacion";

export type EstadoVacaciones = "disfrutando" | "pendiente" | "cancelada";

export interface Vacaciones {
  anio: number;
  diasTotales: number;
  diasUsados: number;
  diasDisponibles: number;
  Ultimos: VacacionDetalle[];
}

export interface VacacionDetalle {
  id: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  estado: EstadoVacaciones;
  motivo?: string;
}

export interface Permiso {
  id: string;
  tipo: "medico" | "personal" | " luto" | "maternidad" | "paternidad";
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  estado: "aprobado" | "pendiente" | "rechazado";
  motivo: string;
}

export interface SeguroMedico {
  proveedor: string;
  plan: string;
  numeroPoliza: string;
  fechaVencimiento: string;
  dependientes: Dependiente[];
}

export interface Dependiente {
  nombre: string;
  parentesco: string;
  fechaNacimiento: string;
  esDependientePrincipal: boolean;
}

export interface BeneficioEmpleado {
  empleadoId: string;
  seguroMedico: SeguroMedico | null;
  vacaciones: Vacaciones | null;
  permisos: Permiso[];
  formacion: FormacionRegistro[];
}

export interface FormacionRegistro {
  id: string;
  tipo: "capacitacion" | "certificacion" | "curso";
  nombre: string;
  institucion: string;
  fechaInicio: string;
  fechaFin: string;
  completado: boolean;
  certificadoUrl?: string;
}

export const VACACIONES_POR_ANTIGUEDAD = {
  menos1Year: 0,
  de1a5Years: 14,
  de5a10Years: 18,
  mas10Years: 22,
} as const;

export function calcularDiasVacaciones(fechaIngreso: string): number {
  const hoy = new Date();
  const ingreso = new Date(fechaIngreso);
  const antiguedadAnios = Math.floor((hoy.getTime() - ingreso.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

  if (antiguedadAnios < 1) return VACACIONES_POR_ANTIGUEDAD.menos1Year;
  if (antiguedadAnios < 5) return VACACIONES_POR_ANTIGUEDAD.de1a5Years;
  if (antiguedadAnios < 10) return VACACIONES_POR_ANTIGUEDAD.de5a10Years;
  return VACACIONES_POR_ANTIGUEDAD.mas10Years;
}

export function getVacacionesAnuales(fechaIngreso: string): number {
  return calcularDiasVacaciones(fechaIngreso);
}