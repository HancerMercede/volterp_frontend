/**
 * The tax codes of the DGII and the ITBIS each one of them pays.
 *
 * The backend owns this table (`Volterp.ElectronicInvoicing/EcfTaxRates.cs`)
 * and the frontend copies it verbatim: the tax code travels with the product
 * (`ProductDto.taxCode`) and the backend recomputes the totals of the sale
 * with it (`Sale.CalculateTotals()`). The two tables must never drift apart,
 * so this one is a copy and not an interpretation.
 *
 * The backend serializes every enum as text through a global
 * `JsonStringEnumConverter`, so the wire values are the .NET member names.
 */

/** `TaxCode` — the tax treatment the DGII gives to a product. */
export const TaxCode = {
  ItbisTasa1: "ItbisTasa1",
  ItbisTasa2: "ItbisTasa2",
  ItbisTasa3: "ItbisTasa3",
  Exento: "Exento",
  NoFacturable: "NoFacturable",
} as const;

export type TaxCode = (typeof TaxCode)[keyof typeof TaxCode];

export const TAX_CODES: readonly TaxCode[] = Object.values(TaxCode);

/**
 * The ITBIS each code pays, in percent (the `Percent` of the backend
 * `EcfTaxRate`). The percent is whole, so the ITBIS of a line is an exact
 * division of integer cents and never a float.
 */
export const TAX_CODE_PERCENT: Record<TaxCode, number> = {
  ItbisTasa1: 18,
  ItbisTasa2: 16,
  ItbisTasa3: 0,
  Exento: 0,
  NoFacturable: 0,
};

/** The ITBIS each code pays, as a fraction of the taxable amount. */
export const TAX_CODE_RATES: Record<TaxCode, number> = {
  ItbisTasa1: TAX_CODE_PERCENT.ItbisTasa1 / 100,
  ItbisTasa2: TAX_CODE_PERCENT.ItbisTasa2 / 100,
  ItbisTasa3: TAX_CODE_PERCENT.ItbisTasa3 / 100,
  Exento: TAX_CODE_PERCENT.Exento / 100,
  NoFacturable: TAX_CODE_PERCENT.NoFacturable / 100,
};

/** A line of the cart that the backend can tax. */
export interface TaxableLine {
  /** The amount of the line, in money (two decimals at most). */
  subtotal: number;
  /** The tax code of the product the line comes from. */
  taxCode: TaxCode;
}

/** The three totals of a sale: the numbers the backend computes. */
export interface SaleTotals {
  subtotal: number;
  itbis: number;
  total: number;
}

/**
 * The amount of a line in cents. The subtotals of the cart are money, two
 * decimals at most, so the multiplication is exact and the rounding only
 * takes the float noise away.
 */
function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Divides two whole numbers rounding the quotient to the nearest one, with
 * the tie going to the even one — the way `decimal.Round` does in the
 * backend, whose default mode is `MidpointRounding.ToEven`.
 */
function divideHalfToEven(numerator: number, denominator: number): number {
  const quotient = Math.floor(numerator / denominator);
  const remainder = numerator - quotient * denominator;
  const twice = remainder * 2;

  if (twice < denominator) return quotient;
  if (twice > denominator) return quotient + 1;
  return quotient % 2 === 0 ? quotient : quotient + 1;
}

/**
 * The totals of a cart, computed the way the backend computes them.
 *
 * The backend is the authority of these numbers: `Sale.CalculateTotals()`
 * rounds the ITBIS of every line to two decimals, adds them up, rounds the
 * sums and adds the ITBIS to the subtotal. The cart runs the same
 * arithmetic in integer cents, so the screen and the saved sale never
 * disagree.
 *
 * Two details make it land on the same number as the backend:
 *
 * - The rates are whole percents (18, 16, 0), so the ITBIS of a line is
 *   `cents * percent / 100`: an exact division of whole numbers. No float
 *   takes part in it, so there is no drift to round away afterwards.
 * - The backend rounds with `decimal.Round`, whose default mode is
 *   `MidpointRounding.ToEven`: a tie goes to the even cent. Rounding the
 *   cents half up would agree everywhere but on the ties, and the ties do
 *   happen: at 18% a line of RD$ 0.25 lands exactly on the half cent
 *   (0.045), where the backend rounds down to RD$ 0.04 and a half-up
 *   rounding would say RD$ 0.05. So the tie goes to the even cent here
 *   too.
 *
 * A line the front does not know the code of pays no ITBIS on screen: the
 * backend is the authority of what the sale pays, not the screen.
 */
export function calculateSaleTotals(lines: readonly TaxableLine[]): SaleTotals {
  let subtotalCents = 0;
  let itbisCents = 0;

  for (const line of lines) {
    const lineCents = toCents(line.subtotal);
    subtotalCents += lineCents;

    const percent = TAX_CODE_PERCENT[line.taxCode] ?? 0;
    itbisCents += divideHalfToEven(lineCents * percent, 100);
  }

  const subtotal = subtotalCents / 100;
  const itbis = itbisCents / 100;

  // The total is added in cents, the way the backend adds it in decimals:
  // adding the two decimals in a float would leave the last bits of the
  // number different from the one the backend saves.
  return { subtotal, itbis, total: (subtotalCents + itbisCents) / 100 };
}
