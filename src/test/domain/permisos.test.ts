import { describe, expect, it } from "vitest";
import { MATRIZ_PERMISOS, MODULOS } from "../../domain/constants/permisos";
import { Rol } from "../../domain/constants/roles";

describe("matriz de permisos", () => {
  it("da la facturación a los roles que la usan", () => {
    const fullAccess = { read: true, write: true, delete: true };

    expect(MATRIZ_PERMISOS[Rol.SUPER_ADMIN].facturacion).toEqual(fullAccess);
    expect(MATRIZ_PERMISOS[Rol.ADMIN].facturacion).toEqual(fullAccess);
    expect(MATRIZ_PERMISOS[Rol.VENTAS].facturacion).toEqual(fullAccess);
  });

  it("no da la facturación a los roles que no la usan", () => {
    const noAccess = { read: false, write: false, delete: false };

    expect(MATRIZ_PERMISOS[Rol.INVENTARIO].facturacion).toEqual(noAccess);
    expect(MATRIZ_PERMISOS[Rol.CONTABILIDAD].facturacion).toEqual(noAccess);
    expect(MATRIZ_PERMISOS[Rol.RRHH].facturacion).toEqual(noAccess);
  });

  it("deja el módulo de facturación en el menú", () => {
    expect(MODULOS.some((modulo) => modulo.key === "facturacion")).toBe(true);
  });

  it("da a cada rol una fila por cada módulo", () => {
    const moduleKeys = MODULOS.map((modulo) => modulo.key).sort();

    for (const rol of Object.values(Rol)) {
      expect(Object.keys(MATRIZ_PERMISOS[rol]).sort()).toEqual(moduleKeys);
    }
  });
});
