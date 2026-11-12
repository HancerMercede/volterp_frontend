# Volterp Frontend — Skeleton & Template Skill

## Goal

Generar un único archivo `FRONTEND-SKELETON-TEMPLATE.md` para `erp-mvp` (Volterp Frontend, React + TS + Vite) que codifique el estilo de trabajo del usuario, replicando la estructura del archivo `D:\source\my_projects\Volterp\NET-API-SKELETON-TEMPLATE.md` (backend .NET).

## Problem

El usuario hizo el ejercicio SKELETON + TEMPLATE en el backend y quiere replicarlo para el frontend para:
- Garantizar su estilo de programación en futuras implementaciones/desarrollos.
- Tener un documento único que sirva como contrato para la skill `volterp-frontend-style`.
- Codificar Clean Architecture + patrones de hooks/stores/services/UI del frontend.

## Why

Curso del método STPR. El usuario quiere sintetizar su forma de trabajo en una skill reutilizable. El archivo del backend es la referencia probada del formato (4 partes, snippets reales, reglas explícitas, decisiones intencionales).

## Scope

- **In**: UN solo MD en `D:\source\my_projects\erp-mvp\FRONTEND-SKELETON-TEMPLATE.md`.
  - Parte 1 SKELETON: estructura del proyecto src/, capas, dependencias.
  - Parte 2 TEMPLATE: snippets de fetchWithAuth, services, stores (Zustand), hooks genéricos (useFilter, useCrudForm, usePagination), hooks de aplicación, componentes UI (Table, Pagination, Modal).
  - Parte 3 WORKFLOW: cómo agregar una nueva entidad/página en el frontend.
  - Parte 4 CONVENCIONES: naming, error handling, paginación, i18n, decisiones intencionales.
- **Out**: la skill OpenCode en sí (eso es paso siguiente, no parte de este trabajo).

## Constraints

- Idioma: español para prosa/conversación, inglés para snippets y nombres de archivos.
- Tono: directo, didáctico, "Reglas:" + "Snippet:" + "Por qué/Razón:" como en el backend.
- Snippets: COPIAR el código REAL de los archivos del repo, no inventar.
- No duplicar código que cambia — apuntar a paths vivos.
- Mantener typos históricos si los hay (como en el backend con `ValidationExecption`).

## Actionable checklist

- [x] Leer `NET-API-SKELETON-TEMPLATE.md` completo para entender el formato.
- [x] Leer archivos clave del frontend (fetchWithAuth, useFilter, useCrudForm, usePagination, clienteStore, saleService, Table, Pagination, Modal).
- [x] Leer archivos adicionales: authService, authStore, usePermission, productService, useCarrito, Login.tsx, Register.tsx, i18n/index.ts, locales, App.tsx.
- [x] Delegar a `general` agent la generación del MD grande (2,773 líneas iniciales).
- [x] Patch quirúrgico: authService verbatim, authStore verbatim, i18n init verbatim, locales, Login.tsx verbatim, Register.tsx verbatim, auth flow end-to-end (§2.8), convenciones reforzadas.
- [x] Reportar al usuario.

## Acceptance criteria

- El MD existe en `D:\source\my_projects\erp-mvp\FRONTEND-SKELETON-TEMPLATE.md`.
- Tiene 4 partes claramente etiquetadas (SKELETON, TEMPLATE, WORKFLOW, CONVENCIONES).
- Cada template incluye `Ubicación:`, `Reglas:`, `Snippet:` con código real.
- Snippets son código literal del repo, paths correctos, sin alucinaciones.
- Tono y formato replican el archivo del backend.

## Applicable checks

- Verify-before-act: cada path citado debe existir.
- Senior-dev: arquitectura Clean / Hexagonal respetada, separación de capas.

## Verification evidence

- (a completar al final)

### 2026-11-07 — Auditoría y sincronización del doc con el código real

El doc había quedado **stale** respecto del trabajo del 2026-11-06. Auditoría contra el código real (verificada con path:line) y corrección:

| # | Defecto encontrado | Corrección |
|---|---|---|
| 1 | El árbol de carpetas listaba `useCarrito.ts`, `useVentaForm.ts` y `useClienteSelector.ts` — **borrados** el 2026-11-06 en `c7881d8` | Árbol corregido; secciones de `useCarrito`/`useVentaForm` reemplazadas por "Hooks retirados" con el motivo |
| 2 | El snippet de `useCrudForm` era la versión previa a `2040220`: sin `isDirty`, sin `section`/`span`/`hint`/`readonly`/`sidebar`, sin el tipo `combobox`, y con `id: number` | Snippet reemplazado por el archivo real (289 líneas) + reglas nuevas |
| 3 | `useDeleteConfirm` (`e0a9ea5`) no estaba documentado | Sección nueva con snippet verbatim (59 líneas) |
| 4 | `SearchableSelect` (nuevo el 2026-11-06) no estaba documentado | Sección nueva + tipo `combobox` en `FormField` |
| 5 | `Modal`, `ConfirmModal` y `DynamicFormFields` estaban en su versión previa al *form shell* | Snippets reemplazados por los archivos reales (150 / 127 / 563 líneas) |
| 6 | Los services y el store usaban `id: number` y `companyId: number` — **los ids reales son strings** (GUIDs) desde `a8a217a` | Sustitución global en services, stores y `types.ts` |
| 7 | §4.5 afirmaba que `pickKeys` es "más seguro" que `mapEntityToForm` — **la evidencia lo contradice**: `pickKeys` comparte la referencia de los arrays y no normaliza `null` | Regla reescrita con los dos casos reales (Compras `items[]`, Inventario `categoryId`/`stock`) |
| 8 | No existía regla de mantenimiento del doc | Sección "Maintenance rule" + fila `Last synced with code` en Metadata |

**Verificado**: 114 fences de código (par → markdown balanceado); 0 referencias a hooks muertos salvo la nota histórica; 0 `id: number` remanentes en entidades.

**Diff**: `FRONTEND-SKELETON-TEMPLATE.md`, +574 / −316.

**No verificado**: el doc no se compiló ni se renderizó — es un artefacto de documentación, la verificación es estructural (paths, firmas y snippets contra el código real).

## Next step

- Tras aprobación del usuario, registrar skill OpenCode en `~/.config/opencode/skills/volterp-frontend-style/SKILL.md`.
- Pendiente de esta serie: la sección de Contabilidad (contrato de `/api/accounts`) **no** se agregó a propósito — el front todavía no tiene cliente de ese endpoint, y documentar una pantalla inexistente volvería a hacer el doc stale. Va con su propio feature doc cuando el módulo se construya.

## Log

### L1 — 2026-11-06

> "El usuario hizo el ejercicio SKELETON + TEMPLATE en el backend y quiere replicarlo para el frontend"

### L2 — 2026-11-07

> "primero que todo verifica el doc esqueleton y template, para editar las mejoras que podemos agregar"

Auditoría del doc contra el código real + corrección de los 8 defectos de la tabla de arriba. Decisión del usuario: actualizar el doc primero, antes de conectar Contabilidad al front.

### L3 — 2026-11-07 — por qué `mapEntityToForm` existe

Investigación pedida por el usuario ("investiga por qué en ventas y compras se usa este método del useCrudForm"). Veredicto:

- **`mapEntityToForm` no es nuevo**: nació en `622ed66 feat: migrate 5 CRUD pages to useCrudForm + DynamicFormFields`. Lo nuevo del 2026-11-06 fue `isDirty` (`2040220`), `useDeleteConfirm` (`e0a9ea5`), el tipo `combobox` y `SearchableSelect` (sin commitear).
- **Ventas no lo tiene porque no usa `useCrudForm`**: `Ventas.tsx` es un POS, no una página CRUD.
- **Clientes no lo tiene porque no lo necesita**: su DTO calza 1:1 con los fields, y `pickKeys` alcanza.
- **Compras e Inventario sí lo necesitan**: `pickKeys` copia superficialmente (`useCrudForm.ts:168-178`), así que comparte la referencia del array `items` y no normaliza los `null`. Eso no era cosmético: con `isDirty` (nuevo) el form aparecería **sucio al abrirse**.

## Relevant files

- `D:\source\my_projects\Volterp\NET-API-SKELETON-TEMPLATE.md` — referencia de formato.
- `D:\source\my_projects\erp-mvp\FRONTEND-SKELETON-TEMPLATE.md` — **el deliverable de este trabajo**.
- `D:\source\my_projects\erp-mvp\src\infrastructure\api\fetchWithAuth.ts` — pieza angular.
- `D:\source\my_projects\erp-mvp\src\hooks\useFilter.ts`, `useCrudForm.ts`, `useDeleteConfirm.ts`, `usePagination.ts` — hooks reutilizables.
- `D:\source\my_projects\erp-mvp\src\infrastructure\api\*Service.ts` — 13 services homogéneos.
- `D:\source\my_projects\erp-mvp\src\stores\*Store.ts` — 16 stores Zustand.
- `D:\source\my_projects\erp-mvp\src\components\UI/*` — primitivos presentacionales.
- `D:\source\my_projects\erp-mvp\src\utils\*.ts` — helpers puros (pagination, jwt, name, initials, normalizeSearch).