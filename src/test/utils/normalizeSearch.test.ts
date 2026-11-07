import { describe, expect, it } from "vitest";
import { normalizeSearch } from "../../utils/normalizeSearch";

describe("normalizeSearch", () => {
  it("removes the accents", () => {
    expect(normalizeSearch("Azúcar")).toBe("azucar");
  });

  it("lowercases and trims", () => {
    expect(normalizeSearch("  MONTAÑA  ")).toBe("montana");
  });
});
