import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = join(process.cwd(), "src");
const VENTAS_PAGES_DIR = join(SRC_DIR, "pages", "Ventas");
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
  const pattern = /t\(\s*"(ventas\.[A-Za-z0-9_.]+)"/g;

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(pattern)) {
      keys.add(match[1]);
    }
  }

  return [...keys].sort();
};

// Claves invocadas con la opcion `count`: i18next las resuelve con el sufijo de
// pluralizacion, asi que el locale guarda la variante y no la clave base.
const collectPluralKeys = (files: string[]): Set<string> => {
  const keys = new Set<string>();
  const pattern = /t\(\s*"(ventas\.[A-Za-z0-9_.]+)"[^)]*count\s*:/g;

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(pattern)) {
      keys.add(match[1]);
    }
  }

  return keys;
};

const resolvePath = (locale: Record<string, unknown>, path: string): unknown =>
  path
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      locale,
    );

const resolveKey = (
  locale: Record<string, unknown>,
  key: string,
  plural = false,
): boolean => {
  if (resolvePath(locale, key) !== undefined) return true;
  if (!plural) return false;
  return ["_one", "_other"].some(
    (suffix) => resolvePath(locale, `${key}${suffix}`) !== undefined,
  );
};

describe("claves i18n del modulo de ventas", () => {
  const es = readLocale("es");
  const en = readLocale("en");
  const files = collectFiles(SRC_DIR);
  const keys = collectKeys(files);
  const pluralKeys = collectPluralKeys(files);

  it("las paginas del modulo usan claves del namespace ventas", () => {
    expect(keys.length).toBeGreaterThan(0);
  });

  it("la busqueda de claves recorre todo el arbol de src", () => {
    const moduleKeys = collectKeys(collectFiles(VENTAS_PAGES_DIR));
    expect(keys).toEqual(expect.arrayContaining(moduleKeys));
    expect(files.length).toBeGreaterThan(
      collectFiles(VENTAS_PAGES_DIR).length,
    );
  });

  it("toda clave usada existe en el locale de espanol", () => {
    const missing = keys.filter(
      (key) => !resolveKey(es, key, pluralKeys.has(key)),
    );
    expect(missing).toEqual([]);
  });

  it("toda clave usada existe en el locale de ingles", () => {
    const missing = keys.filter(
      (key) => !resolveKey(en, key, pluralKeys.has(key)),
    );
    expect(missing).toEqual([]);
  });
});
