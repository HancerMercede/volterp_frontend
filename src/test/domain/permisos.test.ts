import { describe, expect, it } from "vitest";
import { MODULOS, type Modulo } from "../../domain/constants/permisos";

/**
 * The permission matrix is moving to the backend: the front consumes the
 * permissions it receives and keeps only its own vocabulary (which modules
 * exist and how they are presented). These tests pin that vocabulary, not
 * the rows of the matrix, which stop being a front decision.
 */
const FACTURACION: Modulo = "facturacion";

describe("modulos de la aplicacion", () => {
  it("declara el modulo de facturacion en el tipo de modulos", () => {
    // If the module left the union, this file would not compile.
    expect(FACTURACION).toBe("facturacion");
  });

  it("deja el modulo de facturacion en el menu", () => {
    const modulo = MODULOS.find((item) => item.key === FACTURACION);

    expect(modulo).toBeDefined();
    expect(modulo?.label).toBeTruthy();
    expect(modulo?.icon).toBeTruthy();
  });

  it("no repite modulos en el menu", () => {
    const keys = MODULOS.map((modulo) => modulo.key);

    expect(new Set(keys).size).toBe(keys.length);
  });
});
