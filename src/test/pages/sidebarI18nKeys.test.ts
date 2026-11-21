import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MENU_GROUPS, MENU_ROUTES } from "../../domain/constants/menuRoutes";

const SRC_DIR = join(process.cwd(), "src");
const LOCALES_DIR = join(SRC_DIR, "i18n", "locales");

const readLocale = (locale: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(LOCALES_DIR, `${locale}.json`), "utf8"));

const collectFiles = (dir: string): string[] => {
  let files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(collectFiles(path));
    else if (entry.name.endsWith(".tsx")) files.push(path);
  }
  return files;
};

const collectKeys = (files: string[]): string[] => {
  const keys = new Set<string>();
  const pattern = /t\(\s*"(sidebar\.[A-Za-z0-9_.]+)"/g;

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(pattern)) {
      keys.add(match[1]);
    }
  }

  return [...keys].sort();
};

/** The keys the menu declaration names: the menu travels by key, not by words. */
const collectDeclaredKeys = (): string[] => {
  const keys = new Set<string>();

  for (const route of MENU_ROUTES) {
    keys.add(route.labelKey);
  }
  for (const group of MENU_GROUPS) {
    keys.add(group.labelKey);
    if (group.indexLabelKey) keys.add(group.indexLabelKey);
  }

  return [...keys].sort();
};

const resolveKey = (locale: Record<string, unknown>, key: string): boolean =>
  key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      locale,
    ) !== undefined;

describe("claves i18n del namespace sidebar", () => {
  const es = readLocale("es");
  const en = readLocale("en");
  const usedKeys = collectKeys(collectFiles(SRC_DIR));
  const declaredKeys = collectDeclaredKeys();
  const keys = [...new Set([...usedKeys, ...declaredKeys])].sort();

  it("el menu usa claves del namespace sidebar", () => {
    expect(usedKeys.length).toBeGreaterThan(0);
    expect(declaredKeys.length).toBeGreaterThan(0);
  });

  it("toda clave usada existe en el locale de espanol", () => {
    const missing = keys.filter((key) => !resolveKey(es, key));
    expect(missing).toEqual([]);
  });

  it("toda clave usada existe en el locale de ingles", () => {
    const missing = keys.filter((key) => !resolveKey(en, key));
    expect(missing).toEqual([]);
  });
});
