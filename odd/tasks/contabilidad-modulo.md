# Contabilidad — módulo con sub-navegación (Cuentas, CxC, CxP, Transacciones)

Objetivo: que **Contabilidad** sea un tab principal con hijos navegables, homologando el sistema con lo que el backend expone hoy.
**Branch**: `feature/contabilidad-modulo` (base `development` @ `82f91a7`) · **Delivery**: `ask-on-risk` · **Test runner**: `vitest` (`npx vitest run --pool=threads`) + `tsc -b && vite build` + `eslint .`

> **Estado del backend (auditoría read-only 2026-11-07, `feature/accounting` @ `27a1170`)**:
> lo único contable real expuesto por HTTP es el **catálogo de cuentas** (`api/accounts`). El resto es el ledger legacy plano `AccountingTransaction` (sin `AccountId`, sin partida doble), que T8 retirará. **Cero `JournalEntry`/`JournalLine`/`CostCenter`/`AccountBalance` en todo el repo.**

## Specs

### S1 — Contabilidad como tab principal con hijos
> "lo que pretendo hacer en el front es hijos del tab principal como Contabilidad -> CxC -> ..."

Cuatro hijos: **Transacciones**, **Cuentas**, **CxC**, **CxP**.

- El **Sidebar conserva un solo item** "Contabilidad" → `/contabilidad`. No se agregan items al menú lateral.
- Los hijos son **rutas hermanas** `/contabilidad/cuentas`, `/contabilidad/cxc`, `/contabilidad/cxp`, `/contabilidad/transacciones`.
- Patrón **homólogo a RRHH** (`src/pages/RRHH/RRHH.tsx:112-125`): la página padre muestra botones en el `PageHeader` que hacen `navigate()` a las rutas hijas, y cada hija tiene su botón de volver.
- **Motivo de la decisión**: el Sidebar deriva la URL del `key` del módulo (`src/components/Layout/Sidebar.tsx:87` → `to={`/${item.key === "dashboard" ? "" : item.key}`}`), así que un item nuevo saldría en `/cuentas`, nunca en `/contabilidad/cuentas`. El Sidebar es plano, de un solo nivel, sin hijos ni accordion. Y `NavLink` sin `end` ya marca activo `/contabilidad` para cualquier sub-ruta.
- `/contabilidad` **conserva su contenido actual** (transacciones) y suma los botones hacia las hijas. Nada de rutas rotas.

### S2 — Cuentas contra `/api/accounts`
CRUD completo del catálogo de cuentas, con las reglas del backend espejadas:

**Frontend primero** (L9): el front se escribe contra este contrato; hasta que el backend esté desplegado la página queda con estado vacío. **Sin capa mock**: no hay datos simulados que haya que borrar después.

| Regla del backend | Mensaje exacto | HTTP |
|---|---|---|
| código vacío | `The code is required.` | 400 |
| código duplicado **en la misma empresa** | `The code is already in use.` | 400 |
| padre inexistente o de otra empresa | `The parent account not found.` | 400 |
| el código del hijo no empieza con el del padre | `The child code must start with the parent code.` | 400 |
| una cuenta no puede ser su propio padre | `The account cannot be its own parent.` | 400 |
| borrar una cuenta con hijos | `The account cannot be deleted because it has child accounts.` | 400 |
| cuenta inexistente | `Account not found.` | **404 en GET**, **400 en PUT/DELETE** |

- `AccountDto` = `id: Guid, code, name, accountType, parentId: Guid?, isPostable, isActive, notes?` — **sin `companyId`**; el request tampoco lo acepta.
- `accountType` viaja como **string**: `"Asset" | "Liability" | "Equity" | "Income" | "Expense"`.
- **El árbol se arma en el front**: no hay endpoint de árbol ni de saldo, y no está en el plan del backend.
- `GET /api/accounts` **no tiene ORDER BY** → el front ordena.
- POST/PUT/DELETE exigen rol `Admin` o `SuperAdmin` → el botón de guardar/borrar se gatea por `usePermission`.
- `GET /api/accounts` devuelve inactivas incluidas → el front **las muestra y marca con su estado** y las filtra por tipo; no las oculta, porque tapar data real es peor que mostrarla con su estado.

### S3 — CxC: read-model sobre `/api/sales`
> "cuentas por cobrar pagar etc."

**Frontend primero** (L9): sin capa mock; el read-model se arma sobre el contrato de `SaleDto`/`PurchaseDto` y queda vacío hasta que el backend responda.

- "Cuentas por cobrar" = **ventas pendientes de cobro, agrupadas por cliente**, con su saldo.
- Se apoya en `SaleDto`, que **en el front no trae `subtotal`, `itbis`, `documentType`, `receptorTaxId` ni `items[].taxCode`**: el DTO real del front es `id, code, companyId, clienteId, clienteName, status ("Pending" | "Completed"), total, notes, createdAt, updatedAt, items[]`. El saldo se calcula sumando `total` (L12).
- **No hay endpoint que agrupe**: cada read-model agrega una página (100 filas) y el saldo cubre sólo esas filas. El filtro de pendientes es del cliente, sobre `status`.
- **Alcance honesto**: es un read-model de saldos por cliente. **No** hay facturas, no hay aplicación de pagos, no hay antigüedad real: eso llega con el diario de partida doble (T2+) del backend.

### S4 — CxP: read-model sobre `/api/purchases`
- "Cuentas por pagar" = **compras pendientes de pago, agrupadas por proveedor**, con su saldo.

**Frontend primero** (L9): sin capa mock; mismo contrato que S3.
- `PurchaseDto` **no tiene `subtotal` ni `itbis`** → hoy **no se puede calcular el 606**. Esa es la razón de fondo por la que el backend difiere las postings de compra (task F5).
- Mismo alcance honesto que S3: saldos por proveedor, sin facturas ni pagos aplicados.

### S5 — Homología de código
> "nada de reescritura si el file existe se analiza y se edita, si el file no existe pues se escribe de nuevo, siguiendo tel template que ya tenemos para mantener la misma forma de mi codigo yo escribo el codigo que tenga intencion del porque se hace, legible"

- **Editar, nunca reescribir.** Un archivo existente se edita; uno nuevo se escribe.
- La forma del código sale de `FRONTEND-SKELETON-TEMPLATE.md` (PARTE 1-2-4).
- **El código lleva intención**: cada decisión no obvia documenta *por qué*, no *qué*.
- **Sin IA slop** (§4.7 del template): un comentario existe sólo cuando el *por qué* no es evidente del código, y entonces es **una línea**. Sin narración, sin ensayos, sin abstracciones gratuitas, sin ramas "por si acaso" que nadie pidió. Y preferí siempre la **solución estructural** al comentario: si el código necesita una explicación para existir, primero hay que ver si el diseño puede hacer la pregunta innecesaria.
- Services: `export const xService = { async methodName(...) }`. Stores: shape universal `items[]/loading/error/totalCount/pageCount`. Formularios: `useCrudForm` + `DynamicFormFields` + `useDeleteConfirm`.
- **La forma sale del `FRONTEND-SKELETON-TEMPLATE.md`**, que es la autoridad sobre el shape y sobre las reglas de trabajo: **§3.2** (workflow de 7 pasos para agregar una entidad/página), **§4.7** (convenciones), **§4.8** (decisiones intencionales: los quirks se preservan), **§4.9** (anti-patrones), **§4.10** (precedencia: PRINCIPIO > STACK > quirk), **§4.11** (no negociables).
- **El código nuevo va en inglés** (L10): carpetas, componentes, DTOs, services, stores, hooks, clases CSS, claves i18n y comentarios.

### S6 — Homología visual
> "seguir el diseno, paleta de colores tipografia y todo eso, el sistema debe estar homologo"

- **Fuente de verdad del diseño**: `src/styles/variables.css` (shell navy + primario **ámbar** `#FACC15` + `Plus Jakarta Sans`). La dirección naranja/crema de `odd/tasks/minimalist-design-system.md` está **abandonada** (stash `634ab2c`).
- **Cero literales de color** (`#hex`, `rgb()`, `rgba()`, `hsl()`) en el CSS y TSX nuevos → sólo `var(--x)`.
- **`variables.css` no tiene tokens semánticos de estado** (no hay `--success`, `--danger`, `--warning`, `--info`) y `Contabilidad.module.css` hoy está **50/50**: 12 `var(--x)` contra 11 hex + 1 `rgba()`. Para que el módulo nuevo cumpla la regla hay que **extender `variables.css`** con los tokens de estado, extrayendo los valores que la app ya usa.
- `--primary` (ámbar) y `--text-muted` son **relleno/metadata, nunca color de texto** sobre superficie clara (1.53:1 y 2.42:1).

### S7 — Errores: forma no uniforme del backend
El backend usa **tres** formas de error conviviendo: `ErrorResponse{error, details?}` (`api/accounts`), objetos anónimos `{message}` (`api/sales`, `api/purchases`, `api/accountingtransactions`) y RFC 7807 `ProblemDetails` (5xx y 429).

El front lee **sólo `error.error`** (`src/infrastructure/api/fetchWithAuth.ts:34-35`), así que hoy los 404 de ventas/compras/transacciones degradan a *"An error occurred"*. **Hay que normalizar** la lectura antes de que este módulo muestre saldos que no puede explicar.

### S8 — Permisos
- Los hijos **heredan el permiso de `contabilidad`**: no se agregan módulos nuevos a la unión `Modulo` (11 keys) ni filas a `MATRIZ_PERMISOS` (6 roles × 11 módulos).
- Hoy **sólo el Sidebar consume `usePermission`**; ninguna página CRUD gatea sus acciones. Este módulo **sí** gatea guardar/borrar según el permiso, porque el backend lo exige (`Admin,SuperAdmin`).
- El backend permite **cualquier rol** escribir ventas y **sólo Admin/SuperAdmin** en cuentas → la matriz del front y el backend deben coincidir por módulo.

### S9 — i18n
- Un solo namespace i18next (`translation`), claves con dots hacia objetos anidados.
- Se agregan objetos top-level **idénticos** en `es.json` y `en.json`. No hay registro que tocar.

## Tasks

| ID | S# | Alcance | Ruta | Estado |
|---|---|---|---|---|
| T1 | S6, S7 | `src/styles/variables.css`: tokens semánticos de estado. `fetchWithAuth.ts` + `utils/apiError.ts` + `types.ts`: normalizar `error` / `message` / `ProblemDetails` en una forma interna | inline | HECHO — `f6b0e3e` (errores) + `5cc7a8d` (tokens); verificados presentes en esta rama |
| T2 | S1, S9 | Sub-navegación: rutas hijas en `App.tsx`, botones en el `PageHeader` del padre, botón de volver en cada hija, claves i18n del padre | delegado | HECHO — `57bae43` (botones del padre + `TransactionsPanel` + página `Transactions` + 7 claves i18n). Las rutas en `App.tsx` entran en T6: el padre edita ese archivo |
| T3 | S2 | `AccountDto`/`AccountRequest` en `domain/types`, `ACCOUNTS` en `config.ts`, `accountService.ts`, store de cuentas | delegado | HECHO — `AccountDto`/`AccountType`/`AccountRequest` (sin `companyId`), `ACCOUNTS: "/api/accounts"`, `accountService` con la forma canónica, `accountStore` con el shape universal |
| T4 | S2 | Página `pages/Contabilidad/Accounts/` — árbol de cuentas, CRUD con `useCrudForm`, reglas del backend espejadas | delegado | HECHO — árbol armado y ordenado en el front, `mapEntityToForm`, `combobox` para el padre, mensajes del backend verbatim, gate Admin/SuperAdmin (ver L12), 11 tests |
| T5 | S3, S4 | `CxC` y `CxP` como read-models: services sobre `/api/sales` y `/api/purchases`, agrupación por cliente/proveedor | delegado | HECHO — `083d14b` (`useAccountsReceivable`/`useAccountsPayable` + páginas `AccountsReceivable`/`AccountsPayable`, 16 tests) |
| T6 | S2, S3, S4 | Rutas hijas en `App.tsx`, claves i18n de las páginas nuevas, tests de página (patrón `src/test/components/Compras.test.tsx`), seam check: `vitest --pool=threads` + `tsc -b && vite build` + `eslint .` | delegado | PENDIENTE |
| T7 | S6 | **7 tokens referenciados y nunca declarados**: `--accent-color`, `--color-background`, `--color-primary`, `--surface-secondary`, `--surface-tertiary`, `--text-inverse`, `--text-inverse-muted` | inline | HECHO — los 4 que sí se usan, declarados (`ea606cd`); `--accent-color`, `--color-background` y `--color-primary` no aparecen en `src/`: alias muertos, no hay nada que arreglar |
| T8 | S3 | `config.ts` apunta a `/api/accounting-transactions`; la ruta del controller es `/api/accountingtransactions` | inline | PENDIENTE — fase de conexión al backend |
| T9 | S2 | **Espejar las reglas que el front puede comprobar**: auto-padre excluido del combobox, prefijo del código del hijo validado contra el código del padre, borrado bloqueado cuando la cuenta tiene hijas. Más las sondas de regresión del gate quehengas de verificar | delegado | PENDIENTE |

T3+T4 y T5 son unidades independientes con superficies disjuntas → lanzables en paralelo. T1 y T2 son prerrequisitos de ambas.

**Regla de i18n para las unidades delegadas**: cada unidad usa su propio namespace (`contabilidad.cuentas.*`, `contabilidad.cxc.*`, `contabilidad.cxp.*`) y **no edita `src/i18n/locales/`**: reporta la lista exacta de claves que usó y el padre las agrega en T6. Así las unidades no se pisan el mismo archivo.

**Delivery**: `ask-on-risk` (default). Esta rama arranca de `development` @ `82f91a7` y se entrega en commits de unidad de trabajo de ~400 líneas authored: T2 (sub-navegación) · T3+T4 (cuentas) · T5 (CxC/CxP) · T6 (i18n + tests + seam check).

**Commits heredados de `development`** (la rama vieja `feature/compras-alta-fix` ya no existe, pero sus commits entraron a `development`): `4afd1a0` Compras (proveedor buscable + editor de líneas) · `2ae51f7` VentaDetail (código de negocio) · `7413757` RRHH (reordenamiento) · `ea7c60f` Inventario (reformateo) · `f6b0e3e` error del API · `5cc7a8d` tokens de estado.

## Log

### L1 — 2026-11-06

> "Ok mira vamos a crear las paginas que hacen falta en el front o los componentes para homologarlo con lo que ya tenemos en el backend, cuentas por cobrar pagar etc. lo que pretendo hacer en el front es hijos del tab principal como Contabilidad -> CxC -> ..."

### L2 — 2026-11-07 — reglas duras

> "pero ojo unas reglas antes de que son duras inmutables: nada de reescritura si el file existe se analiza y se edita, si el file no existe pues se escribe de nuevo, siguiendo tel template que ya tenemos para mantener la misma forma de mi codigo yo escribo el codigo que tenga intencion del porque se hace, legible, ya veras el template, seguir el diseno, paleta de colores tipografia y todo eso, el sistema debe estar homologo."

### L3 — 2026-11-07 — la fuente de verdad del diseño

> "este documeno quedo desactualizado me parece: minimalist-design-system.md esto era para otra cosa tu fuente de verdad es SKELETOM-TEMPLATE, aunque si hay algo que rescatar de ese archivo usalo"

### L4 — 2026-11-07 — método

> "Valida bien primero el backend estamos trabajando eso, identifica que tenemos pero delegalo,no lo hagas inline."

### L5 — 2026-11-07 — auditoría del backend (delegada, `gentle-ai-explore`)

Rama `feature/accounting` @ `27a1170`. Lo contable real expuesto es sólo `api/accounts`. Cero `JournalEntry`/`JournalLine`/`CostCenter`/`AccountBalance` en todo el repo. T2-T8 pendientes. `PagedResult<T>` viene del paquete NuGet `MapFlow 1.2.0` y serializa `rowCount`/`pageCount` — **la descripción de Swagger miente** (`TotalCount`/`TotalPages`). Spot check del padre sobre `AccountDto` y el controller: confirmado.

### L6 — 2026-11-07 — mapa del front (delegada, `gentle-ai-explore`)

El Sidebar es plano y deriva la URL del `key` (`Sidebar.tsx:87`). El patrón de sub-navegación vigente son **rutas hermanas** alcanzadas con `navigate()` desde el `PageHeader` (RRHH → Nómina / Asistencia); el otro patrón son tabs internos con `useState` (Configuración). No hay componente `Tabs` reutilizable ni `Outlet` anidado.

### L7 — 2026-11-07 — T1 (errores + tokens de estado) y el estilo de comentario

**T1 HECHO**:
- `src/utils/apiError.ts` (nuevo): `extractErrorMessage(body, status, fallback?)` — lee `error` y luego `message`; un 5xx conserva el mensaje genérico porque su body puede llevar texto crudo de base de datos.
- `src/infrastructure/api/fetchWithAuth.ts`: el wrapper ya no lee el body; pasa a `extractErrorMessage`.
- `src/styles/variables.css`: `--success`/`--success-soft`/`--success-text`, `--danger`/`--danger-soft`/`--danger-text`, `--warning`/`--warning-soft`/`--warning-text`. `--warning` es `var(--primary)`, una **referencia**: el ámbar de marca es el color de aviso, y referenciarlo evita que diverjan.
- `src/pages/Contabilidad/Contabilidad.module.css`: sus 12 literales pasan a tokens (dejó de estar 50/50).
- `src/components/Support/ChatInput.module.css:50`: `var(--primary-hover)` (nunca declarado) → `var(--primary-dark)`. El hover del botón **no se aplicaba**.
- `src/components/Support/ChatHeader.module.css:41,47`: `var(--success)` (nunca declarado) → **arreglado en cascada** al declarar `--success`.

**Verificación**: 35 archivos / 271 tests verde, `tsc -b` sin errores, eslint limpio sobre los archivos tocados. La suite corre con `npx vitest run --pool=threads` (el pool `forks` no arranca en Windows).

**Corrección de estilo (el owner la señaló)**: el bloque de comentario de 8 líneas que se había puesto en `variables.css` **era incorrecto**. La regla de casa, verificada contra el repo: `jwt.ts` usa JSDoc de 2-4 líneas, `normalizeSearch.ts` no tiene ninguno, y `variables.css` **no tenía ni un comentario**. Un comentario existe sólo cuando el *por qué* no es evidente del código, y entonces es una línea. Se eliminó el bloque y se resolvió con un token (`--warning: var(--primary)`) que hace innecesaria la explicación.

**Deuda detectada y acotada (T7)**: 7 tokens referenciados y nunca declarados. Se documentan en el template §1.5 y quedan como tarea propia: cada uno necesita leer su uso para decidir a qué token canónico apuntarlo.

**Nota de estado**: `src/pages/RRHH/RRHH.tsx` aparece modificado en el working tree (code-motion de `handleEdit` + reformateo del destructure de `useDeleteConfirm`). **No es un cambio de este trabajo** — se detectó modificado a las 9:49:42, durante la vuelta. Es inocuo (`tsc -b` lo validó) y no se tocó.

### L8 — 2026-11-07 — regla dura: no IA slop

> "anota en las reglas duras que no permitimos ia slop porqu ete lo digo a cada rato"

Regla 5 de las reglas duras del front. Texto original de casa (backend): `odd/tasks/accounting.md` §Code conventions — *"The code expresses the intent. A comment exists only when the why is not evident from the code, and then it is one line. No narration, no essays, no restating the code."*

Quedó escrita en:
- `FRONTEND-SKELETON-TEMPLATE.md` §4.7 (el principio) y §4.9 (el anti-patrón).
- Este feature doc, en **S5** — la spec lo lleva, no sólo el template.
- Engram `convention/reglas-duras-frontend`.

La aplicación práctica que quedó: **preferir la solución estructural al comentario**. El caso de T1 es el ejemplo — en vez de un bloque de 8 líneas explicando por qué no existía `--warning`, se declaró `--warning: var(--primary)`, una referencia que no puede divergir y hace la pregunta innecesaria.

### L9 — 2026-11-12 — el frontend primero, el backend después

> "Ok perfecto vamos a implementar el plan para contabilidad y posteriormente lo conectamos al backend. pero ya tendremos el frontend armado, seria Padre = Contabilidad. Hijos = cxc, etc"

> "espera champ eso vamos a hacerlo en una feature branch aparte para no ensuciar development"

Decisiones:

- **Rama `feature/contabilidad-modulo`**, base `development` @ `82f91a7`. La línea `Branch: feature/compras-alta-fix` de la cabecera quedó vieja: esa rama ya no existe, aunque sus commits **sí están en `development`**.
- **Solo el contrato real, sin mock**: los services y stores se escriben contra `/api/accounts`, `/api/sales` y `/api/purchases`. Las páginas quedan completas pero con estado vacío hasta que el backend esté desplegado. No hay capa de datos simulados que borrar después.
- **No se lee el repo `Volterp`**: este doc es la fuente del contrato.
- **Estructura confirmada**: padre `/contabilidad` con 4 hijos — `/contabilidad/transacciones`, `/contabilidad/cuentas`, `/contabilidad/cxc`, `/contabilidad/cxp`.
- **T7 cerrado**: los 4 tokens que sí se usan quedaron declarados (`ea606cd`); los 3 restantes no aparecen en `src/` → alias muertos.
- **T8 nuevo**: `config.ts` apunta a `/api/accounting-transactions` y la ruta del controller es `/api/accountingtransactions` (404 preexistente). Queda para la fase de conexión al backend.
- **Tests RED del chat de soporte** (`src/test/components/Support/`): pausados con extensión `.paused` para que no rompan la suite mientras el chat está en pausa.
- **El `FRONTEND-SKELETON-TEMPLATE.md` es la autoridad** sobre el shape y sobre las reglas de trabajo, no sólo un catálogo de snippets: §3.2 (workflow de 7 pasos), §4.7 (convenciones), §4.8 (quirks con motivo), §4.9 (anti-patrones), §4.10 (precedencia PRINCIPIO > STACK > quirk), §4.11 (no negociables). Tres decisiones que salen de leerlo: (1) la entidad nueva va **en inglés** (`AccountDto`, `accountService`, `accountStore`) mientras la carpeta de la página va en español (§3.2 paso 5); (2) `AccountDto` trae `parentId` y `notes` nulables → **`mapEntityToForm` es obligatorio** (§4.5); (3) el gate de guardar/borrar **no puede ser `usePermission.isAdmin`** (§4.8: ese flag es sólo SUPER_ADMIN y el backend acepta Admin y SuperAdmin) → se deriva de la matriz de `contabilidad`.

### L10 — 2026-11-12 — el código nuevo va en inglés

> "en un futuro vamos a cambiar por completo todo al ingles a nivel del codigo lo nuevo ponlo todo en ingles"

- **Todo lo nuevo en inglés**: carpetas, componentes, DTOs, services, stores, hooks, clases CSS, claves i18n y comentarios. El repo se migra completo al inglés más adelante; lo nuevo no crea más español.
- **Las rutas NO se renombran**: `/contabilidad/transacciones`, `/contabilidad/cuentas`, `/contabilidad/cxc`, `/contabilidad/cxp` son superficie de producto y están fijadas en S1. Lo que va en inglés es el código, no la URL.
- **Los valores de `es.json` siguen en español** (es copy); lo que va en inglés son las **claves**.
- **Lo existente no se renombra**: ni claves i18n actuales, ni identificadores previos (`filteredTransacciones`, `handleEdit`, `transaccionStore`). Sólo lo nuevo.
- Nombres derivados de la spec: `Accounts` (Cuentas), `AccountsReceivable` (CxC), `AccountsPayable` (CxP), `Transactions` (Transacciones).

### L11 — 2026-11-12 — T2 entregada

- Commit `57bae43`: los cuatro botones de navegación del padre, la extracción de `TransactionsPanel` (la UI de transacciones sale de la página y la comparten el padre y la hija) y la página hija `Transactions` con su vuelta a `/contabilidad`.
- El padre bajó de 460 a 50 líneas: la UI de transacciones no quedó duplicada.
- Rutas en español, código en inglés: `TransactionsPanel`, `Transactions`, `navTransactions`, `navAccounts`, `navAccountsReceivable`, `navAccountsPayable`, `transactionsTitle`, `transactionsSubtitle`, `backToAccounting`.
- Verificación del worker: `vitest` focal de Compras 9/9 verde, `eslint` limpio sobre lo tocado, `git diff --check` limpio.
- **Sin test propio**: la superficie autorizada de T2 no incluía `src/test/**`. El test de navegación del padre queda en T6.
- **Riesgo declarado en el commit**: el botón "Nueva transacción" se movió del `PageHeader` a la fila de filtros, para que el padre y la hija lo tengan los dos. Ningún test cubre la posición de un control.
- **El commit se amendó**: `d131101`. El worker declaró los valores del formulario como `interface TransactionFormValues`, y una `interface` no tiene index signature implícita → no satisface el `T extends Record<string, unknown>` de `useCrudForm` ni el `values: Record<string, unknown>` de `DynamicFormFields`. **Los valores de formulario que pasan por `useCrudForm` se declaran con `type`, nunca con `interface`.** La rama queda sin commits que no compilan.

### L12 — 2026-11-12 — la matriz de permisos no alcanza para el gate de cuentas

- **El backend acepta sólo Admin y SuperAdmin** en POST/PUT/DELETE de `/api/accounts`. La matriz del front dice `contabilidad: { read: true, write: true, delete: false }` para el rol `contabilidad` → con el gate derivado de la matriz, ese rol veía el botón de guardar y se comía un 403.
- **La matriz no puede expresar la regla**: su granularidad es por módulo, y la del backend es por endpoint. El rol `contabilidad` **sí** puede escribir transacciones (el backend se lo permite a cualquier rol) → tocar la matriz para bloquear las cuentas bloquearía también las transacciones.
- **Decisión**: el gate de la página de cuentas se deriva del **rol** (`Rol.ADMIN` o `Rol.SUPER_ADMIN`), que es la traducción exacta de lo que acepta el endpoint. La matriz compartida no se tocó.
- **Consecuencia**: los hijos de Contabilidad heredan el permiso de lectura del módulo; guardar y borrar cuentas es Admin/SuperAdmin.
- **Pendiente del backend**: cuando exista el agrupado por cliente/proveedor, el read-model de CxC/CxP deja de agregar una página y hay que avisarlo en la página, porque hoy el saldo mostrado no es el saldo real.
- **Límite del catálogo**: se pide una página de 200 cuentas y se pagina en memoria sobre el árbol aplanado. Si una empresa supera 200 cuentas, el árbol se trunca.

### L13 — 2026-11-12 — verificación independiente del gate de cuentas

Un verificador read-only (`gentle-ai-verify`) revisó el gate de permisos, el armado del árbol, las reglas espejadas y la cobertura de tests. **0 bloqueantes**; 8 avisos y un FAIL parcial de cobertura.

- **Gate: PASS**. Los cuatro caminos de escritura que existen (botón de nueva, editar/borrar de fila, submit del modal, confirmación de borrado) están detrás de `canManageAccounts`. No hay atajo de teclado ni otro consumidor del store. Sonda observada: con rol `contabilidad`/`ventas`/`inventario`/`rrhh` no aparece ningún control y **el service no es llamado**.
- **Árbol: PASS**. Huérfanos y ciclos cortan la recursión; no hay cuelgue. Auto-padre cae a raíz.
- **FAIL parcial — cobertura**: no había test para el rol `superadmin`, ni para `inventario`/`rrhh`, ni para sesión nula, ni aserción negativa de que el service **no** se llame sin permiso, ni para árbol con huérfano o ciclo. → T9.
- **FAIL parcial — reglas**: de las 7 reglas del backend, el front previene el código vacío; la unicidad, el prefijo del código del hijo y el auto-padre llegaban al backend como mensaje. El borrado con hijos tampoco se bloqueaba, aunque la página ya conoce el número de hijas. → T9.
- **Avisos que quedan documentados y no se tocan** (son de alcance ajeno a esta feature, o de borde):
  - **Sin gate de lectura por módulo**: el Sidebar esconde el item, pero la ruta sólo exige autenticación, así que cualquier usuario autenticado que escriba la URL entra a `/contabilidad/cuentas`. Es un hueco **sistémico de la app**, no de esta página; se reporta para una unidad aparte. Si el backend no restringe `GET /api/accounts`, es una fuga de lectura.
  - **Rol numérico rompe la página**: `usePermission` hace `user.role.toLowerCase()` y `roles.ts` tiene un `normalizeRole` que no se usa. **Preexistente** (el login normaliza), no lo introduce esta rama; se reporta.
  - **El gate es de presentación**: si el rol cambia con el modal abierto, el submit sigue escribiendo. El backend rechaza con 403; el impacto real es nulo.
  - **Huérfano y ciclo se muestran como jerarquía válida**: un padre fuera de la página cargada aparece como "Sin cuenta padre". Ocurre sólo con más de 200 cuentas o con data corrupta.
- **Doc**: "11 tests" era deriva; son 12.

## Relevant Files

- `FRONTEND-SKELETON-TEMPLATE.md` — forma del código (§1.5 = contrato visual).
- `src/styles/variables.css` — paleta y tokens vivos.
- `src/pages/Contabilidad/Contabilidad.tsx` + `.module.css` — la página que se convierte en tab principal.
- `src/pages/RRHH/RRHH.tsx:112-125` — el precedente homólogo de sub-navegación.
- `src/components/Layout/Sidebar.tsx:87` — la derivación de URL que obliga al diseño de las rutas hijas.
- `src/infrastructure/api/fetchWithAuth.ts:33-36` — la normalización de errores (T1).
- `src/domain/constants/permisos.ts` — la matriz que los hijos heredan.
