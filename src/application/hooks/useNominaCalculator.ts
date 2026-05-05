import { useState, useMemo } from "react";
import type { Concepto } from "../../domain/entities/Nomina";
import { calcularNomina, DEDUCCIONES_TRIBUTARIAS } from "../../domain/entities/Nomina";

export function useNominaCalculator(salarioBase: number) {
  const [bonificaciones, setBonificaciones] = useState<Concepto[]>([
    { id: "bono-transporte", nombre: "Bono Transporte", tipo: "bonificacion", monto: 5000, automatico: false },
    { id: "bono-alimentacion", nombre: "Bono Alimentación", tipo: "bonificacion", monto: 6000, automatico: false },
    { id: "comisiones", nombre: "Comisiones", tipo: "bonificacion", monto: 0, automatico: false },
    { id: "horas-extras", nombre: "Horas Extras", tipo: "bonificacion", monto: 0, automatico: false },
  ]);

  const deducciones = useMemo(() => [
    { id: "afp", nombre: DEDUCCIONES_TRIBUTARIAS.afp.nombre, tipo: "deduccion" as const, monto: 0, porcentaje: DEDUCCIONES_TRIBUTARIAS.afp.porcentaje, automatico: true },
    { id: "sfs", nombre: DEDUCCIONES_TRIBUTARIAS.sfs.nombre, tipo: "deduccion" as const, monto: 0, porcentaje: DEDUCCIONES_TRIBUTARIAS.sfs.porcentaje, automatico: true },
    { id: "irs", nombre: "Impuesto sobre la Renta (ISR)", tipo: "deduccion" as const, monto: 0, automatico: true },
    { id: "prestamos", nombre: "Préstamos", tipo: "deduccion" as const, monto: 0, automatico: false },
    { id: "otros", nombre: "Otras Deducciones", tipo: "deduccion" as const, monto: 0, automatico: false },
  ], []);

  const calculo = useMemo(
    () => calcularNomina(salarioBase, bonificaciones, deducciones),
    [salarioBase, bonificaciones, deducciones],
  );

  const updateBonificacion = (id: string, monto: number) => {
    setBonificaciones((prev) => prev.map((b) => (b.id === id ? { ...b, monto } : b)));
  };

  const reset = () => {
    setBonificaciones([
      { id: "bono-transporte", nombre: "Bono Transporte", tipo: "bonificacion", monto: 5000, automatico: false },
      { id: "bono-alimentacion", nombre: "Bono Alimentación", tipo: "bonificacion", monto: 6000, automatico: false },
      { id: "comisiones", nombre: "Comisiones", tipo: "bonificacion", monto: 0, automatico: false },
      { id: "horas-extras", nombre: "Horas Extras", tipo: "bonificacion", monto: 0, automatico: false },
    ]);
  };

  return { bonificaciones, deducciones, calculo, updateBonificacion, reset };
}