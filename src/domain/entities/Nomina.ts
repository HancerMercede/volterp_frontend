export type ConceptoTipo = "bonificacion" | "deduccion";

export interface Concepto {
  id: string;
  nombre: string;
  tipo: ConceptoTipo;
  monto: number;
  porcentaje?: number;
  automatico: boolean;
}

export interface Nomina {
  id: string;
  empleadoId: string;
  periodo: string;
  anio: number;
  mes: number;
  fechaPago: string;
  salarioBase: number;
  totalBonificaciones: number;
  totalDeducciones: number;
  salarioNeto: number;
  estado: "borrador" | "procesado" | "pagado";
  detalles: NominaDetalle[];
  createdAt: string;
  updatedAt: string;
}

export interface NominaDetalle {
  conceptoId: string;
  conceptoNombre: string;
  tipo: ConceptoTipo;
  monto: number;
  isAutomatico: boolean;
}

export interface CalculoNomina {
  salarioBruto: number;
  bonificaciones: NominaDetalle[];
  deducciones: NominaDetalle[];
  totalBonificaciones: number;
  totalDeducciones: number;
  salarioNeto: number;
}

export const DEDUCCIONES_TRIBUTARIAS = {
  afp: { nombre: "AFP - Administradora de Fondos de Pensiones", porcentaje: 2.87 },
  sfs: { nombre: "SFS - Seguro Familiar de Salud", porcentaje: 1.74 },
  ir: { nombre: "Impuesto sobre la Renta", porcentaje: null },
} as const;

export const BONIFICACIONES_DEFAULT = [
  { id: "bono-transporte", nombre: "Bono Transporte", monto: 5000, tipo: "bonificacion" as ConceptoTipo, automatico: false },
  { id: "bono-alimentacion", nombre: "Bono Alimentación", monto: 6000, tipo: "bonificacion" as ConceptoTipo, automatico: false },
  { id: "comisiones", nombre: "Comisiones", monto: 0, tipo: "bonificacion" as ConceptoTipo, automatico: false },
  { id: "horas-extras", nombre: "Horas Extras", monto: 0, tipo: "bonificacion" as ConceptoTipo, automatico: false },
] as const;

export const calcularNomina = (
  salarioBase: number,
  bonificaciones: Concepto[],
  deducciones: Concepto[],
): CalculoNomina => {
  const bonificacionesDetalle = bonificaciones
    .filter((b) => b.monto > 0)
    .map((b) => ({
      conceptoId: b.id,
      conceptoNombre: b.nombre,
      tipo: b.tipo as ConceptoTipo,
      monto: b.monto,
      isAutomatico: b.automatico,
    }));

  const deduccionesCalculadas = deducciones.map((d) => {
    const monto = d.porcentaje ? (salarioBase * d.porcentaje) / 100 : d.monto;
    return {
      conceptoId: d.id,
      conceptoNombre: d.nombre,
      tipo: d.tipo as ConceptoTipo,
      monto,
      isAutomatico: d.automatico,
    };
  });

  const totalBonificaciones = bonificacionesDetalle.reduce((sum, b) => sum + b.monto, 0);
  const totalDeducciones = deduccionesCalculadas.reduce((sum, d) => sum + d.monto, 0);
  const salarioBruto = salarioBase + totalBonificaciones;
  const salarioNeto = salarioBruto - totalDeducciones;

  return {
    salarioBruto,
    bonificaciones: bonificacionesDetalle,
    deducciones: deduccionesCalculadas,
    totalBonificaciones,
    totalDeducciones,
    salarioNeto,
  };
};