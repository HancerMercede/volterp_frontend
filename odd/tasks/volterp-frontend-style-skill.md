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

## Next step

- Tras aprobación del usuario, registrar skill OpenCode en `~/.config/opencode/skills/volterp-frontend-style/SKILL.md`.

## Relevant files

- `D:\source\my_projects\Volterp\NET-API-SKELETON-TEMPLATE.md` — referencia de formato.
- `D:\source\my_projects\erp-mvp\src\infrastructure\api\fetchWithAuth.ts` — pieza angular.
- `D:\source\my_projects\erp-mvp\src\hooks\useFilter.ts`, `useCrudForm.ts`, `usePagination.ts` — hooks reutilizables.
- `D:\source\my_projects\erp-mvp\src\infrastructure\api\*Service.ts` — 13 services homogéneos.
- `D:\source\my_projects\erp-mvp\src\stores\*Store.ts` — 16 stores Zustand.
- `D:\source\my_projects\erp-mvp\src\components\UI\*` — primitivos presentacionales.
- `D:\source\my_projects\erp-mvp\src\utils\*.ts` — helpers puros (pagination, jwt, name).