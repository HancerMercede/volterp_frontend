import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFilter } from "../../hooks/useFilter";

interface Item {
  name: string;
  code: string;
}

const ITEMS: Item[] = [
  { name: "Azúcar industrial", code: "PRD-001" },
  { name: "Aceite de oliva", code: "PRD-002" },
];

const search = (term: string) => {
  const { result } = renderHook(() =>
    useFilter({
      data: ITEMS,
      searchTerm: term,
      searchFields: (item) => [item.name, item.code],
    }),
  );
  return result.current;
};

describe("useFilter", () => {
  it("finds an accented name from a term without the accent", () => {
    const found = search("azucar");

    expect(found).toHaveLength(1);
    expect(found[0].name).toBe("Azúcar industrial");
  });

  it("finds it regardless of the case", () => {
    expect(search("AZUCAR")).toHaveLength(1);
  });

  it("finds it by its code", () => {
    expect(search("prd-001")).toHaveLength(1);
  });

  it("returns everything when the term is empty", () => {
    expect(search("")).toHaveLength(2);
  });
});
