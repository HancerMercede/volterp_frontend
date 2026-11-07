import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { matchesQuery, useFilter } from "../../hooks/useFilter";

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

  it("does not return an item whose fields are all empty", () => {
    const items = [
      { name: "", code: "" },
      { name: "Azúcar industrial", code: "PRD-001" },
    ];

    const { result } = renderHook(() =>
      useFilter({
        data: items,
        searchTerm: "",
        searchFields: (item) => [item.name, item.code],
      }),
    );

    expect(result.current).toHaveLength(1);
  });
});

describe("matchesQuery", () => {
  it("matches when any of the fields contains the query", () => {
    const fields = ["Acme Corp", "ventas@acme.do", "CLI-001"];

    expect(matchesQuery(fields, "acme")).toBe(true);
    expect(matchesQuery(fields, "ventas@")).toBe(true);
    expect(matchesQuery(fields, "CLI-001")).toBe(true);
    expect(matchesQuery(fields, "otro")).toBe(false);
  });

  it("ignores accents and case", () => {
    expect(matchesQuery(["Distribuidora Áurora"], "aurora")).toBe(true);
    expect(matchesQuery(["Distribuidora Áurora"], "AURORA")).toBe(true);
  });

  it("does not match an item whose fields are all empty, even with an empty query", () => {
    expect(matchesQuery(["", ""], "")).toBe(false);
  });

  it("matches an empty query against an item with at least one non-empty field", () => {
    expect(matchesQuery(["", "PRD-001"], "")).toBe(true);
  });
});
