# Volterp Frontend — Skeleton & Template

> **Propósito**: punto de partida único y obligatorio para crear cualquier frontend del ecosistema Volterp (o proyectos derivados) siguiendo el estilo del usuario. Separa **SKELETON** (la forma del proyecto) de **TEMPLATE** (qué código va en cada archivo). Después de leerlo, se puede generar un proyecto nuevo sin tener que explicar Clean Architecture adaptada a React, hooks de UI, auth wrapper, ni stores otra vez.
>
> **Origen**: extraído del proyecto Volterp ERP frontend. React 18 + TypeScript + Vite + Zustand + CSS Modules + react-i18next + React Router v6.

---

## Metadata

| Item | Value |
|---|---|
| Skill domain | React + TypeScript frontend |
| Runtime | Vite 5, Node 20+ |
| UI | React 18 + TypeScript 5 (strict) |
| State | Zustand (global) + React local state (per-form/per-page) |
| Styling | CSS Modules + CSS Variables (no Tailwind) |
| Routing | React Router v6 |
| HTTP | native `fetch` envuelto en `fetchWithAuth` |
| i18n | react-i18next |
| Forms | custom `useCrudForm` hook (declarativo) |
| Tables | custom generic `<Table<T>>` + `<Pagination>` components |
| Architecture | Clean Architecture-inspired (`infrastructure` → `stores` → `application` → `components`/`pages`) |
| Source language | English (artifacts), Spanish (conversational docs) |
| Last synced with code | **2026-11-07** — `useCrudForm`, `useDeleteConfirm`, `useColecciones`, `Modal`, `ConfirmModal`, `DynamicFormFields`, `SearchableSelect`, contrato visual (§1.5) |

---

## Maintenance rule

> Este MD **duplica código vivo**. Un snippet desactualizado es peor que un snippet ausente: alguien lo copia y hereda el bug.
>
> **Si cambiás un archivo que tiene snippet acá, actualizá su snippet en el mismo commit.** Los archivos con snippet son: `useCrudForm`, `useDeleteConfirm`, `useFilter`, `usePagination`, `usePermission`, `useTokenExpiry`, `useColecciones`, `fetchWithAuth`, `config.ts`, los services, `clienteStore`, `authStore`, `Table`, `Pagination`, `Modal`, `ConfirmModal`, `Button`, `ActionButtons`, `SearchInput`, `SearchableSelect`, `DynamicFormFields`, `Toast`, `PageHeader`, `ErrorBoundary`, `ImageCell`, los helpers de `utils/`, el init de i18n, `Login`, `Register` y `App.tsx`.
>
> Si el archivo cambió tanto que el snippet ya no es representativo, **borrá el snippet y apuntá al path vivo** (§2.4, "Hooks retirados", es el precedente).

---

## How to read this document

- **Parte 1 — SKELETON** define la forma del proyecto: carpetas, capas, dependencias, archivos de configuración. Es lo que se genera una vez.
- **Parte 2 — TEMPLATE** define qué código va en cada archivo del skeleton. Para cada archivo hay un snippet listo para copiar y adaptar.
- **Parte 3 — WORKFLOW** explica cómo crear un proyecto nuevo desde este template y cómo agregar una nueva entidad/página.
- **Parte 4 — CONVENCIONES** agrupa las reglas transversales (naming, errores, pagination, i18n, decisiones intencionales, anti-patterns).

---

# PARTE 1 — SKELETON

## 1.1 Estructura de carpetas `[STACK: Clean Architecture con infrastructure → stores → application → components/pages; adaptable a otra organización por capas]`

Un único proyecto Vite (no hay monorepo). El frontend vive en `src/` con cuatro capas concéntricas (`infrastructure` es lo más "externo", `components`/`pages` lo más "cercano al usuario"). Los servicios, stores y hooks custom están separados por responsabilidad.

```
erp-mvp/
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── .env                          ← VITE_API_URL=http://localhost:5106
├── .env.example
├── index.html
├── README.md
│
└── src/
    ├── main.tsx                  ← entry point: ReactDOM.createRoot
    ├── App.tsx                   ← BrowserRouter + ErrorBoundary + NotificationContainer
    │
    ├── application/              ← use-cases / orquestación específica de dominio
    │   └── hooks/                ← un hook por caso de uso (recibe deps de stores)
    │       ├── useNominaCalculator.ts
    │       ├── useEmpleadoForm.ts
    │       └── useDashboard.ts
    │
    ├── assets/                   ← imágenes, fuentes, SVGs estáticos
    │   └── logo.svg
    │
    ├── components/               ← presentacionales + container-presentational
    │   ├── Layout/
    │   │   ├── Layout.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── *.module.css
    │   ├── UI/                   ← primitivos reutilizables (Tabla, Modal, etc.)
    │   │   ├── Button.tsx
    │   │   ├── Table.tsx
    │   │   ├── Pagination.tsx
    │   │   ├── Modal.tsx
    │   │   ├── ConfirmModal.tsx
    │   │   ├── SearchInput.tsx
    │   │   ├── SearchableSelect.tsx
    │   │   ├── PageHeader.tsx
    │   │   ├── PageLoader.tsx
    │   │   ├── ActionButtons.tsx
    │   │   ├── ImageCell.tsx
    │   │   ├── DynamicFormFields.tsx
    │   │   ├── VolterpMark.tsx
    │   │   ├── Toast.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   └── index.ts          ← barrel (solo para UI primitives)
    │   ├── Support/              ← feature component group (chat IA)
    │   └── UserManagement/
    │
    ├── config/                   ← constantes globales (no lógica)
    │   └── pagination.ts         ← ITEMS_PER_PAGE
    │
    ├── data/                     ← fixtures / mock data
    │   ├── mockData.ts
    │   ├── soporteResponses.ts
    │   └── asistenciaMockData.ts
    │
    ├── domain/                   ← tipos y constantes de dominio PURAS (sin React)
    │   ├── index.ts              ← barrel para entities + types
    │   ├── types/
    │   │   └── index.ts          ← DTOs compartidos (ClientDto, SaleDto, PagedResult<T>, etc.)
    │   ├── entities/             ← tipos de dominio compuestos
    │   │   ├── Nomina.ts
    │   │   ├── Beneficio.ts
    │   │   └── Asistencia.ts
    │   ├── constants/
    │   │   ├── roles.ts          ← Rol enum-as-const + helpers
    │   │   └── permisos.ts       ← MATRIZ_PERMISOS
    │   └── dashboard/
    │       ├── types.ts
    │       └── constants.tsx
    │
    ├── hooks/                    ← hooks genéricos reutilizables (sin lógica de dominio)
    │   ├── useFilter.ts
    │   ├── usePagination.ts
    │   ├── useCrudForm.ts
    │   ├── useDeleteConfirm.ts
    │   ├── useColecciones.ts
    │   ├── usePermission.ts
    │   └── useTokenExpiry.ts
    │
    ├── i18n/
    │   ├── index.ts              ← init de react-i18next
    │   └── locales/
    │       ├── es.json
    │       └── en.json
    │
    ├── infrastructure/           ← adapters hacia el exterior (HTTP, auth, etc.)
    │   └── api/
    │       ├── config.ts         ← API_CONFIG.BASE_URL + ENDPOINTS
    │       ├── types.ts          ← ApiError, LoginRequest, LoginResponse, RegisterRequest
    │       ├── fetchWithAuth.ts  ← fetch wrapper + 401 interceptor
    │       ├── authService.ts
    │       ├── clientService.ts
    │       ├── productService.ts
    │       ├── categoryService.ts
    │       ├── supplierService.ts
    │       ├── saleService.ts
    │       ├── purchaseService.ts
    │       ├── employeeService.ts
    │       ├── companyService.ts
    │       ├── userService.ts
    │       ├── accountingTransactionService.ts
    │       ├── proyectoService.ts
    │       └── dashboardService.ts
    │
    ├── pages/                    ← rutas — una carpeta por módulo
    │   ├── Dashboard/
    │   ├── Login/
    │   ├── Register/
    │   ├── Ventas/
    │   ├── Compras/
    │   ├── Inventario/
    │   ├── Clientes/
    │   ├── Proveedores/
    │   ├── Contabilidad/
    │   ├── RRHH/                 ← incluye Nomina/ y Asistencia/
    │   ├── Proyectos/
    │   ├── Reportes/
    │   ├── Configuracion/
    │   └── Soporte/
    │
    ├── stores/                   ← Zustand global state (uno por entidad)
    │   ├── authStore.ts
    │   ├── clienteStore.ts
    │   ├── productoStore.ts
    │   ├── categoryStore.ts
    │   ├── proveedorStore.ts
    │   ├── ventaStore.ts
    │   ├── compraStore.ts
    │   ├── empleadoStore.ts
    │   ├── companyStore.ts
    │   ├── transaccionStore.ts
    │   ├── proyectoStore.ts
    │   ├── dashboardStore.ts
    │   ├── chatStore.ts
    │   ├── asistenciaStore.ts
    │   ├── uiStore.ts            ← toasts, modals, loading overlay
    │   └── languageStore.ts
    │
    ├── styles/
    │   └── variables.css         ← CSS custom properties (colores, spacing, radius)
    │
    ├── test/                     ← tests con vitest + @testing-library
    │   ├── setup.ts
    │   ├── vitest-env.d.ts
    │   ├── utils/pagination.test.ts
    │   ├── stores/*.test.ts
    │   └── components/*.test.tsx
    │
    └── utils/                    ← helpers puros (sin React, sin fetch)
        ├── pagination.ts         ← getPaginationInfo, getPageNumbers, paginate
        ├── jwt.ts                ← getTokenExpiry, isTokenExpired, msUntilExpiry
        └── name.ts               ← getFirstName, getInitials
```

> **Nota**: `application/hooks/` está separado de `hooks/` a propósito. `hooks/` contiene hooks **genéricos** y reutilizables (no conocen ninguna entidad). `application/hooks/` contiene hooks **específicos de un caso de uso** — saben de `clienteStore`, `companyStore`, etc.

## 1.2 Regla de dependencias entre capas `[PRINCIPIO]`

```
pages ──► components ──► application ──► infrastructure
     └────► stores ──────┘                 └► stores (for token in fetchWithAuth)
```

- **`pages`** compone `components` + `application/hooks/*` + `stores` directamente. Una página = una ruta.
- **`components`** consume `application/hooks/*` cuando necesita lógica de dominio. **Nunca** importa `stores` directamente (excepción: `ErrorBoundary` y `NotificationContainer` que leen `uiStore`).
- **`application/hooks/*`** recibe dependencias de `stores` y/o `services` y devuelve una API cohesiva para una vista. Son la "puerta de entrada" a stores desde los componentes.
- **`infrastructure/api/*`** no conoce React ni Zustand. Solo `fetch`. La única excepción es `fetchWithAuth.ts`, que lee el token desde `authStore` (es un caso justificado — es un interceptor global).
- **`stores`** solo depende de `infrastructure/api/*` (servicios) y `domain/*` (tipos).
- **`utils`** y **`domain`** son libres de dependencias, pero no importan nada "arriba" (nada de React, Zustand, fetch).

> **Reglas explícitas**:
> 1. `components/**` no importa `stores/**` directamente excepto en `ErrorBoundary` y `NotificationContainer` (que son cross-cutting). Toda interacción con store pasa por un hook en `application/hooks/*`.
> 2. `pages/**` es la única capa que puede tocar stores directamente (para cosas muy puntuales como `useAuthStore` en `ProtectedRoute`).
> 3. `infrastructure/api/*` nunca importa React ni hooks. Solo `fetch` y tipos.
> 4. `hooks/**` (genéricos) no importan `stores/**` ni `domain/types/*`. Son agnósticos al dominio.

## 1.3 Configuración base

### package.json — dependencias clave `[STACK: Vite 5 / React 18 / Zustand 4]`

```json
{
  "name": "erp-mvp",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "i18next": "^23.x",
    "lucide-react": "^0.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-i18next": "^14.x",
    "react-router-dom": "^6.x",
    "recharts": "^2.x",
    "zustand": "^4.x"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.x",
    "@testing-library/react": "^14.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "@vitejs/plugin-react": "^4.x",
    "eslint": "^8.x",
    "eslint-plugin-react-hooks": "^4.x",
    "eslint-plugin-react-refresh": "^0.x",
    "jsdom": "^23.x",
    "typescript": "^5.x",
    "typescript-eslint": "^7.x",
    "vite": "^5.x",
    "vitest": "^1.x"
  }
}
```

> **Razón del set**: Vite 5 + Vitest 1 comparten config y por eso el `vitest.config` puede extender `vite.config`. React 18 con `react-i18next` 14 y `zustand` 4 son las versiones estables que conviven sin peer-dep warnings.

### tsconfig.app.json — strict + features de Vite `[STACK]`

```jsonc
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "types": ["vite/client"],
    "esModuleInterop": true,
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["src/test/**"]
}
```

> **Decisiones clave**:
> - `strict: true` activo (incluye `strictNullChecks`, `noImplicitAny`).
> - `verbatimModuleSyntax: true` — fuerza `import type` para tipos.
> - `jsx: "react-jsx"` (no hace falta `import React from 'react'`).
> - `src/test/**` se excluye de la build pero Vitest los levanta igual (su propio tsconfig si hace falta).
> - **No hay `paths` alias** — se usan rutas relativas (`../../stores/...`). Decisión intencional: prefiero ver la distancia.

### vite.config.ts — Vite + Vitest en un solo archivo `[STACK]`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
```

> **Razón**: Vitest reutiliza el pipeline de Vite — JSX, CSS Modules, aliases, todo funciona igual. `globals: true` permite usar `describe/it/expect` sin imports.

### .env `[STACK]`

```
VITE_API_URL=http://localhost:5106
```

> **Regla**: solo se exponen al cliente las vars prefijadas con `VITE_`. El `BASE_URL` se lee en `infrastructure/api/config.ts` con fallback.

## 1.4 i18n `[STACK: react-i18next con detección custom, no LanguageDetector]`

### Estructura

```
src/i18n/
├── index.ts          ← init de i18next con recursos y detección de idioma
└── locales/
    ├── es.json       ← idioma por defecto (fallback)
    └── en.json
```

### Convención

- **Toda la copia user-facing vive en `src/i18n/locales/{es,en}.json`**. Nunca hardcoded strings en componentes.
- Los archivos JSON están organizados por namespace (`common`, `auth`, `sidebar`, `ventas`, `clientes`, etc.). Cada namespace es una sección top-level del JSON.
- Los componentes consumen con `const { t } = useTranslation()` o el hook sin namespace (busca en `common` por default).
- **Idioma por defecto**: `es`. El `init` detecta idioma del navegador y cae a `es` si no es `en`.
- Las claves usan **camelCase** (`selectClientWarning`, `saleCompleted`).
- Los **mensajes de error** que vienen del backend (en `stores/services`) son **inglés** (son técnicos). Los **mensajes de validación de formularios** (`useCrudForm`) son **español** (son UX-facing). Esta separación está en `§4.4`.

### Estructura de claves (extracto de `es.json`)

```json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "search": "Buscar",
    "loading": "Cargando...",
    "actions": "Acciones",
    "confirmDeleteTitle": "Confirmar eliminación",
    "confirmDeleteMessage": "¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
  },
  "auth": {
    "login": "Iniciar Sesión",
    "username": "Usuario",
    "password": "Contraseña",
    "invalidCredentials": "Credenciales incorrectas",
    "sessionExpired": "Tu sesión ha expirado"
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "ventas": "Ventas",
    "compras": "Compras",
    "inventario": "Inventario",
    "clientes": "Clientes",
    "proveedores": "Proveedores",
    "contabilidad": "Contabilidad",
    "rrhh": "RRHH",
    "proyectos": "Proyectos",
    "reportes": "Reportes",
    "configuracion": "Configuración",
    "soporte": "Soporte"
  }
}
```

---

## 1.5 Contrato visual (color, tipografía, tokens) `[PRINCIPIO: el color se declara una vez; STACK: los valores concretos]`

**Ubicación**: `src/styles/variables.css` — importado una vez en `App.tsx`. **Es la única fuente de verdad** del color, la tipografía, el radio, el espaciado y las sombras.

> **Por qué existe esta sección**: una dirección de diseño anterior (naranja `#FF632B` + shell crema, tipo Coderhouse) se probó y se **abandonó** el 2026-11-05 — quedó en el stash `634ab2c` (57 archivos) y nunca llegó a `development`; el guard de tokens nunca se creó. La paleta **vigente** es la de abajo. Los **principios** de aquel intento sí se conservan: tokenización total del color, contraste como contrato y tipografía libre con licencia OFL.

### La paleta vigente

| Token | Valor | Rol |
|---|---|---|
| `--primary` | `#FACC15` | **ámbar de marca** — relleno: botón primario, acentos, highlights |
| `--primary-dark` | `#EAB308` | hover del primario |
| `--primary-light` | `#FEF08A` | fondo teñido del primario |
| `--primary-gradient` | `linear-gradient(180deg, #FACC15, #EAB308)` | encabezado de marca |
| `--brand-navy` | `#1e3a5f` | navy de marca |
| `--brand-gradient` | `linear-gradient(180deg, #1e3a5f, #0f172a 50%, #020617)` | degradado de marca (POS, login) |
| `--dark` | `#0f172a` | fondo oscuro de marca |
| `--sidebar-bg` | `#1F2937` | shell del sidebar |
| `--sidebar-hover` | `#374151` | hover del item del sidebar |
| `--background` | `#F8F9FC` | canvas |
| `--surface` | `#ffffff` | superficie de tarjeta |
| `--surface-hover` | `#F3F4F6` | hover de superficie |
| `--surface-soft` | `#FEFEFE` | superficie casi blanca |
| `--border` | `#E5E7EB` | borde estándar |
| `--border-light` | `rgba(0, 0, 0, 0.06)` | borde suave |
| `--glass-bg` / `--glass-border` / `--surface-blur` | `rgba(255,255,255,.75)` / `rgba(255,255,255,.3)` / `rgba(255,255,255,.85)` | superficies translúcidas del shell |
| `--gray-50` … `--gray-300` | `#F9FAFB` … `#D1D5DB` | escala de grises |
| `--text-primary` | `#1F2937` | **texto principal** (13.9:1 sobre canvas — AAA) |
| `--text-secondary` | `#6B7280` | **texto secundario** (4.64:1 sobre canvas — AA) |
| `--text-muted` | `#9CA3AF` | texto apagado / metadatos (2.42:1 — **no usar para texto que se lea**) |
| `--success` / `--success-soft` / `--success-text` | `#10B981` / `#D1FAE5` / `#065F46` | estado positivo: saldo a favor, conciliado |
| `--danger` / `--danger-soft` / `--danger-text` | `#EF4444` / `#FEE2E2` / `#991B1B` | estado negativo: egreso, rechazo |
| `--warning` / `--warning-soft` / `--warning-text` | `var(--primary)` / `#FEF3C7` / `#92400E` | estado de aviso: pendiente |
| `--focus-ring` | `0 0 0 3px rgba(250,204,21,.15)` | anillo de foco |
| `--shadow-sm` … `--shadow-soft` | 5 niveles | elevación |
| `--radius-sm` … `--radius-xl` | `8px` … `20px` | radios |
| `--space-xs` … `--space-xl` | `4px` … `32px` | espaciado |
| `--transition` | `all .25s cubic-bezier(.4,0,.2,1)` | transición estándar |

> `--warning` es una **referencia** a `--primary`, no un valor duplicado: el ámbar de marca es el color de aviso en esta app. Referenciarlo evita que las dos copias diverjan.

### Tipografía

- **Hoy hay una sola familia**: `Plus Jakarta Sans` (OFL, gratuita). `--font-body` (21 usos) y `--font-display` (4 usos) **apuntan a la misma familia** — `--font-display` marca los 4 puntos de jerarquía (wordmark del sidebar y títulos de página), no una tipografía distinta.
- `index.html` **no carga** ninguna fuente de display extra.
- **Regla**: si alguna vez se quiere una tipografía de display, tiene que ser libre con licencia OFL. Nada de fuentes de pago sin decisión explícita del usuario.

### Reglas

- **Tokenización**: el color se declara en `variables.css` y se consume con `var(--x)`. En código **nuevo**: cero literales `#hex`, `rgb()`, `rgba()`, `hsl()` fuera de ese archivo.
  - **Deuda real y conocida**: hoy hay **363 literales hex y 132 `rgba()`** fuera de `variables.css` en `src/**`, sobre **57 tokens declarados**. No hay guard que lo imponga (`src/test/design-tokens.test.ts` nunca se creó). No es motivo para *no* tokenizar lo nuevo — es el backlog.
  - **Deuda más grave: 7 tokens referenciados y nunca declarados** — `--accent-color`, `--color-background`, `--color-primary`, `--surface-secondary`, `--surface-tertiary`, `--text-inverse`, `--text-inverse-muted`. Una custom property sin declarar resuelve a un valor inválido, así que **la regla CSS que la usa no se aplica en el navegador**. Son alias de tokens que ya existen: la corrección es apuntarlos al token canónico, no inventar un valor nuevo.
- **Contraste como contrato**:
  - `--primary` (ámbar) es **relleno, nunca texto** sobre superficie clara: `#FACC15` sobre `#F8F9FC` da **1.53:1** (FAIL). Como botón con texto oscuro encima, sí.
  - `--text-muted` es **2.42:1** sobre el canvas (FAIL AA): sólo para metadatos, iconos o separadores, nunca para texto que el usuario tenga que leer.
  - Texto legible sobre claro: `--text-primary` (13.9:1, AAA) y `--text-secondary` (4.64:1, AA).
- **Glassmorphism**: el shell **sí lo usa hoy** (`--glass-bg`, `--surface-blur`, 12 `backdrop-filter` en `src/**/*.css`). No se elimina sin una decisión explícita — la dirección que lo eliminaba era la abandonada.
- **Sombras**: 1px y sutiles (`--shadow-sm` / `--shadow`). La sombra mínima es el valor por defecto.
- **Homología**: una pantalla nueva se ve como las existentes. Si necesita estilos que no existen en `variables.css`, el token **se agrega al archivo** — no se inlinea el valor.

---

# PARTE 2 — TEMPLATE

## 2.1 Infrastructure layer `[STACK: fetch wrapper; PRINCIPIO en la idea de interceptor 401]`

### fetchWithAuth (auth wrapper central) `[PRINCIPIO]`

**Ubicación**: `src/infrastructure/api/fetchWithAuth.ts`
**Propósito**: wrapper único sobre `fetch` que inyecta el JWT, intercepta 401 y dispara logout + evento `auth:session-expired`.
**Reglas**:
- TODOS los services importan este wrapper. Nunca `fetch` directo en services.
- 401 → `useAuthStore.getState().logout()` + `window.dispatchEvent(new CustomEvent('auth:session-expired'))` + `throw new Error('SESSION_EXPIRED')`.
- `fetchWithAuthJson<T>` es la versión que también parsea el body. Usar por defecto salvo que el endpoint devuelva `204 No Content` (donde se usa `fetchWithAuth` y se ignora el body).
- Headers: `'Content-Type': 'application/json'` se aplica por defecto. Cualquier header del caller pisa el default.
- **NO** se importa React ni hooks aquí. Solo `useAuthStore.getState()` (acceso directo al state de Zustand).
- **Errores**: el backend usa **tres** cuerpos de error a la vez (`ErrorResponse{error,details?}`, anónimo `{message}` y RFC 7807 `ProblemDetails`). El wrapper NO lee el body: lo pasa a `extractErrorMessage` (`src/utils/apiError.ts`), que es quien sabe cuál trae un mensaje que el usuario puede actuar. Un 5xx conserva el mensaje genérico porque su body puede llevar texto crudo de base de datos.
- **Hexagonal — port vs adapter**: `fetchWithAuth` es el **port** (interfaz pública: `(url, options) => Response` y la variante `fetchWithAuthJson<T>`). La función `fetch` nativa adentro es el **adapter** actual. Si querés cambiar de HTTP client (`axios`, `ky`, `ofetch`, etc.), reescribís SOLO el cuerpo de las dos funciones — los ~12 services que importan este wrapper no se enteran porque el contrato público no cambia. Esta es la razón principal de existir del wrapper.

**Snippet:**

```typescript
import { useAuthStore } from '../../stores/authStore';
import { extractErrorMessage } from '../../utils/apiError';

/**
 * Centralized fetch wrapper that:
 * 1. Injects Authorization: Bearer <token> header
 * 2. Intercepts 401 → triggers logout + dispatches session-expired event
 *
 * Services should import this instead of duplicating fetchWithAuth locally.
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuthStore.getState().token;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    // Dispatch a custom event so useTokenExpiry and any listener can react
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    throw new Error('SESSION_EXPIRED');
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new Error(extractErrorMessage(body, response.status));
  }

  if (response.status === 204) return response;

  return response;
}

/**
 * Convenience wrapper that also parses JSON from the response.
 */
export async function fetchWithAuthJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(url, options);
  if (response.status === 204) return null as T;
  return response.json();
}
```

### API types (contratos compartidos) `[PRINCIPIO]`

**Ubicación**: `src/infrastructure/api/types.ts`
**Propósito**: tipos que describen contratos HTTP puros (request/response/error). Solo tipos de auth — los DTOs de entidades viven en `domain/types/`.
**Reglas**:
- `ApiError` es el shape de error que devuelve el backend (`{ error: string, details?: string }`).
- `LoginRequest`/`LoginResponse`/`RegisterRequest` describen el contrato de `/api/auth/*`.
- Los DTOs de entidades (`ClientDto`, `SaleDto`, etc.) NO van aquí — van en `src/domain/types/index.ts`.

**Snippet:**

```typescript
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  companyId: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  companyId?: string;
  role?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
```

### API_CONFIG + ENDPOINTS `[PRINCIPIO: single source of truth para URLs]`

**Ubicación**: `src/infrastructure/api/config.ts`
**Propósito**: única fuente de verdad para `BASE_URL` y rutas del backend.
**Reglas**:
- `BASE_URL` se lee de `import.meta.env.VITE_API_URL` con fallback a `http://localhost:5106`.
- `ENDPOINTS` agrupa todas las rutas por recurso. Los recursos con sub-paths tienen un objeto anidado (`AUTH.LOGIN`, `AUTH.REGISTER`).
- **Nunca** hardcodear URLs en services — siempre usar `` `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.X}` ``.

**Snippet:**

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5106",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
    },
    PRODUCTS: "/api/products",
    CATEGORIES: "/api/categories",
    COMPANIES: "/api/companies",
    USERS: "/api/users",
    SALES: "/api/sales",
    SUPPLIERS: "/api/suppliers",
    PURCHASES: "/api/purchases",
    EMPLOYEES: "/api/employees",
    ACCOUNTING_TRANSACTIONS: "/api/accounting-transactions",
    CLIENTS: "/api/clients",
    PROJECTS: "/api/projects",
    DASHBOARD: "/api/dashboard",
  },
};
```

### Service (canónico) `[PRINCIPIO]`

**Ubicación**: `src/infrastructure/api/{entity}Service.ts`
**Propósito**: agrupar llamadas HTTP de una entidad. Es un objeto con métodos, NO una clase.
**Reglas universales**:
- `export const {entity}Service = { async methodName(...) { ... } }`. Sin `class`, sin `new`.
- Todos los métodos son `async` y retornan `Promise<{tipo}>`.
- Listados siempre retornan `Promise<PagedResult<T>>`.
- Params de paginación: `pageNumber: number = 1, pageSize: number = 10`. Defaults en la signature.
- URL siempre vía `` `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.X}` `` + `?${new URLSearchParams(...)}` para queries.
- Body siempre via `JSON.stringify(data)`.
- Métodos que mutan (`create/update/delete`) usan POST/PUT/DELETE.
- Métodos que leen un solo item usan `fetchWithAuthJson<T>`.
- `delete` puede usar `fetchWithAuthJson<void>` (el wrapper devuelve `null as T` cuando hay 204).

#### Service "completo" — saleService `[PRINCIPIO + STACK: usa fetchWithAuthJson de este proyecto]`

**Ubicación**: `src/infrastructure/api/saleService.ts`
**Propósito**: el service más completo del proyecto. Cubre listados paginados, listados por status, get-by-id, create, update, transition de estado (`completeSale`), delete.

**Snippet:**

```typescript
import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson } from "./fetchWithAuth";
import type {
  PagedResult,
  SaleDto,
  CreateSaleRequest,
  UpdateSaleRequest,
} from "../../domain/types";

export const saleService = {
  async getSales(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<SaleDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}?${params}`,
    );
  },

  async getSalesByStatus(
    status: "Pending" | "Completed",
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<SaleDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/status/${status}?${params}`,
    );
  },

  async getPendingSales(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<SaleDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/pending?${params}`,
    );
  },

  async getSale(id: string): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}`,
    );
  },

  async createSale(data: CreateSaleRequest): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async updateSale(id: string, data: UpdateSaleRequest): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async completeSale(id: string): Promise<SaleDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}/complete`,
      {
        method: "PUT",
      },
    );
  },

  async deleteSale(id: string): Promise<void> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES}/${id}`,
      {
        method: "DELETE",
      },
    );
  },
};
```

#### Service "típico CRUD" — clientService `[PRINCIPIO + STACK]`

**Ubicación**: `src/infrastructure/api/clientService.ts`
**Propósito**: CRUD clásico sin operaciones especiales (sin transiciones de estado, sin listados por status).

**Snippet:**

```typescript
import { API_CONFIG } from "../api/config";
import { fetchWithAuthJson, fetchWithAuth } from "./fetchWithAuth";
import type { PagedResult, ClientDto, ClientRequest } from "../../domain/types";

export const clientService = {
  async getClients(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PagedResult<ClientDto>> {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}?${params}`,
    );
  },

  async getClientById(id: string): Promise<ClientDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`,
    );
  },

  async createClient(client: ClientRequest): Promise<ClientDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}`,
      {
        method: "POST",
        body: JSON.stringify(client),
      },
    );
  },

  async updateClient(id: string, client: ClientRequest): Promise<ClientDto> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(client),
      },
    );
  },

  async deleteClient(id: string): Promise<void> {
    await fetchWithAuth(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`,
      { method: "DELETE" },
    );
  },
};
```

> **Variante histórica**: `deleteClient` aquí usa `fetchWithAuth` (no `Json`) y luego `await`. Es indistinto de `fetchWithAuthJson` para este caso (ambos manejan 204). Elige uno y mantenlo. La regla es: si no necesitás el body, `fetchWithAuth`; si lo necesitás, `fetchWithAuthJson<T>`.

### authService `[PRINCIPIO + STACK]`

**Ubicación**: `src/infrastructure/api/authService.ts`
**Propósito**: el service más simple. Solo dos métodos POST (`login` y `register`).
**Reglas**:
- Misma forma canónica que los demás services (`export const authService = { ... }`, métodos `async`, retorno de `Promise<T>`).

**Snippet:**

```typescript
import { API_CONFIG } from "../api/config";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../api/types";
import { fetchWithAuthJson } from "./fetchWithAuth";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      },
    );
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    return fetchWithAuthJson(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
  },
};
```

> **Nota**: `authService` es el único service que re-escribe `headers: { "Content-Type": "application/json" }` en cada método, aunque `fetchWithAuth` ya lo setea por default. Es ruido, pero se mantiene por simetría (si quitás los headers de authService, hacelo en ambos métodos — no en uno solo). Ver §4.8.

---

## 2.2 Stores layer (Zustand) `[STACK: Zustand; PRINCIPIO en el shape universal items/loading/error/totalCount/pageCount]`

### Store canónico — clienteStore `[PRINCIPIO + STACK]`

**Ubicación**: `src/stores/{entity}Store.ts`
**Propósito**: state global de una entidad. Es la única capa autorizada para llamar a los services.
**Reglas universales**:
- Interface con shape: `items[]`, `loading`, `error`, `totalCount`, `pageCount` + métodos.
- Cada acción:
  1. `set({ loading: true, error: null })` al empezar.
  2. `try` → llamar service → `set({ ...success, loading: false })`.
  3. `catch` → `set({ loading: false, error: error instanceof Error ? err.message : "Fallback message" })`.
- Las **mutaciones** (`add`/`update`/`delete`) re-tiran el error (`throw error`) para que la UI pueda reaccionar (toast, cerrar modal, etc.).
- Los **lectores** (`fetch`, `getById`) NO re-tiran — el error queda en `state.error` y el componente lo muestra.
- `loading` y `error` son `boolean | null` planos. NO usar `enum`.
- El hook exportado se llama `use{Entity}Store` (no `use{Cliente}Store`).

**Snippet (clienteStore — canónico):**

```typescript
import { create } from "zustand";
import { clientService } from "../infrastructure/api/clientService";
import type { Client, ClientRequest } from "../domain/types";

interface ClienteStore {
  clientes: Client[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  pageCount: number;
  fetchClientes: (pageNumber?: number, pageSize?: number) => Promise<void>;
  getClienteById: (id: string) => Promise<Client | null>;
  addCliente: (cliente: ClientRequest) => Promise<Client>;
  updateCliente: (id: string, data: ClientRequest) => Promise<Client>;
  deleteCliente: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useClienteStore = create<ClienteStore>((set) => ({
  clientes: [],
  loading: false,
  error: null,
  totalCount: 0,
  pageCount: 0,

  fetchClientes: async (pageNumber = 1, pageSize = 10) => {
    set({ loading: true, error: null });
    try {
      const result = await clientService.getClients(pageNumber, pageSize);
      set({
        clientes: result.items,
        totalCount: result.rowCount,
        pageCount: result.pageCount,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch clients",
      });
    }
  },

  getClienteById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const client = await clientService.getClientById(id);
      set({ loading: false });
      return client;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch client",
      });
      return null;
    }
  },

  addCliente: async (cliente: ClientRequest) => {
    set({ loading: true, error: null });
    try {
      const newClient = await clientService.createClient(cliente);
      set((state) => ({
        clientes: [...state.clientes, newClient],
        totalCount: state.totalCount + 1,
        loading: false,
      }));
      return newClient;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to create client",
      });
      throw error;
    }
  },

  updateCliente: async (id: string, data: ClientRequest) => {
    set({ loading: true, error: null });
    try {
      const updatedClient = await clientService.updateClient(id, data);
      set((state) => ({
        clientes: state.clientes.map((c) =>
          c.id === id ? { ...c, ...updatedClient } : c,
        ),
        loading: false,
      }));
      return updatedClient;
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to update client",
      });
      throw error;
    }
  },

  deleteCliente: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await clientService.deleteClient(id);
      set((state) => ({
        clientes: state.clientes.filter((c) => c.id !== id),
        totalCount: state.totalCount - 1,
        loading: false,
      }));
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete client",
      });
      throw error;
    }
  },

  setError: (error: string | null) => set({ error }),
}));
```

> **Nota sobre nombres**: el archivo es `clienteStore.ts` (español) pero el hook exportado es `useClienteStore` (también español). El codebase NO es consistente aquí — algunas entidades son en español (`clienteStore`), otras en inglés (`authStore`). Mantener el nombre histórico. Para entidades NUEVAS, prefiero el inglés (`clientStore`) para alinearse con los services.

### authStore (caso especial: persistencia) `[STACK: Zustand persist middleware]`

**Ubicación**: `src/stores/authStore.ts`
**Propósito**: state de autenticación. Único store que persiste a `localStorage`/`sessionStorage`.
**Reglas**:
- Usa el middleware `persist` de Zustand.
- `authStorage` custom: lee de `localStorage` PRIMERO, si no hay de `sessionStorage`. Escribe según el flag `auth-remember`.
- `login(user, token, rememberMe = true)`: persiste el token y setea `auth-remember`.
- `logout()`: limpia `auth-remember` y todo el state.
- `hasHydrated`: flag que `ProtectedRoute` chequea para no flashear el login mientras se rehidrata.
- En `onRehydrateStorage`: si el token está vencido al rehidratar, llama a `logout()`.

**Snippet:**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTokenExpiry } from '../utils/jwt';

export interface User {
  username: string;
  email: string;
  fullName: string;
  role: string;
  companyId: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: User, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

const authStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name) || sessionStorage.getItem(name);
    return raw ? JSON.parse(raw) : null;
  },
  setItem: (name: string, value: unknown): void => {
    const remember = localStorage.getItem("auth-remember") === "true";
    (remember ? localStorage : sessionStorage).setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: (userData: User, token: string, rememberMe = true) => {
        localStorage.setItem("auth-remember", String(rememberMe));
        const expiresAt = getTokenExpiry(token);
        set({ user: userData, token, expiresAt, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem("auth-remember");
        set({ user: null, token: null, expiresAt: null, isAuthenticated: false });
      },

      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: authStorage,
      onRehydrateStorage: () => (state) => {
        if (state?.expiresAt && Date.now() > state.expiresAt) {
          state.logout();
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
```

> **Dual-storage trick**: el `authStorage` custom elige entre `localStorage` y `sessionStorage` basándose en el flag `auth-remember` que la acción `login()` setea vía `localStorage.setItem("auth-remember", String(rememberMe))`. `getItem` lee de local primero, después de session — así al rehidratar encuentra el token aunque venga de cualquiera de los dos. `setItem` mira el flag y persiste en el storage correspondiente. Si el usuario desmarca "Recordarme" en Login, el token queda en sessionStorage (se borra al cerrar la pestaña); si lo marca, persiste en localStorage (sobrevive al cierre).

> **`hasHydrated` + cleanup de tokens expirados**: `hasHydrated` arranca en `false` y se setea a `true` en `onRehydrateStorage` (después de leer del storage). `ProtectedRoute` usa este flag para no redirigir al login mientras se rehidrata. En el mismo callback, si el token guardado ya está expirado (`Date.now() > state.expiresAt`), se llama a `state.logout()` directamente — así un usuario que vuelve después de un día encuentra la app deslogueada, sin disparar un 401 que tendría que limpiar el state después.

---

## 2.3 Hooks genéricos (capa `hooks/`) `[PRINCIPIO]`

### useFilter (filtrado client-side genérico) `[PRINCIPIO]`

**Ubicación**: `src/hooks/useFilter.ts`
**Propósito**: hook genérico de filtrado client-side sobre un array. No conoce ninguna entidad.
**Reglas**:
- Genérico en `T`.
- Recibe `data: T[] | undefined` (tolerante a undefined), `searchTerm: string`, y `searchFields: (item: T) => string[]` (extension point crítico: el caller decide qué campos se buscan).
- `filter?: (item: T) => boolean` opcional para filtros adicionales programáticos.
- Retorna `T[]` filtrado, memoizado.
- Búsqueda: lowercase + `includes` por cada field.

**Snippet:**

```typescript
import { useMemo } from "react";

interface UseFilterOptions<T> {
  data: T[] | undefined;
  searchTerm: string;
  searchFields: (item: T) => string[];
  filter?: (item: T) => boolean;
}

export function useFilter<T>({
  data,
  searchTerm,
  searchFields,
  filter,
}: UseFilterOptions<T>): T[] {
  return useMemo(() => {
    return (data ?? []).filter((item) => {
      const matchSearch = searchFields(item)
        .filter(Boolean)
        .some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      return matchSearch && (filter ? filter(item) : true);
    });
  }, [data, searchTerm, filter, searchFields]);
}
```

### usePagination (paginación client-side) `[PRINCIPIO]`

**Ubicación**: `src/hooks/usePagination.ts`
**Propósito**: state + acciones de paginación. NO conoce el total — eso lo recibe `getInfo(total)`.
**Reglas**:
- Mantiene `pageNumber` (default 1) y `pageSize` (default 10).
- `changePageSize` resetea a página 1 (evita quedar en una página inexistente).
- `nextPage`/`prevPage` clamped a 1.
- `getInfo(total)` delega el cálculo a `utils/pagination.ts`.

**Snippet:**

```typescript
import { useState, useCallback } from "react";
import { getPaginationInfo, type PaginationInfo } from "../utils/pagination";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function usePagination(options?: UsePaginationOptions) {
  const [pageNumber, setPageNumber] = useState(options?.initialPage || 1);
  const [pageSize, setPageSize] = useState(options?.initialPageSize || 10);

  const goToPage = useCallback((newPage: number) => {
    setPageNumber(newPage);
  }, []);

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const nextPage = useCallback(() => {
    setPageNumber((p) => p + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);

  const getInfo = useCallback(
    (total: number): PaginationInfo => {
      return getPaginationInfo(total, pageNumber, pageSize);
    },
    [pageNumber, pageSize],
  );

  return {
    pageNumber,
    pageSize,
    goToPage,
    changePageSize,
    nextPage,
    prevPage,
    getInfo,
  };
}
```

### useCrudForm (formulario declarativo) `[PRINCIPIO]`

**Ubicación**: `src/hooks/useCrudForm.ts`
**Propósito**: hook genérico para formularios CRUD con validación declarativa.
**Reglas**:
- Recibe `{ fields: FormField[], defaultValues: T, onCreate, onUpdate, onSuccess?, mapEntityToForm? }`.
- Los ids son **strings** en toda la app (`editingId: string | null`, `handleEdit(entity, id: string)`, `onUpdate(id: string, data)`). El backend usa GUIDs.
- `FormField` es declarativo: `name`, `label`, `type`, `required`, `placeholder`, `options`, `min/max/step`, `accept`, `validate?`, `showOnEdit?`, `showOnCreate?`.
- **Props de presentación** (las consume `DynamicFormFields`, no el hook): `section` agrupa en secciones, `span` (1-6) ocupa columnas de la grilla, `hint` es texto de ayuda, `readonly` deshabilita el control, `sidebar` mueve el campo a la columna derecha.
- **Validators built-in**:
  - `email` → regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
  - `number` → respeta `min`, `max`, y `step` (calcula `step` con decimales).
  - `file` → respeta `accept` (con wildcards tipo `image/*`).
  - Cualquier string → respeta `minLength`/`maxLength`.
- **`isDirty`**: `true` cuando `values` difiere de los valores con los que se abrió el form. Lo consume el `Modal` para pintar el punto de estado del footer. Se recalcula con `useMemo` sobre `values` + `initialValues`.
- **`mapEntityToForm` NO es opcional en la práctica** cuando el DTO y el form no calzan 1:1. Ver "Cuándo `mapEntityToForm` es obligatorio" abajo.
- **Mutaciones re-tiran** (`throw error`); el catch interno setea `submitError` y NO re-tira — la UI ya tiene el error en estado.
- `handleSubmit` ejecuta validación, llama `onCreate` o `onUpdate` según `editingId`, resetea el form al éxito, invoca `onSuccess`.

#### Cuándo `mapEntityToForm` es obligatorio

`pickKeys` (el mapper por defecto) **copia las claves superficialmente**: `dict[key] = source[key]`. Eso es correcto sólo cuando el DTO y el form tienen la misma forma. Se rompe en dos casos concretos:

1. **El DTO trae un array.** `pickKeys` copia la **referencia**, no el contenido. El form editaría el array del store en vivo. Hay que clonar:
   ```typescript
   // Compras.tsx — el DTO trae items[]
   mapEntityToForm: (entity) => ({
     ...,
     items: purchase.items.map((item) => ({ ...item })),
   })
   ```
2. **El DTO trae `null`/`undefined`.** El form renderiza inputs controlados: un `undefined` produce un input sin valor y un `null` no es `""`. Peor: `isDirty` compara `values[key] !== initialValues[key]`, así que `null` contra `""` marca el form **sucio al abrirse**. Hay que normalizar:
   ```typescript
   // Inventario.tsx — el DTO trae categoryId null y números sin defecto
   mapEntityToForm: (entity) => ({
     name: (entity.name as string) ?? "",
     categoryId: (entity.categoryId as string | null) ?? "",
     stock: (entity.stock as number) ?? 0,
     isActive: (entity.isActive as boolean) ?? true,
   })
   ```

**Criterio**: si `defaultValues` tiene un campo que el DTO puede devolver vacío, o un campo que es una colección, el mapper custom NO es opcional.

**Snippet (completo — 289 líneas, verbatim de `src/hooks/useCrudForm.ts`):**

```typescript
import { useState, useCallback, useMemo } from "react";

// ─── Field definition ────────────────────────────────────────────────
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "select"
    | "combobox"
    | "date"
    | "file"
    | "checkbox"
    | "textarea"
    | "url";
  required?: boolean;
  placeholder?: string;
  /** Options for <select> and combobox fields */
  options?: {
    value: string;
    label: string;
    description?: string;
    keywords?: string[];
  }[];
  /** Only show when editing */
  showOnEdit?: boolean;
  /** Only show when creating */
  showOnCreate?: boolean;
  // Passthrough to <input>
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  step?: number;
  /** Accepted file extensions (default: "image/*") */
  accept?: string;
  /** Custom validation: return error message or undefined */
  validate?: (
    value: unknown,
    values: Record<string, unknown>,
  ) => string | undefined;

  // ─── Presentation (optional) ──────────────────────────────────────
  /** Section this field belongs to. Fields with no section share the first group. */
  section?: string;
  /** How many of the 6 section columns the field occupies (6 = full width). */
  span?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Helper text rendered under the control. */
  hint?: string;
  /** Renders the control as disabled (e.g. a server-generated code). */
  readonly?: boolean;
  /** Renders the field in the right sidebar instead of the main grid. */
  sidebar?: boolean;
}

// ─── Config ──────────────────────────────────────────────────────────
export interface CrudFormConfig<T extends Record<string, unknown>> {
  fields: FormField[];
  defaultValues: T;
  onCreate: (data: T) => Promise<unknown>;
  onUpdate: (id: string, data: T) => Promise<unknown>;
  /** Called after successful create/update */
  onSuccess?: () => void;
  /** Custom mapper: entity → form values. Default picks keys from defaultValues */
  mapEntityToForm?: (entity: Record<string, unknown>) => T;
}

// ─── Return ──────────────────────────────────────────────────────────
export interface CrudFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  submitError: string | null;
  editingId: string | null;
  /** True when the current values differ from the ones the form was opened with. */
  isDirty: boolean;
  setFieldValue: (name: string, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (entity: object, id: string) => void;
  reset: () => void;
}

// ─── Validators ─────────────────────────────────────────────────────
type Validator = (
  field: FormField,
  value: unknown,
  values: Record<string, unknown>,
) => string | undefined;

const typeValidators: Partial<Record<FormField["type"], Validator>> = {
  email: (v) =>
    typeof v === "string" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "Email inválido"
      : undefined,

  number: (f, v) => {
    if (typeof v !== "number" || isNaN(v)) return;
    if (f.min !== undefined && v < f.min)
      return `${f.label} debe ser mayor o igual a ${f.min}`;
    if (f.max !== undefined && v > f.max)
      return `${f.label} debe ser menor o igual a ${f.max}`;
    if (f.step !== undefined && f.step > 0) {
      const offset = v - (f.min ?? 0);
      const decimals = (f.step.toString().split('.')[1] || '').length;
      const multiplier = Math.pow(10, decimals);
      const scaledOffset = Math.round(offset * multiplier);
      const scaledStep = Math.round(f.step * multiplier);
      if (scaledOffset % scaledStep !== 0)
        return `${f.label} debe ser múltiplo de ${f.step}`;
    }
  },

  file: (f, v) => {
    if (
      typeof v !== "string" ||
      !v.startsWith("data:") ||
      !f.accept ||
      f.accept === "*"
    )
      return;
    const mime = v.split(";")[0].split(":")[1];
    const ok = f.accept
      .split(",")
      .map((a) => a.trim())
      .some((a) =>
        a.endsWith("/*") ? mime.startsWith(a.replace("/*", "")) : a === mime,
      );
    if (!ok) return `Formato de archivo no válido. Permitidos: ${f.accept}`;
  },
};

function validateField(
  field: FormField,
  value: unknown,
  values: Record<string, unknown>,
): string | undefined {
  // 1. Required
  if (
    field.required &&
    (value === "" || value === null || value === undefined)
  ) {
    return `${field.label} es requerido`;
  }
  // 2. Type-specific format/range (email, number min/max/step, file accept)
  const typeErr = typeValidators[field.type]?.(field, value, values);
  if (typeErr !== undefined) return typeErr;
  // 3. String constraints (apply to any string value)
  if (typeof value === "string") {
    if (field.minLength && value.length < field.minLength)
      return `${field.label} debe tener al menos ${field.minLength} caracteres`;
    if (field.maxLength && value.length > field.maxLength)
      return `${field.label} debe tener máximo ${field.maxLength} caracteres`;
  }
  // 4. Custom
  return field.validate?.(value, values);
}

function validateForm<T extends Record<string, unknown>>(
  fields: FormField[],
  values: T,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const err = validateField(field, values[field.name], values);
    if (err) errors[field.name] = err;
  }
  return errors;
}

function pickKeys<T extends Record<string, unknown>>(
  template: T,
  source: Record<string, unknown>,
): T {
  const result = { ...template } as T;
  const dict = result as Record<string, unknown>;
  for (const key of Object.keys(template)) {
    if (key in source) dict[key] = source[key];
  }
  return result;
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useCrudForm<T extends Record<string, unknown>>(
  config: CrudFormConfig<T>,
): CrudFormReturn<T> {
  const {
    fields,
    defaultValues,
    onCreate,
    onUpdate,
    onSuccess,
    mapEntityToForm,
  } = config;
  const [values, setValues] = useState<T>({ ...defaultValues });
  const [initialValues, setInitialValues] = useState<T>({ ...defaultValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validateForm(fields, values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        if (editingId !== null) {
          await onUpdate(editingId, values);
        } else {
          await onCreate(values);
        }
        setEditingId(null);
        setErrors({});
        setValues({ ...defaultValues });
        setInitialValues({ ...defaultValues });
        onSuccess?.();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error al guardar";
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fields, values, editingId, defaultValues, onSuccess, onUpdate, onCreate],
  );

  const handleEdit = useCallback(
    (entity: object, id: string) => {
      const dict = entity as Record<string, unknown>;
      const mapped = mapEntityToForm
        ? mapEntityToForm(dict)
        : pickKeys(defaultValues, dict);
      setValues(mapped);
      setInitialValues(mapped);
      setEditingId(id);
      setErrors({});
      setSubmitError(null);
    },
    [defaultValues, mapEntityToForm],
  );

  const reset = useCallback(() => {
    setValues({ ...defaultValues });
    setInitialValues({ ...defaultValues });
    setEditingId(null);
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  }, [defaultValues]);

  const isDirty = useMemo(() => {
    const current = values as Record<string, unknown>;
    const initial = initialValues as Record<string, unknown>;
    const keys = new Set([...Object.keys(initial), ...Object.keys(current)]);
    for (const key of keys) {
      if (current[key] !== initial[key]) return true;
    }
    return false;
  }, [values, initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    submitError,
    editingId,
    isDirty,
    setFieldValue,
    handleSubmit,
    handleEdit,
    reset,
  };
}
```

### useDeleteConfirm (confirmación de borrado) `[PRINCIPIO]`

**Ubicación**: `src/hooks/useDeleteConfirm.ts`
**Propósito**: hook genérico que maneja el estado del modal de confirmación de borrado y el toast de resultado. Existe para que ninguna página repita el trío `deleteId` + `showDeleteConfirm` + `confirmDelete`.
**Reglas**:
- Recibe `{ onDelete: (id: string) => Promise<void>, successMessage: string }`. El mensaje de éxito lo pasa la página porque es user-facing y va por i18n.
- `handleDelete(id)` guarda el id y abre el modal. `cancelDelete()` cierra y **limpia el id**. `confirmDelete()` borra y avisa por toast.
- **`deleteId` NO se limpia en `handleDelete`**: el borrado en vuelo no puede pisar una selección hecha después de que arrancó. Se limpia en `cancelDelete`.
- El error del borrado se muestra como toast `error` con el mensaje del `Error`; si no hay mensaje, cae en `"Error al eliminar"`.
- **No se fusiona dentro de `useCrudForm`**: el borrado no es parte del ciclo de vida del formulario (no comparte `values`, `errors` ni `editingId`). Ver `odd/tasks/volterp-frontend-style-skill.md`.
- La página renderiza el `<ConfirmModal>` con `showDeleteConfirm`, `deleteId` y las acciones del hook.

**Snippet (completo — 59 líneas):**

```typescript
import { useCallback, useState } from "react";
import { useUIStore } from "../stores/uiStore";

export interface DeleteConfirmConfig {
  onDelete: (id: string) => Promise<void>;
  successMessage: string;
}

export interface DeleteConfirmReturn {
  showDeleteConfirm: boolean;
  deleteId: string | null;
  handleDelete: (id: string) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;
}

const DEFAULT_ERROR_MESSAGE = "Error al eliminar";

export function useDeleteConfirm({
  onDelete,
  successMessage,
}: DeleteConfirmConfig): DeleteConfirmReturn {
  const { addToast } = useUIStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  }, []);

  // deleteId is cleared by cancelDelete, not here: a delete still in flight
  // must not wipe a selection made after it started.
  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;

    try {
      await onDelete(deleteId);
      addToast(successMessage, "success");
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : DEFAULT_ERROR_MESSAGE;
      addToast(message, "error");
    }
  }, [deleteId, onDelete, successMessage, addToast]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    setDeleteId(null);
  }, []);

  return {
    showDeleteConfirm,
    deleteId,
    handleDelete,
    confirmDelete,
    cancelDelete,
  };
}
```

### useColecciones (colecciones completas para el POS) `[PRINCIPIO: el POS filtra en memoria, no contra el servidor]`

**Ubicación**: `src/hooks/useColecciones.ts`
**Propósito**: cargar el listado completo de clientes, productos y proveedores para las pantallas que filtran y paginan en memoria.
**Reglas**:
- **Nació para el POS**: el POS y el editor de líneas de compra necesitan el listado entero, no la página del módulo. Por eso piden `PAGE_SIZE = 100` en vez de `ITEMS_PER_PAGE`.
- **Compras la usa por la misma razón**: el form de compra referencia proveedores y el editor de líneas referencia productos.
- Un hook por colección (`useClientes`, `useProductos`, `useProveedores`): cada uno dispara su `fetch` una vez al montar y devuelve el array del store.
- No tocar los stores: los `fetch*` ya aceptan cualquier `pageSize`.

**Snippet:**

```typescript
const PAGE_SIZE = 100;

export function useClientes() {
  const { clientes, fetchClientes } = useClienteStore();
  useEffect(() => {
    fetchClientes(1, PAGE_SIZE);
  }, [fetchClientes]);
  return clientes;
}

export function useProductos() {
  const { productos, fetchProductos } = useProductoStore();
  useEffect(() => {
    fetchProductos(1, PAGE_SIZE);
  }, [fetchProductos]);
  return productos;
}

export function useProveedores() {
  const { proveedores, fetchProveedores } = useProveedorStore();
  useEffect(() => {
    fetchProveedores(1, PAGE_SIZE);
  }, [fetchProveedores]);
  return proveedores;
}
```

### usePermission (permisos por rol) `[PRINCIPIO + STACK: la MATRIZ_PERMISOS es dominio de este proyecto]`

**Ubicación**: `src/hooks/usePermission.ts`
**Propósito**: hook que consulta la matriz de permisos según el rol del usuario actual.
**Reglas**:
- Lee `user.role` de `useAuthStore()`.
- Normaliza el rol a lowercase (`"superadmin"` → `Rol.SUPER_ADMIN`).
- `isAdmin` = `userRole === Rol.SUPER_ADMIN`. Nota: este nombre es engañoso — debería ser `isSuperAdmin`. **Decisión intencional**: se mantiene por compatibilidad con todos los call sites.
- Expone `hasPermission(modulo, permiso)`, `canRead(modulo)`, `canWrite(modulo)`, `canDelete(modulo)`, `getModulePermissions(modulo)`.

**Snippet:**

```typescript
import { useAuthStore } from "../stores/authStore";
import {
  MATRIZ_PERMISOS,
  type Modulo,
  type PermisosModulo,
} from "../domain/constants/permisos";
import { Rol, Permiso } from "../domain/constants/roles";

interface UsePermissionResult {
  hasPermission: (modulo: Modulo, permiso: Permiso) => boolean;
  canRead: (modulo: Modulo) => boolean;
  canWrite: (modulo: Modulo) => boolean;
  canDelete: (modulo: Modulo) => boolean;
  getModulePermissions: (modulo: Modulo) => PermisosModulo | undefined;
  isAdmin: boolean;
  userRole: Rol | null;
}

export function usePermission(): UsePermissionResult {
  const { user } = useAuthStore();

  const userRole = user?.role ? (user.role.toLowerCase() as Rol) : null;
  const isAdmin = userRole === Rol.SUPER_ADMIN;

  const hasPermission = (modulo: Modulo, permiso: Permiso): boolean => {
    if (!userRole) return false;
    return MATRIZ_PERMISOS[userRole]?.[modulo]?.[permiso] ?? false;
  };

  const canRead = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.READ);
  const canWrite = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.WRITE);
  const canDelete = (modulo: Modulo): boolean =>
    hasPermission(modulo, Permiso.DELETE);

  const getModulePermissions = (modulo: Modulo): PermisosModulo | undefined => {
    if (!userRole) return undefined;
    return MATRIZ_PERMISOS[userRole]?.[modulo];
  };

  return {
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    getModulePermissions,
    isAdmin,
    userRole,
  };
}
```

### useTokenExpiry (auto-logout proactivo) `[PRINCIPIO]`

**Ubicación**: `src/hooks/useTokenExpiry.ts`
**Propósito**: monta timer proactivo + listener reactivo para auto-logout cuando el JWT expira.
**Reglas**:
- Montar **una sola vez** en `Layout.tsx` para que cubra todas las rutas protegidas.
- Calcula `msUntilExpiry(token)`; si <= 0 (token expirado restaurado de storage), llama `logout()` + navega a `/login`.
- Setea un `setTimeout` que dispara exactamente al expirar.
- Escucha el evento `auth:session-expired` (disparado por `fetchWithAuth` cuando llega un 401) y cancela el timer.
- En cleanup: cancela timer y remueve listener.

**Snippet:**

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { msUntilExpiry } from '../utils/jwt';

/**
 * Mounts a proactive timer that auto-logouts the user when the JWT expires.
 * Also listens for the reactive 'auth:session-expired' event fired by fetchWithAuth
 * when a 401 is intercepted.
 *
 * Mount this hook ONCE in Layout.tsx so it's active for all protected routes.
 */
export function useTokenExpiry(): void {
  const { token, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const ms = msUntilExpiry(token);

    // Token already expired (e.g. restored from localStorage after long inactivity)
    if (ms <= 0) {
      logout();
      navigate('/login', { state: { expired: true } });
      return;
    }

    // Proactive timer — fires exactly when the token expires
    const timerId = setTimeout(() => {
      logout();
      navigate('/login', { state: { expired: true } });
    }, ms);

    // Reactive listener — fired by fetchWithAuth on 401
    const handleExpired = () => {
      clearTimeout(timerId);
      navigate('/login', { state: { expired: true } });
    };

    window.addEventListener('auth:session-expired', handleExpired);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('auth:session-expired', handleExpired);
    };
  }, [token, isAuthenticated, logout, navigate, t]);
}
```

---

## 2.4 Application hooks (`application/hooks/`) `[STACK: hooks específicos del dominio ventas/RRHH; el patrón "un hook por caso de uso" es PRINCIPIO]`

### Convención

**Ubicación**: `src/application/hooks/use{UseCase}.ts`
**Propósito**: hook que orquesta stores + services para un caso de uso específico.
**Reglas**:
- Un hook por caso de uso, y **sólo si tiene call site** (un hook sin consumidor es código muerto: ver "Hooks retirados" más abajo). Ejemplos vivos: `useNominaCalculator`, `useEmpleadoForm`, `useDashboard`.
- Recibe `useStoreX()` y/o servicios, y devuelve una API cohesiva para la vista (`state + actions`).
- Puede tener state local (`useState`) propio si es state ephemeral del caso de uso (no global).
- Dispara toasts vía `useUIStore().addToast(t("clave"), "variant")`.

### Hooks retirados: `useCarrito`, `useVentaForm`, `useClienteSelector` `[STACK: dominio ventas]`

> **Retirados el 2026-11-06** en `c7881d8 chore: remove the unused domain hooks` (387 líneas).
> El POS de Ventas se reconstruyó como **componentes** en `src/pages/Ventas/components/` (`NuevaVenta`, `Carrito`, `ResumenVenta`, `ClienteSelector`, `SelectorProducto`): el carrito dejó de ser un hook porque su estado es efímero y pertenece al componente que lo posee. Ninguno de los tres hooks tenía call site.

**Regla que dejó:** antes de escribir un hook en `application/hooks/`, comprobar que hay un call site. Un hook sin consumidor es código muerto con tests.

---

## 2.5 UI components (`components/UI/`) `[PRINCIPIO: primitivos presentacionales; STACK en la implementación CSS Modules]`

### Table<T> (genérico) `[PRINCIPIO]`

**Ubicación**: `src/components/UI/Table.tsx`
**Propósito**: tabla genérica tipada con render custom por celda.
**Reglas**:
- Genérico en `T extends { id: TableId }` donde `TableId = number | string`.
- `columns: Column<T>[]` con `{ key, header?, render? }`.
- Si se pasa `onEdit` o `onDelete`, agrega automáticamente una columna "Acciones" con `<ActionButtons>`.
- La cabecera de la columna de acciones se localiza con `t("common.actions")`.

**Snippet:**

```typescript
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Table.module.css';
import { ActionButtons } from './ActionButtons';

type TableId = number | string;

interface Column<T> {
  key: keyof T | string;
  header?: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T extends { id: TableId }> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (id: T['id']) => void;
}

export function Table<T extends { id: TableId }>({ data, columns, onEdit, onDelete }: TableProps<T>) {
  const { t } = useTranslation();
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>{col.header || ''}</th>
            ))}
            {(onEdit || onDelete) && <th>{t("common.actions")}</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((col) => (
                <td key={`${item.id}-${String(col.key)}`}>
                  {col.render ? col.render(item) : String(item[col.key as keyof T] || '')}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  <ActionButtons 
                    onEdit={onEdit ? () => onEdit(item) : undefined}
                    onDelete={onDelete ? () => onDelete(item.id) : undefined}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Pagination `[PRINCIPIO]`

**Ubicación**: `src/components/UI/Pagination.tsx`
**Propósito**: paginador visual con ellipsis.
**Reglas**:
- Recibe `pagination: PaginationInfo` (calculado por `usePagination.getInfo(total)`) y `onPageChange`.
- **Si `totalPages <= 1` retorna `null`** (no muestra controles para una sola página).
- Las páginas se computan con `getPageNumbers(page, totalPages)` que devuelve `-1` para los gaps (ellipsis).
- 4 botones de flecha: primera, anterior, siguiente, última.
- Headers `title` en español (decisión intencional — la página es español-first).

**Snippet:**

```typescript
import { getPageNumbers, type PaginationInfo } from "../../utils/pagination";
import styles from "./Pagination.module.css";

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, hasPrev, hasNext, total } = pagination;

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        Mostrando {(page - 1) * pagination.pageSize + 1} -{" "}
        {Math.min(page * pagination.pageSize, total)} de {total}
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          title="Primera página"
        >
          <svg viewBox="0 0 24 24"><polyline points="11 17 6 12 11 7" /><polyline points="18 17 13 12 18 7" /></svg>
        </button>

        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev}
          title="Página anterior"
        >
          <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>

        {pages.map((p: number, idx: number) =>
          p === -1 ? (
            <span key={`dots-${idx}`} className={styles.dots}>
              ···
            </span>
          ) : (
            <button
              key={p}
              className={`${styles.btn} ${p === page ? styles.active : ""}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          ),
        )}

        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          title="Siguiente página"
        >
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
        </button>

        <button
          className={`${styles.btn} ${styles.arrow}`}
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          title="Última página"
        >
          <svg viewBox="0 0 24 24"><polyline points="13 17 18 12 13 7" /><polyline points="6 17 11 12 6 7" /></svg>
        </button>
      </div>
    </div>
  );
}
```

### Modal (form shell: header + body + footer) `[PRINCIPIO]`

**Ubicación**: `src/components/UI/Modal.tsx`
**Propósito**: modal genérico con dos modos: con `onSubmit` (form) o sin (vista). Es el **shell de formularios** compartido por todas las páginas CRUD.
**Reglas**:
- Renderiza con `createPortal(..., document.body)` — escapa del overflow del padre.
- **Body scroll lock**: `document.body.style.overflow = 'hidden'` cuando está abierto.
- **Escape listener**: cierra al apretar `Escape`.
- Click en overlay → `onClose()`. Click en modal → `stopPropagation()`.
- **Estructura en tres zonas**: `header` (icono + título + badge + subtítulo + botón X), `body` (los children) y `footer` (estado + acciones). El footer se dibuja igual con y sin `onSubmit`.
- **Props del shell**: `icon` (tile ⚡), `subtitle`, `badge`, `closeLabel`, `footerStatus`, `dirty`, `submitVariant` (`'primary' | 'dark'`), `footerActions`, `size` (`'md' | 'lg'`).
- **`size="lg"`** para formularios de dos columnas (los que usan `span` y `sidebar` de `FormField`); `'md'` para los simples.
- **`footerStatus` + `dirty`**: el estado del pie viene del form — `footerStatus={form.isDirty ? t("common.unsavedChanges") : t("common.noPendingChanges")}` y `dirty={form.isDirty}`. El punto se pinta distinto cuando hay cambios sin guardar.
- **Accesibilidad**: `role="dialog"`, `aria-modal="true"`, `aria-label={title}`.
- Si recibe `onSubmit`, envuelve children en `<form onSubmit={onSubmit}>` con botones submit/cancel. Si no, es vista libre.

**Snippet (completo — 150 líneas, verbatim de `src/components/UI/Modal.tsx`):**

```typescript
import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  closeLabel?: string;
  icon?: ReactNode;
  subtitle?: string;
  badge?: ReactNode;
  footerStatus?: ReactNode;
  /** Renders the accent dot next to the footer status. */
  dirty?: boolean;
  submitVariant?: 'primary' | 'dark';
  /** Extra actions rendered next to the cancel button. */
  footerActions?: ReactNode;
  /** 'md' fits simple forms, 'lg' fits two-column forms. */
  size?: 'md' | 'lg';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Crear',
  cancelLabel = 'Cancelar',
  closeLabel = 'Close',
  icon,
  subtitle,
  badge,
  footerStatus,
  dirty = false,
  submitVariant = 'primary',
  footerActions,
  size = 'md',
}: ModalProps) {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shell = (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${size === 'lg' ? styles.modalLg : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.header}>
          {icon && <span className={styles.iconSlot}>{icon}</span>}
          <div className={styles.heading}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>{title}</h3>
              {badge}
            </div>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        {onSubmit ? (
          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.body}>{children}</div>
            <footer className={styles.actions}>
              {footerStatus && (
                <span className={styles.footerStatus}>
                  <span
                    className={`${styles.statusDot} ${dirty ? styles.statusDotDirty : ""}`}
                  />
                  {footerStatus}
                </span>
              )}
              <div className={styles.footerButtons}>
                <Button variant="ghost" type="button" onClick={onClose}>
                  {cancelLabel}
                </Button>
                {footerActions}
                <Button
                  type="submit"
                  variant={submitVariant}
                  accent={submitVariant === 'dark'}
                >
                  {submitLabel}
                </Button>
              </div>
            </footer>
          </form>
        ) : (
          <>
            <div className={styles.body}>{children}</div>
            <footer className={styles.actions}>
              {footerStatus && (
                <span className={styles.footerStatus}>
                  <span
                    className={`${styles.statusDot} ${dirty ? styles.statusDotDirty : ""}`}
                  />
                  {footerStatus}
                </span>
              )}
              <div className={styles.footerButtons}>
                <Button variant="ghost" type="button" onClick={onClose}>
                  {cancelLabel}
                </Button>
                {footerActions}
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(shell, document.body);
}
```

### ConfirmModal (confirmación destructiva) `[PRINCIPIO]`

**Ubicación**: `src/components/UI/ConfirmModal.tsx`
**Propósito**: modal de confirmación con variantes (danger, warning, success, info, error) e icon de lucide-react.
**Reglas**:
- Igual body scroll lock + escape que `Modal`, pero `Escape` llama `onCancel` (no `onClose`).
- Mapea variant → icon (`Trash2`, `HelpCircle`, `CheckCircle`, `Info`, `XCircle`). `danger` usa `Trash2`, no un triángulo: la acción es borrar.
- `BUTTON_VARIANT` traduce la variant del modal al variant del `<Button>` (`danger` o `primary`).
- **`context`**: bloque opcional que dice **qué** se va a eliminar (`{ title, subtitle?, amount? }`). Sin esto el modal dice "Eliminar" y el usuario tiene que inferir el objeto. Con `context`, el modal nombra el ítem y su monto.
- `role="alertdialog"` + `aria-modal="true"` + `aria-label={title}`.
- El botón de cancelar es `ghost`; el de confirmar lleva el variant mapeado.

**Snippet (completo — 127 líneas, verbatim de `src/components/UI/ConfirmModal.tsx`):**

```typescript
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, HelpCircle, Info, Trash2, XCircle } from 'lucide-react';
import { Button } from './Button';
import styles from './ConfirmModal.module.css';

interface ConfirmContext {
  title: string;
  subtitle?: string;
  amount?: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'error';
  subtitle?: string;
  context?: ConfirmContext;
}

const VARIANT_ICONS = {
  danger: Trash2,
  warning: HelpCircle,
  success: CheckCircle,
  info: Info,
  error: XCircle,
} as const;

const BUTTON_VARIANT: Record<string, 'danger' | 'primary'> = {
  danger: 'danger',
  error: 'danger',
  warning: 'primary',
  success: 'primary',
  info: 'primary',
};

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  subtitle,
  context,
}: ConfirmModalProps) {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const IconComponent = VARIANT_ICONS[variant] || HelpCircle;

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
      >
        <span className={`${styles.iconCircle} ${styles[variant]}`}>
          <IconComponent size={22} strokeWidth={1.9} />
        </span>

        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        <p className={styles.message}>{message}</p>

        {context && (
          <div className={styles.context} data-testid="confirm-context">
            <div className={styles.contextInfo}>
              <p className={styles.contextTitle}>{context.title}</p>
              {context.subtitle && (
                <p className={styles.contextSubtitle}>{context.subtitle}</p>
              )}
            </div>
            {context.amount && (
              <span className={styles.contextAmount}>{context.amount}</span>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="ghost" type="button" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={BUTTON_VARIANT[variant] || 'primary'}
            onClick={() => {
              onConfirm();
              onCancel();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
```

### Button `[PRINCIPIO]`

**Ubicación**: `src/components/UI/Button.tsx`
**Propósito**: botón con variantes (`primary | secondary | danger`) y size (`small`).
**Reglas**:
- Extiende `ButtonHTMLAttributes<HTMLButtonElement>` → podés pasar cualquier prop nativa (`onClick`, `disabled`, `type`).
- Classnames se concatenan con filtro de vacíos.

**Snippet:**

```typescript
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small';
  children: ReactNode;
}

export function Button({ variant = 'primary', size, className, children, ...props }: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    size ? styles[size] : '',
    className || ''
  ].filter(Boolean).join(' ');
  
  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
}
```

### ActionButtons (botones de fila de tabla) `[PRINCIPIO]`

**Ubicación**: `src/components/UI/ActionButtons.tsx`
**Propósito**: grupo de botones (toggle/edit/delete) con iconos SVG inline. Se usa dentro de la columna "Acciones" de `<Table>`.

**Snippet (representativo):**

```typescript
import styles from './ActionButtons.module.css';

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
}

export function ActionButtons({ onEdit, onDelete, onToggle }: ActionButtonsProps) {
  return (
    <div className={styles.actions}>
      {onToggle && (
        <button className={`${styles.btn} ${styles.toggle}`} onClick={onToggle} title="Activar/Desactivar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
            <line x1="12" y1="2" x2="12" y2="12" />
          </svg>
        </button>
      )}
      {onEdit && (
        <button className={`${styles.btn} ${styles.edit}`} onClick={onEdit} title="Editar">
          <svg /* … edit icon … */ />
        </button>
      )}
      {onDelete && (
        <button className={`${styles.btn} ${styles.delete}`} onClick={onDelete} title="Eliminar">
          <svg /* … trash icon … */ />
        </button>
      )}
    </div>
  );
}
```

### SearchInput `[PRINCIPIO]`

**Ubicación**: `src/components/UI/SearchInput.tsx`
**Propósito**: input de búsqueda con icono, botón clear y soporte `onEnter`.
**Reglas**:
- Props: `value`, `onChange(value)`, `placeholder?`, `onEnter?`, `className?`, `autoFocus?`, `width?` (default `'240px'`), `showIcon?` (default `true`).
- Si `value` está vacío, no muestra el botón clear.
- `onEnter` se dispara con `Enter` si está provisto.

**Snippet (representativo):**

```typescript
import { type ChangeEvent, type KeyboardEvent } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  className?: string;
  autoFocus?: boolean;
  width?: string;
  showIcon?: boolean;
}

export function SearchInput({ 
  value, onChange, placeholder = 'Buscar...', onEnter,
  className = '', autoFocus = false, width = '240px', showIcon = true
}: SearchInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) onEnter();
  };

  return (
    <div className={`${styles.container} ${className}`} style={{ width }}>
      {showIcon && <svg className={styles.icon} /* search icon */ />}
      <input
        type="text"
        className={`${styles.input} ${!showIcon ? styles.noIcon : ''}`}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {value && (
        <button className={styles.clear} onClick={() => onChange('')} type="button" title="Limpiar búsqueda">
          {/* × icon */}
        </button>
      )}
    </div>
  );
}
```

### SearchableSelect (referencia buscable a otra entidad) `[PRINCIPIO]`

**Ubicación**: `src/components/UI/SearchableSelect.tsx`
**Propósito**: input de texto con lista desplegable, para los campos que **referencian otra entidad** (proveedor, producto) donde un `<select>` no escala: con 100 proveedores no se puede elegir a ojo.
**Reglas**:
- `options: { value: string; label: string; description?: string; keywords?: string[] }[]`. `description` es la línea secundaria (típicamente el `code` del negocio). `keywords` son términos **buscables pero no renderizados** (ej. el código del cliente: se busca por código pero no se muestra en la lista).
- **El valor inicial se muestra**: el input arranca con el `label` de la opción seleccionada, no vacío.
- **El texto sólo se resincroniza con un valor externo no vacío**: mientras el usuario escribe el componente reporta `onChange("", texto)`; si el padre devuelve ese `""` como `value`, el texto que acaba de escribir NO se borra.
- **Filtra con `normalizeSearch`** (`src/utils/normalizeSearch.ts`): ignora acentos y mayúsculas, sobre `label`, `description` y `keywords`. El mismo helper usan `useFilter` y el buscador del header.
- **Si el texto es sólo la selección mostrada, la lista no se filtra**: el filtro arranca con todas las opciones para que el usuario pueda elegir otra sin borrar el label.
- **Teclado**: `ArrowDown`/`ArrowUp` mueven la opción activa y abren la lista, `Enter` selecciona la activa, `Escape` cierra **sin propagar** (el `Escape` del modal no se dispara a la vez). La lista se abre también con `focus`.
- **Al escribir a mano** llama `onChange("", texto)`: el valor no matchea ninguna opción y el formulario lo trata como vacío. No inventa un id.
- `clearOnSelect` deja el input vacío después de elegir (lo usa el editor de líneas de compra, donde el mismo producto se puede agregar varias veces).
- `autoFocus` enfoca el input al montar (lo usa el POS cuando el usuario pulsa "Cambiar" en la card del cliente).
- Se cierra al hacer click afuera (`mousedown` sobre `document`).
- **Accesibilidad**: `role="combobox"` con `aria-expanded`, `aria-controls`, `aria-activedescendant`; la lista es `role="listbox"` y cada ítem `role="option"` con `aria-selected`.
- Se renderiza desde `DynamicFormFields` cuando `field.type === "combobox"`, o directamente en un componente de feature (líneas de compra, selector de cliente del POS).

**Snippet (representativo — el archivo completo son 177 líneas):**

```typescript
export interface SearchableOption {
  value: string;
  label: string;
  description?: string;
  /** Extra terms that match the query but are never rendered. */
  keywords?: string[];
}

interface Props {
  id?: string;
  label?: string;
  options: SearchableOption[];
  value: string;
  placeholder?: string;
  emptyLabel?: string;
  invalid?: boolean;
  clearOnSelect?: boolean;
  autoFocus?: boolean;
  onChange: (value: string, label: string) => void;
}

export function SearchableSelect({
  id, label, options, value, placeholder, emptyLabel,
  invalid = false, clearOnSelect = false, autoFocus = false, onChange,
}: Props) {
  const [text, setText] = useState(
    () => options.find((option) => option.value === value)?.label ?? "",
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    // An empty value means the user is typing: resyncing would wipe the text.
    if (value) setText(selected ? selected.label : "");
  }

  const selectedLabel = selected?.label ?? "";

  const filtered = useMemo(() => {
    const query = normalizeSearch(text);
    // The text may only be showing the current selection, not a search query.
    if (!query || text === selectedLabel) return options;
    return options.filter(
      (option) =>
        normalizeSearch(option.label).includes(query) ||
        (option.description
          ? normalizeSearch(option.description).includes(query)
          : false),
    );
  }, [options, text]);

  const handleSelect = (option: SearchableOption) => {
    setText(clearOnSelect ? "" : option.label);
    setOpen(false);
    setActiveIndex(-1);
    onChange(option.value, option.label);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      if (!open || activeIndex < 0) return;
      event.preventDefault();
      handleSelect(filtered[activeIndex]);
      return;
    }
    if (event.key === "Escape") {
      event.stopPropagation();
      setOpen(false);
      setActiveIndex(-1);
    }
  };
  /* … render con role="combobox" + listbox … */
}
```

### DynamicFormFields (renderiza `FormField[]`) `[PRINCIPIO]`

**Ubicación**: `src/components/UI/DynamicFormFields.tsx`
**Propósito**: renderiza declarativamente un array `FormField[]` consumiendo `useCrudForm`. Es el otro lado del contrato: el hook define los datos, este componente define cómo se ven.
**Reglas**:
- Recibe `fields`, `values`, `errors`, `editingId`, `onChange(name, value)`.
- Respeta `showOnEdit`/`showOnCreate`.
- **Layout en dos columnas**: los campos con `sidebar: true` van a un `<aside>` derecho; el resto a la grilla principal. Si no hay campos de sidebar, la grilla ocupa todo el ancho.
- **`section`** agrupa los campos en bloques con título (el título es una **clave de i18n**: `t(group.section)`). Los campos sin `section` comparten el primer grupo.
- **`span`** (1-6) decide cuántas columnas de la grilla ocupa el campo; sin `span` ocupa el ancho completo (6).
- **`hint`** es el texto de ayuda bajo el control; se oculta si hay error (el error manda).
- **`readonly`** renderiza el control deshabilitado (ej. un código generado por el servidor).
- **Dispatch por `field.type`**: `combobox` → `SearchableSelect`; `select` → `<select>` con option vacío; `checkbox` → checkbox o switch (según esté en el sidebar); `file` → drop-zone + preview; `textarea`; `number` (decide `parseInt`/`parseFloat` según `step < 1`); el resto, `<input>`.
- El panel de archivo del sidebar muestra las **iniciales** del `name` mientras no hay imagen (`initialsOf`).

**Snippet (representativo, el archivo completo son 563 líneas):**

```typescript
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import type { FormField } from "../../hooks/useCrudForm";
import { initialsOf } from "../../utils/initials";
import { SearchableSelect } from "./SearchableSelect";
import styles from "./DynamicFormFields.module.css";

interface Props {
  fields: FormField[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  editingId: string | null;
  onChange: (name: string, value: unknown) => void;
}

interface FieldGroup {
  section?: string;
  fields: FormField[];
}

const SPAN_CLASSES = ["", styles.span1, styles.span2, styles.span3, styles.span4, styles.span5, styles.span6];

export function DynamicFormFields({ fields, values, errors, editingId, onChange }: Props) {
  const visible = fields.filter((field) => {
    if (field.showOnEdit && editingId === null) return false;
    if (field.showOnCreate && editingId !== null) return false;
    return true;
  });

  const main = visible.filter((field) => !field.sidebar);
  const sidebar = visible.filter((field) => field.sidebar);
  const initials = initialsOf(String(values.name ?? ""));

  const groups = groupBySection(main);

  if (sidebar.length === 0) {
    return (
      <div className={styles.stack}>
        {groups.map((group) => (
          <Section key={group.section ?? "main"} group={group}>
            {(field) => (
              <FieldCell
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={onChange}
              />
            )}
          </Section>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.columns}>
      <div className={styles.stack}>
        {groups.map((group) => (
          <Section key={group.section ?? "main"} group={group}>
            {(field) => (
              <FieldCell
                key={field.name}
                field={field}
                value={values[field.name]}
                error={errors[field.name]}
                onChange={onChange}
              />
            )}
          </Section>
        ))}
      </div>

      <aside className={styles.sidebar}>
        {sidebar.map((field) => (
          <SidebarBlock
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name]}
            onChange={onChange}
            initials={initials}
          />
        ))}
      </aside>
    </div>
  );
}

// ─── combobox (select con búsqueda) ───
if (field.type === "combobox") {
  return (
    <SearchableSelect
      id={id}
      label={field.label}
      options={field.options ?? []}
      value={String(value ?? "")}
      placeholder={field.placeholder}
      emptyLabel={field.placeholder}
      invalid={Boolean(error)}
      onChange={(optionValue) => onChange(field.name, optionValue)}
    />
  );
}
```

### Toast (NotificationContainer) `[PRINCIPIO]`

**Ubicación**: `src/components/UI/Toast.tsx`
**Propósito**: container global que renderiza toasts y modals del `uiStore`. Se monta UNA vez en `App.tsx`.
**Reglas**:
- Lee `toasts`, `modals`, `removeToast`, `dismissNotification`, `isLoading` de `useUIStore()`.
- Toast con `title` opcional, `actions` opcionales (botones con `onClick`).
- Loading overlay si `isLoading === true`.
- Cada modal del `uiStore` se renderiza con `<ConfirmModal>` (reutilización).

**Snippet (representativo):**

```typescript
import { useState, type FC } from 'react';
import { useUIStore, type Toast as ToastType } from '../../stores/uiStore';
import { ConfirmModal } from './ConfirmModal';
import styles from './Toast.module.css';

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);
  const dismissible = toast.dismissible !== false;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);  // 300ms exit animation
  };
  /* … render with title / message / actions / close button … */
}

export function NotificationContainer() {
  const { toasts, modals, removeToast, dismissNotification, isLoading } = useUIStore();

  return (
    <>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
        </div>
      )}

      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>

      {modals.map((modal) => (
        <ConfirmModal /* … props … */ />
      ))}
    </>
  );
}

export const ToastContainer: FC = NotificationContainer;  // alias histórico
```

### PageHeader `[PRINCIPIO]`

**Ubicación**: `src/components/UI/PageHeader.tsx`
**Propósito**: header estándar de página (título + subtítulo + slot para acciones).
**Snippet:**

```typescript
import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
```

### ErrorBoundary `[PRINCIPIO]`

**Ubicación**: `src/components/UI/ErrorBoundary.tsx`
**Propósito**: class component que captura errores en el árbol React y muestra un fallback.
**Reglas**:
- `level?: 'global' | 'module'` cambia el fallback visual (compacto o completo).
- En `componentDidCatch`, loguea con `console.error('[ErrorBoundary]', error, errorInfo)` SOLO si `import.meta.env.DEV`.
- `fallback?` opcional: si se pasa, se renderiza ese en vez del default.
- Acciones: `Retry` (resetea `hasError`) + `Go to dashboard` (solo en `global`).

**Snippet (representativo):**

```typescript
import { Component, type ReactNode } from 'react';
import { AlertTriangle, Bomb } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  level?: 'global' | 'module';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const isDev = import.meta.env?.DEV ?? false;

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isDev) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  handleGoHome = () => { window.location.href = '/'; };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    const { level = 'global' } = this.props;
    const { error } = this.state;
    const isCompact = level === 'module';

    return (
      <div className={`${styles.fallback} ${isCompact ? styles.fallbackCompact : ''}`}>
        <div className={`${styles.icon} ${isCompact ? styles.iconCompact : ''}`}>
          {isCompact ? <AlertTriangle size={32} strokeWidth={1.5} /> : <Bomb size={40} strokeWidth={1.5} />}
        </div>
        <h2 className={`${styles.title} ${isCompact ? styles.titleCompact : ''}`}>
          {isCompact ? 'This section had an error' : 'Something went wrong'}
        </h2>
        {isDev && error?.message && (
          <pre className={styles.errorDetails}>{error.message}</pre>
        )}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={this.handleRetry}>Retry</button>
          {!isCompact && (
            <button className={styles.btnSecondary} onClick={this.handleGoHome}>Go to dashboard</button>
          )}
        </div>
      </div>
    );
  }
}
```

### ImageCell `[PRINCIPIO]`

**Ubicación**: `src/components/UI/ImageCell.tsx`
**Propósito**: celda con imagen + nombre + subtexto, con fallback SVG si la imagen falla.
**Reglas**:
- `type?: 'product' | 'avatar'` cambia aspect-ratio y placeholder.
- `PLACEHOLDER_AVATAR` y `PLACEHOLDER_PRODUCT` son SVGs inline en base64 (definen "¿?" y 🔥 placeholders).
- `onError` cambia el `src` al fallback (asigna directamente al elemento img — patrón simple).

**Snippet:**

```typescript
import styles from './ImageCell.module.css';

interface ImageCellProps {
  src: string;
  name: string;
  subtext?: string;
  type?: 'product' | 'avatar';
}

const PLACEHOLDER_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23E5E7EB" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="14"%3E%3F%3C/text%3E%3C/svg%3E';
const PLACEHOLDER_PRODUCT = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"%3E%3Crect fill="%23E5E7EB" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="14"%3E%F0%9F%94%A5%3C/text%3E%3C/svg%3E';

export function ImageCell({ src, name, subtext, type = 'product' }: ImageCellProps) {
  const fallback = type === 'product' ? PLACEHOLDER_PRODUCT : PLACEHOLDER_AVATAR;
  
  return (
    <div className={styles.imageCell}>
      <img 
        src={src} 
        alt={name} 
        className={type === 'product' ? styles.image : styles.avatar}
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallback;
        }}
      />
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {subtext && <span className={styles.subtext}>{subtext}</span>}
      </div>
    </div>
  );
}
```

### UI barrel (index.ts) `[STACK: CSS Modules específicos]`

**Ubicación**: `src/components/UI/index.ts`
**Propósito**: re-exports para que `import { Table, Modal, ... } from '../components/UI'` funcione.
**Reglas**:
- Solo se exportan los primitives.
- NO incluir exports de subcarpetas como `Support/`.

**Snippet:**

```typescript
export { Table } from './Table';
export { Button } from './Button';
export { PageHeader } from './PageHeader';
export { ImageCell } from './ImageCell';
export { ToastContainer, NotificationContainer } from './Toast';
export { Pagination } from './Pagination';
export { ActionButtons } from './ActionButtons';
export { SearchInput } from './SearchInput';
export { SearchableSelect } from './SearchableSelect';
export type { SearchableOption } from './SearchableSelect';
export { Modal } from './Modal';
export { ConfirmModal } from './ConfirmModal';
export { DynamicFormFields } from './DynamicFormFields';
export { VolterpMark } from './VolterpMark';
export { ErrorBoundary } from './ErrorBoundary';
```

> **Decisión intencional**: este es el ÚNICO barrel permitido en el proyecto. Toda la regla anti-barrel del §4.7 aplica a TODO lo demás — este es la excepción justificada (los primitives son reusados en todas las pages).

---

## 2.6 Utils (`utils/`) `[PRINCIPIO: funciones puras sin React ni fetch]`

### pagination (helpers puros) `[PRINCIPIO]`

**Ubicación**: `src/utils/pagination.ts`
**Propósito**: funciones puras de paginación. Sin React. Sin estado.
**Reglas**:
- `getPaginationInfo(total, page, pageSize)`: calcula `totalPages`, `hasNext`, `hasPrev`.
- `getPageNumbers(currentPage, totalPages)`: devuelve array con `-1` donde va el ellipsis.
- `paginate(items, page, pageSize)`: slice client-side.
- `getPaginationParams(page?, pageSize?)`: normaliza defaults (`> 0`, si no → 1 / 10).

**Snippet:**

```typescript
export interface PaginationParams {
  page: number;
  pageSize: number;
}
export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
export function getPaginationParams(
  page?: number,
  pageSize?: number,
): PaginationParams {
  return {
    page: page && page > 0 ? page : 1,
    pageSize: pageSize && pageSize > 0 ? pageSize : 10,
  };
}
export function getPaginationInfo(
  total: number,
  page: number,
  pageSize: number,
): PaginationInfo {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): number[] {
  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }
  let prev = 0;
  for (const i of range) {
    if (prev && i - prev > 1) {
      rangeWithDots.push(-1);
    }
    rangeWithDots.push(i);
    prev = i;
  }
  return rangeWithDots;
}
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}
```

### jwt (decodificar sin librería) `[PRINCIPIO]`

**Ubicación**: `src/utils/jwt.ts`
**Propósito**: leer claims del JWT sin librerías externas.
**Reglas**:
- `decodePayload(token)`: base64url → base64 → atob → JSON.parse.
- `getTokenExpiry(token)`: lee `payload.exp` (en segundos), devuelve ms.
- `isTokenExpired(token, bufferMs = 0)`: `Date.now() >= expiry - buffer`.
- `msUntilExpiry(token)`: ms hasta expirar, `0` si ya expiró.

**Snippet:**

```typescript
/**
 * Decodes a JWT payload without a library.
 * JWT structure: header.payload.signature (all base64url encoded)
 * We only need the payload to read the `exp` claim.
 */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns the expiry timestamp (ms) of a JWT token, or null if invalid.
 * The `exp` claim in JWT is in seconds — we convert to ms.
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  return payload.exp * 1000;
}

/**
 * Returns true if the token is expired or will expire within the buffer (ms).
 */
export function isTokenExpired(token: string, bufferMs = 0): boolean {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return true;
  return Date.now() >= expiry - bufferMs;
}

/**
 * Returns milliseconds until the token expires.
 * Returns 0 if already expired.
 */
export function msUntilExpiry(token: string): number {
  const expiry = getTokenExpiry(token);
  if (expiry === null) return 0;
  return Math.max(0, expiry - Date.now());
}
```

### name (helpers de nombre completo) `[PRINCIPIO]`

**Ubicación**: `src/utils/name.ts`
**Propósito**: helpers minúsculos para extraer partes de un nombre completo.

**Snippet:**

```typescript
export function getFirstName(fullName?: string): string {
  return fullName?.split(' ')[0] || '';
}

export function getInitials(fullName?: string): string {
  const parts = fullName?.split(' ') || [];
  return parts.length >= 2 
    ? `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase() 
    : (parts[0]?.substring(0, 2).toUpperCase() || '');
}
```

### apiError (normaliza el error del backend) `[PRINCIPIO]`

**Ubicación**: `src/utils/apiError.ts`
**Propósito**: leer el mensaje de error de un body del backend, que viene en tres formas distintas.
**Reglas**:
- El backend usa `ErrorResponse{error,details?}` (api/accounts, 401/403), un `{message}` anónimo (api/sales, api/purchases) y RFC 7807 `ProblemDetails` (5xx, 429).
- Sólo se muestra el mensaje en un **4xx**: un 5xx puede llevar texto crudo de base de datos o un stack trace, así que conserva el mensaje genérico.
- `error` tiene prioridad sobre `message`. Un string vacío no cuenta como mensaje.
- **Función pura**: vive en `utils/`, no toca `fetch` ni React. Por eso se testea sin mockear red.

**Snippet:**

```typescript
export const DEFAULT_ERROR_MESSAGE = "An error occurred";

export function extractErrorMessage(
  body: unknown,
  status: number,
  fallback: string = DEFAULT_ERROR_MESSAGE,
): string {
  if (status >= 500) return fallback;
  if (!body || typeof body !== "object") return fallback;

  const candidate = body as { error?: unknown; message?: unknown };
  for (const key of ["error", "message"] as const) {
    const value = candidate[key];
    if (typeof value === "string" && value.trim() !== "") return value;
  }

  return fallback;
}
```

### config (constantes globales) `[PRINCIPIO]`

**Ubicación**: `src/config/pagination.ts`
**Snippet:**

```typescript
export const ITEMS_PER_PAGE = 10;
```

> **Regla**: el default de paginación vive acá y se reusa en `usePagination` y en los services. Si querés cambiar el default, tocás UN archivo.

---

## 2.7 i18n (init + locale shape) `[STACK: react-i18next con detección custom]`

### init (`src/i18n/index.ts`)

**Ubicación**: `src/i18n/index.ts`
**Propósito**: inicializar react-i18next con recursos, detección de idioma, fallback.
**Reglas**:
- Idioma por defecto: `es` (español primero).
- Detección: lee `localStorage.language`, si no → `navigator.language.split('-')[0]`, si no es `en` → fallback a `es`.
- `escapeValue: false` (React ya escapa por default, evita doble escape).
- `fallbackLng: 'es'`.

**Snippet:**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

const resources = {
  es: { translation: es },
  en: { translation: en },
};

const savedLanguage = localStorage.getItem('language');
const browserLanguage = navigator.language.split('-')[0];
const defaultLanguage = savedLanguage || (browserLanguage === 'en' ? 'en' : 'es');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### locales/es.json (estructura y namespaces)

**Ubicación**: `src/i18n/locales/es.json`
**Estructura**: objeto plano con namespaces como top-level keys. Dentro de cada namespace, claves en camelCase.

**Top-level keys** (namespaces): `common`, `sidebar`, `auth`, `roles`, `permissions`, `dashboard`, `ventas`, `compras`, `inventario`, `clientes`, `proveedores`, `contabilidad`, `rrhh`, `nomina`, `asistencia`, `proyectos`, `reportes`, `configuracion`, `soporte`, `table`, `fileUpload`, `validation`, `confirm`, `pagination`, `empresas` (25 namespaces en total — uno por módulo de dominio + transversales).

**Extracto del namespace `auth` (es.json):**

```json
{
  "login": "Iniciar Sesión",
  "logout": "Cerrar Sesión",
  "username": "Usuario",
  "password": "Contraseña",
  "rememberMe": "Recordarme",
  "forgotPassword": "¿Olvidaste tu contraseña?",
  "welcome": "Bienvenido",
  "loginSubtitle": "Inicie sesión para continuar",
  "invalidCredentials": "Credenciales incorrectas",
  "sessionExpired": "Tu sesión ha expirado",
  "dontHaveAccount": "¿No tienes cuenta?",
  "createAccount": "Crear cuenta"
}
```

### locales/en.json

**Ubicación**: `src/i18n/locales/en.json`
**Estructura**: idéntica a `es.json` — mismos 25 namespaces, mismas claves camelCase. Solo cambian los valores.

**Top-level keys**: idénticos a `es.json` (`common`, `sidebar`, `auth`, `roles`, `permissions`, `dashboard`, `ventas`, `compras`, `inventario`, `clientes`, `proveedores`, `contabilidad`, `rrhh`, `nomina`, `asistencia`, `proyectos`, `reportes`, `configuracion`, `soporte`, `table`, `fileUpload`, `validation`, `confirm`, `pagination`, `empresas`).

**Extracto del namespace `auth` (en.json):**

```json
{
  "login": "Login",
  "logout": "Logout",
  "username": "Username",
  "password": "Password",
  "rememberMe": "Remember me",
  "forgotPassword": "Forgot your password?",
  "welcome": "Welcome",
  "loginSubtitle": "Sign in to continue",
  "invalidCredentials": "Invalid credentials",
  "sessionExpired": "Your session has expired",
  "dontHaveAccount": "Don't have an account?",
  "createAccount": "Create account"
}
```

---

## 2.8 Flujo de autenticación end-to-end `[PRINCIPIO: el flujo completo; STACK en los detalles de cada componente]`

Esta sección recorre el camino completo de un usuario: login, register, expiración de sesión, y rehidratación. Cada paso referencia el archivo exacto y explica por qué se hizo así. Sirve como "mapa" para entender qué pieza del código se rompe si tocás otra.

### 2.8.1 Login — `Login.tsx` `[PRINCIPIO + STACK: usa useTranslation de react-i18next]`

**Ubicación**: `src/pages/Login/Login.tsx`
**Propósito**: página pública de inicio de sesión. Usa estado local (NO `useCrudForm` — auth no es CRUD genérico). Al éxito guarda en `authStore` y redirige al dashboard.
**Reglas**:
- Estado local con `useState` para los 4 campos (`username`, `password`, `showPassword`, `rememberMe`) + `error` + `loading`.
- Detecta sesión expirada vía `location.state.expired` (viene de `useTokenExpiry` cuando el token expira o llega un 401).
- En el `catch`, fallback en español vía i18n: `err instanceof Error ? err.message : t("auth.invalidCredentials")`.
- Branding (logo, "Volterp ERP", "Sistema de gestión empresarial integral", "Gestión de ventas e inventario" etc.) se queda hardcodeado — es decisión intencional, no copy traducible. Ver §4.8.
- Llama `authService.login(credentials)` → mapea `LoginResponse` a `User` → `useAuthStore.login(user, token, rememberMe)` → `navigate("/")`.

> **Razón de NO usar `useCrudForm`**: auth es login de 2 campos + 1 checkbox, no justifica la abstracción CRUD. `useCrudForm` es para formularios CRUD de 5+ campos con validación declarativa, modos `create`/`edit`, y errores que se mapean campo a campo. Acá solo hay dos inputs y dos errores posibles (credenciales inválidas + sesión expirada). Forzar el hook agregaría 30 líneas de boilerplate sin beneficio. Ver §4.9.

**Snippet (verbatim — archivo completo):**

```tsx
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Zap,
  Diamond,
  BarChart3,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { authService } from "../../infrastructure/api/authService";
import styles from "./Login.module.css";
import { ExpirationSession } from "../ExpirationSession/ExpirationSession";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show session expired banner when redirected from auto-logout
  const sessionExpired =
    (location.state as { expired?: boolean } | null)?.expired === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ username, password });

      const user = {
        username: response.username,
        email: response.email,
        fullName: response.fullName,
        role: response.role.toLowerCase(),
        companyId: response.companyId,
      };

      login(user, response.token, rememberMe);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("auth.invalidCredentials"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brandingContent}>
          <div className={styles.logoWrapper}>
            <img
              src="/src/assets/logo.svg"
              alt="Volterp"
              className={styles.logo}
            />
          </div>
          <h1 className={styles.brandTitle}>
            Volterp<span className={styles.brandTitleAccent}> ERP</span>
          </h1>
          <p className={styles.brandSubtitle}>
            Sistema de gestión empresarial integral
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span
                className={`${styles.featureIcon} ${styles.featureIconGold}`}
              >
                <Zap size={20} strokeWidth={1.8} />
              </span>
              <span>Gestión de ventas e inventario</span>
            </div>
            <div className={styles.feature}>
              <span
                className={`${styles.featureIcon} ${styles.featureIconTeal}`}
              >
                <Diamond size={20} strokeWidth={1.8} />
              </span>
              <span>Control de nómina y recursos humanos</span>
            </div>
            <div className={styles.feature}>
              <span
                className={`${styles.featureIcon} ${styles.featureIconEmerald}`}
              >
                <BarChart3 size={20} strokeWidth={1.8} />
              </span>
              <span>Reportes y análisis en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>{t("auth.welcome")}</h2>
            <p>{t("auth.loginSubtitle")}</p>
          </div>

          {sessionExpired && (
            <ExpirationSession styles={styles.sessionExpiredBanner} />
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div
              className={`${styles.inputGroup} ${error ? styles.error : ""}`}
            >
              <label htmlFor="username">{t("auth.username")}</label>
              <div className={styles.inputWrapper}>
                <User
                  className={styles.inputIcon}
                  size={18}
                  strokeWidth={1.8}
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("auth.username")}
                  required
                />
              </div>
            </div>

            <div
              className={`${styles.inputGroup} ${error ? styles.error : ""}`}
            >
              <label htmlFor="password">{t("auth.password")}</label>
              <div className={styles.inputWrapper}>
                <Lock
                  className={styles.inputIcon}
                  size={18}
                  strokeWidth={1.8}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.8} />
                  ) : (
                    <Eye size={18} strokeWidth={1.8} />
                  )}
                </button>
              </div>
            </div>

            <div className={styles.optionsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t("auth.rememberMe")}</span>
              </label>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => alert(t("auth.forgotPassword"))}
              >
                {t("auth.forgotPassword")}
              </button>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={18} strokeWidth={1.8} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingSpinner} />
              ) : (
                <>
                  <span>{t("auth.login")}</span>
                  <ArrowRight size={18} strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <div className={styles.registerLink}>
            <p>
              {t("auth.dontHaveAccount")}{" "}
              <Link to="/register">{t("auth.createAccount")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.8.2 Register — `Register.tsx` `[PRINCIPIO + STACK]`

**Ubicación**: `src/pages/Register/Register.tsx`
**Propósito**: registro público de nuevos usuarios (single-company por ahora).
**Reglas**:
- Estado local con `useState` para los 9 campos (`username`, `email`, `fullName`, `password`, `confirmPassword`, `showPassword`, `error`, `loading`, `focusedField`).
- Validaciones inline (no `useCrudForm` — mismo razonamiento que Login): `password !== confirmPassword`, `password.length < 6`.
- `COMPANY_ID = 1` hardcodeado — decisión intencional: el register público es single-tenant. Para multi-tenant real, este valor debe venir de un endpoint de tenant discovery o de un selector de empresa.
- **Copy estática en español hardcodeado** ("Crear Cuenta", "Registra un nuevo usuario para HM Software Solutions", "¿Ya tienes cuenta? Inicia sesión"). Decisión intencional: register es página de onboarding interno, no requiere i18n todavía. Si vas a traducir, agregar los keys a `locales/{es,en}.json` primero (ver §4.8).
- Después del éxito: `navigate("/login", { replace: true })` — `replace: true` evita que el back-button lleve al register otra vez.
- **Inconsistencia consciente**: Login usa `useTranslation` completo, Register no. No es bug, es decisión documentada en §4.8.

**Snippet (verbatim — archivo completo):**

```tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../infrastructure/api/authService";
import styles from "./Register.module.css";

const COMPANY_ID = 1;

export function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        username,
        password,
        email,
        fullName,
        companyId: COMPANY_ID,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.brandingContent}>
          <div className={styles.logoWrapper}>
            <img src="/src/assets/logo.svg" alt="Volterp" className={styles.logo} />
          </div>
          <h1 className={styles.brandTitle}>Volterp ERP</h1>
          <p className={styles.brandSubtitle}>Sistema de gestión empresarial integral</p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Gestión de ventas y inventario</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Control de nómina y recursos humanos</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✓</span>
              <span>Reportes y análisis en tiempo real</span>
            </div>
          </div>
        </div>

        <div className={styles.decorativeCircle} />
        <div className={styles.decorativeCircle2} />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2>Crear Cuenta</h2>
            <p>Registra un nuevo usuario para HM Software Solutions</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={`${styles.inputGroup} ${focusedField === "username" ? styles.focused : ""}`}>
              <label htmlFor="username">Usuario</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField("username")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="usuario"
                  required
                  minLength={3}
                />
              </div>
            </div>

            <div className={`${styles.inputGroup} ${focusedField === "email" ? styles.focused : ""}`}>
              <label htmlFor="email">Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 6l-10 7L2 6"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="correo@empresa.com"
                  required
                />
              </div>
            </div>

            <div className={`${styles.inputGroup} ${focusedField === "fullName" ? styles.focused : ""}`}>
              <label htmlFor="fullName">Nombre completo</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
            </div>

            <div className={`${styles.inputGroup} ${focusedField === "password" ? styles.focused : ""}`}>
              <label htmlFor="password">Contraseña</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={`${styles.inputGroup} ${focusedField === "confirmPassword" ? styles.focused : ""}`}>
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <span className={styles.loadingSpinner} />
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className={styles.loginLink}>
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2.8.3 El wrapper de errores 401 → redirect al login `[PRINCIPIO]`

**Ubicación**: `src/infrastructure/api/fetchWithAuth.ts` (líneas 26–31) + `src/hooks/useTokenExpiry.ts`
**Propósito**: cerrar el ciclo cuando el token expira (sea proactivo o reactivamente).
**Reglas**:
- `fetchWithAuth` detecta 401 → llama `useAuthStore.getState().logout()` → dispara `window.dispatchEvent(new CustomEvent('auth:session-expired'))` → tira `new Error('SESSION_EXPIRED')`.
- `useTokenExpiry` (montado UNA vez en `Layout.tsx`) escucha el evento + chequea el token periódicamente; al disparar navega a `/login` con `state: { expired: true }`.
- `Login.tsx` lee ese state y renderiza el `<ExpirationSession />` banner (que muestra `t("auth.sessionExpired")` con un `<AlertTriangle>` de lucide-react).

**Snippet — handler 401 en `fetchWithAuth.ts` (líneas 26–31):**

```typescript
if (response.status === 401) {
  useAuthStore.getState().logout();
  // Dispatch a custom event so useTokenExpiry and any listener can react
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
  throw new Error('SESSION_EXPIRED');
}
```

**Snippet — listener + navigate en `useTokenExpiry.ts`:**

```typescript
// Reactive listener — fired by fetchWithAuth on 401
const handleExpired = () => {
  clearTimeout(timerId);
  navigate('/login', { state: { expired: true } });
};

window.addEventListener('auth:session-expired', handleExpired);

return () => {
  clearTimeout(timerId);
  window.removeEventListener('auth:session-expired', handleExpired);
};
```

> **Por qué custom event y no un listener de Zustand directo**: `useTokenExpiry` está montado en `Layout`, que vive DENTRO de `<ProtectedRoute>`. Si el token expira y el usuario está en `/clientes`, el evento dispara el logout + navigate correctamente. Si en cambio `useTokenExpiry` viviera en `App.tsx` (fuera de ProtectedRoute), podría montar antes que `authStore` termine de rehidratar — y el custom event evita acoplar `fetchWithAuth` con React Router o con cualquier hook.

### 2.8.4 `ProtectedRoute` (evita flash del login al rehidratar) `[PRINCIPIO]`

**Ubicación**: `src/App.tsx` (extracto).
**Propósito**: redirigir a `/login` si no hay sesión, pero esperar a que `authStore.hasHydrated` sea `true` para no mostrar el redirect mientras se rehidrata el storage.

**Snippet (verbatim):**

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated } = useAuthStore();

  if (!hasHydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

> **Por qué `if (!hasHydrated) return null`**: sin este check, en la primera carga `isAuthenticated` arranca en `false` (valor inicial del store) y la app redirige al login ANTES de que `persist` haya leído del storage. El usuario vería el flash "login → dashboard" cada vez que refresca. Con el check, `null` mientras se rehidrata (típicamente <50ms), y solo después se evalúa `isAuthenticated`.

---

## 2.9 Pages y routing `[STACK: React Router v6 + lazy loading]`

### App.tsx (root)

**Ubicación**: `src/App.tsx`
**Propósito**: bootstrap de la app — `BrowserRouter` + `ErrorBoundary` + `NotificationContainer` + `Suspense`.
**Reglas**:
- **Todas las páginas se importan con `lazy()`** — cada una se convierte en su propio chunk.
- `<Suspense fallback={<PageLoader />}>` envuelve las rutas.
- `ProtectedRoute` chequea `isAuthenticated` + `hasHydrated`. Si no está hidratado, retorna `null` (evita flash del login).
- `Layout` envuelve todas las rutas protegidas.

**Snippet (representativo):**

```tsx
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { useAuthStore } from "./stores/authStore";
import { ErrorBoundary, NotificationContainer } from "./components/UI";
import "./i18n";
import "./styles/variables.css";

// Lazy-loaded pages — each becomes its own chunk
const Dashboard = lazy(() =>
  import("./pages/Dashboard/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Clientes = lazy(() =>
  import("./pages/Clientes/Clientes").then((m) => ({ default: m.Clientes })),
);
// … etc …

function PageLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#6B7280", fontSize: "0.95rem" }}>
      <span>Loading...</span>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  if (!hasHydrated) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          {/* … */}
        </Route>
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary level="global">
        <AppRoutes />
      </ErrorBoundary>
      <NotificationContainer />
    </BrowserRouter>
  );
}

export default App;
```

---

# PARTE 3 — WORKFLOW

## 3.1 Crear un proyecto nuevo desde este template `[STACK: Vite scaffold]`

```bash
# 1. Scaffold Vite con plantilla react-ts
npm create vite@latest my-app -- --template react-ts
cd my-app

# 2. Instalar deps core
npm install zustand react-router-dom react-i18next i18next lucide-react recharts

# 3. Instalar devDeps
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom

# 4. Copiar estructura de carpetas del §1.1
#    - src/infrastructure/api/
#    - src/stores/
#    - src/hooks/
#    - src/application/hooks/
#    - src/components/UI/  (con index.ts barrel)
#    - src/domain/types/, domain/constants/
#    - src/utils/
#    - src/i18n/
#    - src/pages/
#    - src/test/

# 5. Copiar archivos del §2 según corresponda (mínimo: fetchWithAuth, API_CONFIG,
#    Pagination, Table, useCrudForm, usePagination, useFilter, authStore,
#    NotificationContainer).

# 6. Configurar vite.config.ts según §1.3
# 7. Configurar tsconfig.app.json según §1.3
# 8. Crear .env con VITE_API_URL
# 9. Reemplazar las pages de ejemplo por las del template
# 10. npm run dev
```

> **Checklist de setup**: ver §3.3.

## 3.2 Agregar una nueva entidad/página (ej. `Supplier`) `[PRINCIPIO: workflow de 7 pasos; los paths concretos son stack]`

Workflow de 7 pasos. Cada paso referencia qué sección del template usar.

1. **Domain types**:
   - Agregar `SupplierDto` (y `CreateSupplierRequest`/`UpdateSupplierRequest` si aplica) en `src/domain/types/index.ts`.
   - Convencional: `export type Supplier = SupplierDto;` y `export type SupplierRequest = Partial<SupplierDto>;`.

2. **Infrastructure — service**:
   - Crear `src/infrastructure/api/supplierService.ts` mirroring `clientService.ts` (§2.1).
   - Si el endpoint no existe en `ENDPOINTS`, agregarlo a `src/infrastructure/api/config.ts`.

3. **Store**:
   - Crear `src/stores/supplierStore.ts` mirroring `clienteStore.ts` (§2.2).
   - Interface: `suppliers`, `loading`, `error`, `totalCount`, `pageCount`, `fetchSuppliers`, `getSupplierById`, `addSupplier`, `updateSupplier`, `deleteSupplier`, `setError`.

4. **Application hook (opcional)**:
   - Si la página es compleja (ej. wizard multi-step), crear `src/application/hooks/useSupplierForm.ts` (§2.4).
   - Si es simple, la página puede usar el store directo.
   - **Sólo si hay call site**: un hook sin consumidor es código muerto con tests (ver §2.4, "Hooks retirados").

5. **Page**:
   - Crear `src/pages/Proveedores/Proveedores.tsx` (siguiendo la convención: carpeta con nombre del módulo en español).
   - Exportar componente con `export const Proveedores: React.FC = () => { ... }`.
   - Componer: `<PageHeader>` + `<SearchInput>` + `<Table>` + `<Pagination>` + `<Modal>` (con `<DynamicFormFields>` adentro) + `<ConfirmModal>` para delete.
   - **Borrado**: el estado del modal va en `useDeleteConfirm` (`src/hooks/useDeleteConfirm.ts`), no en `useState` local de la página.
   - **Referencias a otras entidades** (proveedor, categoría): declararlas `type: "combobox"` en vez de `select` cuando la lista es grande.
   - **`mapEntityToForm`**: agregarlo si el DTO trae arrays o campos vacíos (§4.5).
   - Estado local: `useFilter`, `usePagination`. Datos: del store vía hook custom o directo.

6. **Routing**:
   - Agregar la page a `src/App.tsx` con `lazy()`.
   - Agregar `<Route path="/proveedores" element={<Proveedores />} />`.

7. **i18n**:
   - Agregar namespace (ej. `proveedores`) en `src/i18n/locales/es.json` y `en.json`.
   - Strings: títulos, mensajes de éxito/error, headers de columnas, labels de campos, mensajes de validación custom.

## 3.3 Setup inicial (checklist de proyecto nuevo) `[STACK]`

1. Cambiar `name` en `package.json`.
2. Crear `.env` con `VITE_API_URL=<backend URL>`.
3. Crear `.env.example` con la misma var (placeholder).
4. Cambiar `homepage`/metadata en `index.html` (`<title>`).
5. Si se agregan nuevos módulos en `MATRIZ_PERMISOS`, actualizar `src/domain/constants/permisos.ts`.
6. Configurar ESLint con la config de Vite + reglas de react-hooks/react-refresh.
7. Correr `npm run dev` y verificar que carga sin warnings.
8. Correr `npm test` y verificar que pasa el suite inicial.
9. Configurar CI: `npm run build && npm test` en el pipeline.
10. Confirmar que el backend `.NET API` está corriendo en el puerto configurado y responde a `/health`.

---

# PARTE 4 — CONVENCIONES

## 4.1 Naming `[PRINCIPIO]`

| Elemento | Convención | Ejemplo |
|---|---|---|
| Store file | `{entity}Store.ts` (sufijo `Store`) | `clienteStore.ts` |
| Store hook | `use{Entity}Store` | `useClienteStore` |
| Service file | `{entity}Service.ts` | `clientService.ts` |
| Service object | `{entity}Service` (lowercase first) | `clientService` |
| Hook genérico (reusable) | `use{Name}` sin sufijo | `useFilter`, `usePagination`, `usePermission` |
| Application hook (caso de uso) | `use{Name}{Action?}` | `useNominaCalculator`, `useEmpleadoForm` |
| Componente UI | PascalCase, archivo `.tsx` | `Table`, `Pagination`, `Modal` |
| Componente feature group | PascalCase carpeta + index | `components/Support/ChatWindow.tsx` |
| Page | PascalCase carpeta + `Page.tsx` | `pages/Clientes/Clientes.tsx` |
| Tipo de dominio (DTO response) | `{Entity}Dto` | `ClientDto` |
| Tipo de dominio (alias para UI) | `{Entity}` (= `Dto`) | `Client = ClientDto` |
| Tipo de dominio (request) | `{Entity}Request` (Partial del Dto) | `ClientRequest` |
| Tipo de dominio (create) | `Create{Entity}Request` | `CreateSaleRequest` |
| Tipo de dominio (update) | `Update{Entity}Request` | `UpdateSaleRequest` |
| Paginated response | `PagedResult<T>` con `items`, `rowCount`, `pageNumber`, `pageSize`, `pageCount` | `PagedResult<ClientDto>` |
| CSS Module | `{Component}.module.css` | `Table.module.css` |
| CSS class | camelCase desde el module | `styles.tableContainer`, `styles.btn` |
| Constante global | `UPPER_SNAKE_CASE` | `ITEMS_PER_PAGE`, `API_CONFIG` |
| Interface (objeto) | `interface Nombre { ... }` | `interface ClienteStore { ... }` |
| Type (union/intersection) | `type Nombre = ...` | `type Status = "Pending" \| "Completed"` |
| Enum-like | `as const` object con `type = (typeof X)[keyof typeof X]` | `Rol`, `Permiso` |
| Archivo test | `*.test.ts` o `*.test.tsx` | `pagination.test.ts` |
| Constante API endpoint | `API_CONFIG.ENDPOINTS.X` | `API_CONFIG.ENDPOINTS.SALES` |

> **Decisión intencional**: el codebase NO es consistente con el idioma del nombre (mezcla español `clienteStore` con inglés `authStore`). Se mantiene por compatibilidad. Para entidades NUEVAS, prefiero inglés (`clientStore`).

## 4.2 Error handling `[PRINCIPIO]`

### Stores

```typescript
catch (error) {
  set({
    loading: false,
    error: error instanceof Error ? error.message : "Fallback message",
  });
}
```

- **Lectores** (`fetch`, `getById`): NO re-tiran. El error queda en `state.error` para que el componente lo muestre.
- **Mutaciones** (`add`, `update`, `delete`): re-tiran con `throw error` después de setear `state.error`. Esto permite que el caller (form, page) reaccione con un toast o cierre un modal.

### Services

```typescript
// service.ts
const result = await fetchWithAuthJson(...);  // ya lanza Error si algo falla
return result;
```

- Los services **re-tiran** cualquier `Error` que venga de `fetchWithAuth`/`fetchWithAuthJson`. NO los envuelven ni transforman.
- Si un service tiene lógica propia que puede fallar, esa lógica debe tirar `Error` con un mensaje descriptivo en inglés (son técnicos).

### fetchWithAuth (interceptor global)

```typescript
if (response.status === 401) {
  useAuthStore.getState().logout();
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
  throw new Error('SESSION_EXPIRED');
}
if (!response.ok) {
  const error: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
  throw new Error(error.error || 'An error occurred');
}
```

- **401** es el caso especial: desloguea automáticamente y dispara el evento `auth:session-expired` para que `useTokenExpiry` navegue al login.
- Otros errores 4xx/5xx: parsea el body como `ApiError` y tira con el mensaje del backend.

### useCrudForm

```typescript
catch (err) {
  const msg = err instanceof Error ? err.message : "Error al guardar";
  setSubmitError(msg);  // no re-tira
}
```

- El form **NO re-tira** porque ya tiene `submitError` en estado. La UI muestra el mensaje inline.

## 4.3 Pagination `[PRINCIPIO]`

- **Default**: `pageNumber = 1`, `pageSize = 10`. Definido en `src/config/pagination.ts` (`ITEMS_PER_PAGE`) y replicado en la signature de cada service/hook.
- **Shape del response**: `PagedResult<T>` con `items`, `rowCount`, `pageNumber`, `pageSize`, `pageCount` — definido en `src/domain/types/index.ts`.
- **Query params**: `?pageNumber=X&pageSize=Y` vía `new URLSearchParams(...)`.
- **Client-side math** (UI): `usePagination().getInfo(totalCount)` delega a `utils/pagination.ts`.
- **Consumidor típico**:
  ```tsx
  const { pageNumber, pageSize, goToPage, getInfo } = usePagination();
  const { items, totalCount, loading } = useClienteStore();
  
  useEffect(() => { fetchClientes(pageNumber, pageSize); }, [pageNumber, pageSize]);
  
  const filtered = useFilter({ data: items, searchTerm, searchFields: (c) => [c.name, c.email] });
  // OJO: useFilter aplica sobre items YA paginados. Si querés filtrar antes de paginar, tenés que filtrar el total.
  ```
- **`<Pagination>` siempre** con `pagination={getInfo(totalCount)}` del `usePagination`. Nunca con `totalPages` hardcodeado.

> **Decisión intencional**: el filtro es client-side sobre `items` paginados (no sobre el total). Esto significa que si el backend devuelve 10 items por página y el usuario busca "garcía", solo va a encontrar "garcía" en la página actual. Para 10 items por página es aceptable. Si en algún momento se necesita filtrar sobre TODO el dataset, hay que traer `totalCount` items (no paginados) y filtrar ahí.

## 4.4 i18n `[STACK: react-i18next]`

- **Copia user-facing** (labels, mensajes, títulos, botones, placeholders): `src/i18n/locales/{es,en}.json` — SIEMPRE.
- **Mensajes de validación** (`useCrudForm`): **español** (son UX-facing). Ej: `"Email inválido"`, `"${label} es requerido"`.
- **Mensajes de error de stores/services**: **inglés** (son técnicos, vienen del backend o son fallback del cliente). Ej: `"Failed to fetch clients"`, `"An error occurred"`.
- **Detección de idioma**: orden de prioridad `localStorage.getItem('language')` → `navigator.language.split('-')[0]` → fallback `es`. No se usa `i18next-browser-languagedetector` — la detección es custom en `src/i18n/index.ts`. Esto permite control total pero requiere sincronizar manualmente cuando el usuario cambia el idioma (ver `src/components/LanguageSwitcher/`).
- **Cambio de idioma**: persistido en `languageStore`. La key es `language` en localStorage.
- **Claves**: camelCase (`selectClientWarning`, `saleCompleted`).
- **Namespaces**: top-level del JSON (`common`, `auth`, `ventas`, etc.).
- **NO usar `t()` dentro de constantes** — el JSON se carga antes que React. Si necesitás un string traducible, renderizalo con `<>{t("clave")}</>`.

## 4.5 Forms (useCrudForm) `[PRINCIPIO]`

- **`fields: FormField[]` declarativo** — el caller define qué se renderiza, no cómo.
- **`defaultValues` es la fuente de verdad** del shape de datos. Si agregás un campo, lo agregás a `defaultValues` Y a `fields[]`.
- **`mapEntityToForm` NO es opcional cuando el DTO y el form no calzan 1:1.** `pickKeys` (el mapper por defecto) copia **superficialmente**: comparte la referencia de los arrays y no normaliza `null`/`undefined`. Obligatorio cuando:
  - el DTO trae una colección (hay que **clonar** cada ítem, si no el form edita el array del store en vivo) — caso Compras con `items[]`;
  - el DTO puede devolver un campo vacío (hay que normalizar con `?? ""` / `?? 0` / `?? true`, si no el input controlado queda sin valor y `isDirty` marca el form sucio al abrirlo) — caso Inventario con `categoryId` y `stock`.
  - Ejemplo canónico: `src/pages/Compras/Compras.tsx` y `src/pages/Inventario/Inventario.tsx`.
- **`isDirty` se lee del hook, no se calcula en la página**: `form.isDirty` alimenta el `footerStatus`/`dirty` del `Modal`.
- **Los ids son strings** en toda la app (`editingId: string | null`, `onUpdate(id: string, …)`). El backend usa GUIDs.
- **Mutaciones NO re-tiran** (ver §4.2) — el error queda en `submitError`.
- **`setFieldValue(name, value)`** limpia el error de ESE campo en el momento (mejora UX).
- **Validators built-in**: required, email regex, number min/max/step, file accept con wildcards, string minLength/maxLength.
- **Custom validator**: `validate?: (value, values) => string | undefined` — devuelve mensaje o `undefined`.
- **Campos de referencia a otra entidad** (`type: "combobox"`): no usar `<select>` cuando la lista es grande. El `SearchableSelect` busca por `label` y `description` con `normalizeSearch` (ignora acentos y mayúsculas).
- **El borrado NO es parte del form**: vive en `useDeleteConfirm` (`src/hooks/useDeleteConfirm.ts`). No se fusiona con `useCrudForm`: no comparte `values`, `errors` ni `editingId`.

## 4.6 Tablas y Paginación `[PRINCIPIO]`

- **`<Table<T>>` siempre con `id` field** en `T extends { id: TableId }` — sin id no compila.
- **Columna "Acciones" automática**: si pasás `onEdit` o `onDelete`, se agrega sola con `<ActionButtons>`. El header es `t("common.actions")`.
- **Render custom por columna**: `render?: (item: T) => ReactNode`. Útil para `<ImageCell>`, badges de status, botones inline.
- **`<Pagination>`**:
  - Recibe `pagination: PaginationInfo` (computed por `usePagination.getInfo(total)`).
  - `onPageChange(newPage)` se conecta con `usePagination.goToPage(newPage)`.
  - **Si `totalPages <= 1` retorna `null`** — no muestra controles innecesarios.

## 4.7 Estilo de código `[PRINCIPIO]`

- **Strict TypeScript** (`strict: true`). No usar `any` salvo caso MUY justificado (con comentario explicando).
- **`interface` para contratos/objetos** — no `type`. `type` solo para unions/intersections (`type Status = "Pending" | "Completed"`).
- **`verbatimModuleSyntax: true`** — siempre `import type { ... }` para tipos.
- **CSS Modules** (`Component.module.css`) — sin Tailwind, sin CSS-in-JS.
- **CSS Variables** en `src/styles/variables.css` para colores, spacing, radius. Importado una vez en `App.tsx`.
- **Sin IA slop.** El código expresa la intención:
  - **Un comentario existe sólo cuando el *por qué* no es evidente del código, y entonces es una línea.** No para reexplicar lo que el código ya dice. Referencia de casa: `odd/tasks/accounting.md` (backend) §Code conventions.
  - **Sin narración, sin ensayos, sin reexplicar el código.** El límite de una línea es una regla, no una sugerencia.
  - **Sin abstracciones gratuitas**: un helper, un hook o un tipo nuevo existe si resuelve algo que se repite o si encapsula una decisión. Un alias o una envoltura sin valor, no.
  - **Sin ramas "por si acaso"** que nadie pidió.
  - **Preferir la solución estructural al comentario.** Si el código necesita una explicación para existir, primero hay que ver si el diseño puede hacer la pregunta innecesaria: `--warning: var(--primary)` (una *referencia*, no un valor duplicado) es mejor que un bloque de prosa explicando por qué no existe `--warning`.
- **No barrel exports** problemáticos: importar desde la ruta del archivo (`../stores/authStore`), NO desde un `index.ts` que reexporte todo.
- **Excepción única**: `src/components/UI/index.ts` (los primitives se usan en todos lados — vale la pena).
- **Single quotes** para strings (`'foo'`), **double quotes** para strings visibles al usuario (`"foo"` en toasts/JSX).
- **`useCallback`** para handlers que pasan como props. **`useMemo`** solo para cálculos pesados.
- **No early returns innecesarios**. Estructura plana cuando se pueda.
- **`noUnusedLocals: true` + `noUnusedParameters: true`** activos en `tsconfig.app.json`. Si algo está unused, va precedido de `_`.

## 4.8 Decisiones intencionales que respetar `[STACK: quirks específicos de este proyecto]`

> Lista de quirks que existen en el código. NO "limpiar" sin entender por qué están.

- **Nombres de stores en español mezclados con inglés**: `clienteStore`, `proveedorStore`, `ventaStore`, `compraStore`, `empleadoStore`, `productoStore`, `transaccionStore` (español). `authStore`, `categoryStore`, `companyStore`, `dashboardStore`, `chatStore`, `languageStore`, `proyectoStore` (inglés). Se mantiene por compatibilidad. Para entidades NUEVAS, prefiero inglés (`clientStore`).
- **`usePermission.isAdmin` retorna `true` solo para SUPER_ADMIN** — el nombre es engañoso (debería ser `isSuperAdmin`). **No renombrar** sin actualizar todos los call sites.
- **`useTokenExpiry` recibe `t` como dep** pero no lo usa. **Dep fantasma** que satisface el linter — está ahí para que un futuro cambio sea trivial.
- **`authService` repite `headers: { "Content-Type": "application/json" }`** en cada método aunque `fetchWithAuth` ya lo setea. **Inofensivo** — es ruido histórico. Si lo "limpiás", no hace diferencia. Pero si lo dejás, mantenelo en AMBOS métodos (consistencia).
- **`Toast.tsx` exporta `ToastContainer` y `NotificationContainer`** como alias del mismo componente. **`App.tsx` usa `NotificationContainer`** — pero `ToastContainer` está en el barrel por si alguien lo busca.
- **`Modal` y `ConfirmModal` tienen copy-paste del body-scroll-lock + escape-listener** (~15 líneas). **No extraer a custom hook** porque cada uno llama a `onClose` o `onCancel` respectivamente. Refactorizar agregaría un parámetro que es menos legible.
- **`useDeleteConfirm` NO se fusiona dentro de `useCrudForm`** — el borrado no comparte estado con el formulario (`values`, `errors`, `editingId`): son dos ejes de estado independientes. Fusionarlos metería un hook con dos ejes que no se tocan y rompería la cohesión de cada uno. Ver `odd/tasks/volterp-frontend-style-skill.md`.
- **`SearchableSelect` avisa `onChange("", texto)` cuando se tipea a mano** — el texto tipeado no matchea ninguna opción, así que el valor se reporta como vacío en vez de inventar un id. El formulario trata el campo como requerido hasta que se elija una opción de la lista.
- **El `Modal` tiene dos zonas de cuerpo y dos de footer** (con y sin `onSubmit`) — el `footerStatus` se dibuja en ambas. **No unificar** con un fragmento: el `<form>` necesita envelopar el body para que el submit sea nativo.
- **`fetchWithAuth` hace `useAuthStore.getState().token`** — acceso directo al state de Zustand sin hook. Es **deliberado**: no queremos que un componente que use `fetchWithAuth` se re-renderice cuando cambia el token.
- **`new URLSearchParams({ pageNumber: String(pageNumber) })`** — la coerción explícita a `String` es redundante (URLSearchParams ya coerce). **Estilo defensivo**, no remover.
- **`import.meta.env.VITE_API_URL` con fallback a `"http://localhost:5106"`** — el fallback es el dev default. En prod, el `.env` lo pisa. **Nunca** borrar el fallback (los devs sin `.env` necesitan poder correr la app).
- **`useState(options?.initialPage || 1)`** — usa `||` en vez de `??`. Cuidado: si `initialPage = 0`, también cae al default. **No es un bug** porque `getPaginationParams` clamp-ea a 1 después. Pero es un olor.
- **`Productos` (en español) pero `Products` (en inglés) según el archivo** — el dominio mezcla ambos idiomas. Aceptar el caos y mantenerlo. Refactorizar todo a un solo idioma es un PR separado y controversial.
- **`pages/Proveedores/` (español) — carpeta en español pero contenido mezcla español e inglés**. Decisión histórica. Mantener.
- **`useCrudForm` valida `email` con regex simple** (`^[^\s@]+@[^\s@]+\.[^\s@]+$`). No es perfecto (no acepta IDs internacionales), pero es lo que está. **No cambiar** sin necesidad real.
- **`<Pagination>` tiene los `title` de los botones hardcodeados en español** — debería estar en i18n. **Decisión intencional** de no traducir el componente (es infraestructura de UI, no copia user-facing). Pero si querés i18n completo, mover a `t("common.firstPage")` etc.
- **Register NO usa i18n** mientras Login sí. Decisión intencional: register es página de onboarding interno single-company, los textos no cambian entre locales. Si en el futuro hace falta traducir, agregar keys a `locales/{es,en}.json` y reemplazar los literales por `t("auth.registerUsername")` etc.
- **Register hardcodea `COMPANY_ID = 1`**. Decisión intencional para MVP single-tenant. Para multi-tenant real, este valor debe venir de un endpoint de tenant discovery o de un selector de empresa en el flujo de register.
- **Branding hardcodeado en Login/Register** (logo, "Volterp ERP", "Sistema de gestión empresarial integral", "Gestión de ventas e inventario" etc.). Decisión intencional: no es copy traducible, es identidad de marca. Si se quiere traducir, separar branding de copy traducible en el JSON.
- **Login maneja banner de sesión expirada** vía `location.state.expired`. Si el usuario llega a `/login` sin ese state, no muestra banner. Es la única señal que la app tiene para distinguir "veniste a loguearte" de "te deslogueamos".

## 4.9 Anti-patterns (lo que NO hacer) `[PRINCIPIO]`

- **No usar `fetch` directo en services**. Siempre `fetchWithAuth` o `fetchWithAuthJson`. Rompe el interceptor 401.
- **No duplicar lógica de auth/headers fuera de `fetchWithAuth`**. Si necesitás un header custom, agregalo al wrapper o pásalo en `options.headers` (que pisa el default).
- **No crear un service sin la forma canónica** (`export const xService = { async methodName(...) { ... } }`). Sin clases, sin `new`, sin wrappers extra.
- **No llamar `setState` (de useState) dentro de la signature de una acción de Zustand**. La acción debe ser `async` y usar `set({ ... })` solo cuando corresponda.
- **No hardcodear `BASE_URL` en services**. Siempre `` `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.X}` ``.
- **No hardcodear strings user-facing**. Siempre `t("clave")` con la clave en `locales/*.json`.
- **No importar React desde `infrastructure/`** ni desde `utils/` (excepto si es type-only). Solo React en `components/`, `pages/`, `application/hooks/`, `hooks/`.
- **No acceder a `useAuthStore` con `useAuthStore()` desde `fetchWithAuth`** — usar `useAuthStore.getState()`. Evita re-renders innecesarios.
- **No crear barrel exports nuevos**. El único permitido es `src/components/UI/index.ts`.
- **No usar `any`** salvo caso MUY justificado. Preferir `unknown` y narrowing con type guards.
- **No usar `useEffect` para sincronizar state derivado**. Si necesitás derivar algo del state, hacelo inline o con `useMemo`. (Ver skill `react-no-effects`).
- **No usar `class` para componentes React** — solo `function` (excepto `ErrorBoundary`, que NECESITA class porque es el único componente React que tiene lifecycle hooks para capturar errores).
- **No mezclar español e inglés en la MISMA entidad**. Si tu entity se llama `client` en el dominio, todos los derivados van en inglés (`clientService`, `clientStore`, `useClientForm`). Si va en español, todo español. **No** `clientService` + `clienteStore`.
- **No "arreglar" los typos históricos** listados en §4.8 sin entender el impacto. Cada uno tiene un motivo.
- **No usar `useCrudForm` para login/register**. Auth es un caso especial de 2–5 campos con submit simple. Forzar la abstracción CRUD complica el código sin beneficio. Usar `useState` local.
- **No usar el mapper por defecto `pickKeys` cuando el DTO trae arrays o campos vacíos** — ver §4.5. Compartir la referencia del array hace que el form edite el array del store en vivo, y no normalizar los `null` rompe `isDirty` (el form aparece sucio al abrirse).
- **No re-implementar el estado del modal de borrado en la página** (`deleteId` + `showDeleteConfirm` + `confirmDelete`). Usar `useDeleteConfirm`.
- **No usar `<select>` para referencias a entidades con muchos registros** (proveedores, productos). Declarar el campo como `type: "combobox"`.
- **No crear un hook en `application/hooks/` sin call site** — un hook sin consumidor es código muerto con tests. El POS de Ventas ya no tiene hooks: su estado vive en los componentes que lo poseen.
- **No escribir literales de color** (`#hex`, `rgb()`, `rgba()`, `hsl()`) fuera de `src/styles/variables.css`. Si el color no existe como token, **se agrega el token** (§1.5).
- **No usar `--primary` ni `--text-muted` como color de texto** sobre superficie clara — 1.53:1 y 2.42:1. Son rellenos y metadatos. Para texto: `--text-primary` o `--text-secondary`.
- **No dejar IA slop**: comentarios que narran lo que el código ya dice, bloques de prosa dentro del código, abstracciones que sólo envuelven una línea, helpers que nadie llama, ramas "por si acaso" que nadie pidió. Si un comentario no evita una pregunta, no va.

---

## 4.10 Niveles de decisión (PRINCIPIO vs. STACK)

Este MD mezcla dos niveles que es importante separar:

- **`[PRINCIPIO]`** — patrón/regla transferible a cualquier stack React/TS. El próximo dev puede aplicarlo en otro proyecto (con Redux en vez de Zustand, Tailwind en vez de CSS Modules, TanStack Query en vez de fetch propio) sin que el principio cambie.
- **`[STACK]`** — decisión atada al stack actual del proyecto (Zustand, CSS Modules, react-i18next con detección custom, Vite 5, etc.). Es detalle de implementación, no regla general. En otro proyecto se reemplaza.

### Ejemplos de cada nivel

**PRINCIPIO** (replicables en cualquier proyecto React/TS):
- Shape universal de stores: `items[]`, `loading`, `error`, `totalCount`, `pageCount`, CRUD simétrico. Mutaciones re-throw, readers no.
- Service shape canónico: `export const xService = { async methodName(...) }` — object literal, sin clases.
- Hooks genéricos tipados: `useFilter<T>`, `useCrudForm<T>`, `usePagination` con `getInfo(total)` que delega a utils.
- UI primitives: `Table<T>` con auto action column, `Pagination` con ellipsis via `-1`, `Modal` con portal + escape + scroll-lock.
- Auth flow end-to-end: Login → service → store → navigate; 401 → interceptor → custom event → listener reactivo → navigate con `state: { expired: true }`.
- Convenciones de error: `error instanceof Error ? err.message : "fallback"` en stores; mutations re-throw; readers no.
- Naming: stores `use{Entity}Store`, services `{entity}Service`, hooks genéricos `use{Name}`, hooks de dominio `use{Name}{Action}`.
- Anti-patterns: no fetch directo en services, no barrel exports nuevos, no mezclar español/inglés en la misma entidad, no `useEffect` para sincronizar state derivado.

**STACK** (específico de este proyecto, adaptable):
- Zustand con middleware `persist` y storage dual localStorage/sessionStorage → en otro proyecto puede ser Redux Toolkit, TanStack Query, Jotai, etc.
- CSS Modules + `styles/variables.css` → en otro proyecto puede ser Tailwind, styled-components, CSS-in-JS, etc.
- `fetchWithAuth` propio con `window.dispatchEvent(new CustomEvent(...))` → en otro proyecto puede ser Axios + interceptors, TanStack Query, RTK Query, etc.
- `react-i18next` con detección custom (sin `i18next-browser-languagedetector`) → en otro proyecto puede ser `next-intl`, `react-intl`, i18next con detector estándar.
- Vite 5 + Vitest 1 → en otro proyecto puede ser Next.js, Remix, Webpack, Jest, etc.
- `useState` local para auth (Login/Register) en vez de `useCrudForm` — quirk de este proyecto, decisión intencional.

### Cómo leer las secciones etiquetadas

Cuando veas `[PRINCIPIO]` en un heading, leelo como una **regla que te comprometés a aplicar** — da igual el stack. Si tu próximo proyecto es con Redux en vez de Zustand, el shape de los stores sigue siendo el mismo.

Cuando veas `[STACK]` en un heading, leelo como **cómo se implementa acá** — útil como referencia, pero adaptalo a tu stack antes de aplicar.

Cuando veas `[PRINCIPIO + STACK]`, el **concepto bajo el heading es principio** (replicable), pero **el snippet mostrado usa el stack de este proyecto** — copialo como inspiración, no como código literal si cambiás de stack.

### Implicación para la futura skill OpenCode

Una skill basada en este MD debería poder distinguir:
- **Reglas duras** (PRINCIPIO) — aplicar siempre.
- **Configuración de stack** (STACK) — preguntar o asumir defaults razonables.

No todo lo del MD es replicable palabra por palabra. Lo que sí lo es: el principio detrás de cada patrón.

---

## 4.11 Contrato auditable (resumen)

> Esta sección es el **TL;DR ejecutable** del documento. Si la skill OpenCode futura solo puede leer 10% de este MD, que sea esto.

### Mapping de tags (no negociable ↔ flexible)

Para evitar que un lector nuevo tenga que inferir el significado, los términos canónicos son:

- **`[PRINCIPIO]`** = **no negociable** = replicar en cualquier proyecto React/TS, sin importar el stack elegido.
- **`[STACK]`** = **flexible** = decisión atada a este stack concreto (Zustand, Vite, react-i18next); en otro proyecto se reemplaza por la alternativa equivalente.
- **`[PRINCIPIO + STACK]`** = el **patrón es no negociable**, pero la **implementación del snippet usa este stack** — copialo como inspiración, no como código literal si cambiás de stack.

### No negociables (replicar siempre)

**Estructura y dependencias (§1.2):**
- Capas concéntricas `pages → components → application → infrastructure`, con la regla explícita: `components` no importan `stores` directamente (salvo `ErrorBoundary` y `NotificationContainer`, que son cross-cutting).
- `infrastructure/api/*` nunca importa React ni hooks — solo `fetch` y tipos. La única excepción justificada es `fetchWithAuth.ts` que lee el token de `useAuthStore.getState()` (es un interceptor global).

**Backend (§2.1):**
- `fetchWithAuth` único wrapper con interceptor 401 → `logout()` + `window.dispatchEvent('auth:session-expired')` + `throw new Error('SESSION_EXPIRED')`.

**Stores — solo el shape (§2.2) — la implementación con Zustand es stack, ver tabla de flexibles:**
- Shape universal de store: `items[]`, `loading: boolean`, `error: string | null`, `totalCount: number`, `pageCount: number` + acciones CRUD simétricas.
- **Mutaciones** (`add`/`update`/`delete`) re-throw — la UI puede reaccionar (toast, cerrar modal).
- **Readers** (`fetch`, `getById`) NO re-throw — el error queda en `state.error` y el componente lo muestra.
- `loading` y `error` son `boolean | null` planos — **no usar `enum`**.

**Hooks genéricos (§2.3):**
- `useFilter<T>` con `searchFields: (item: T) => string[]` como extension point crítico; `filter?` opcional programático.
- `useCrudForm<T>` declarativo con `FormField[]`, validators built-in (`email`, `number` con `min`/`max`/`step`, `file` con `accept`), mutaciones no re-throw (catch interno setea `submitError`), `isDirty` para el estado del footer, y `mapEntityToForm` **obligatorio** cuando el DTO trae arrays o campos vacíos (§4.5).
- `usePagination` con `getInfo(total)` que delega a `utils/pagination.ts` (no conoce el total internamente).
- `useDeleteConfirm` para el modal de borrado: estado + toast, sin coupler con el formulario.

**UI primitives (§2.5):**
- `<Table<T extends { id: TableId }>>` con auto action column cuando hay `onEdit` o `onDelete`.
- `<Pagination>` retorna `null` si `totalPages <= 1`; usa ellipsis via `-1` en `pages`.
- `<Modal>` con `createPortal(..., document.body)` + body scroll lock + Escape listener + click-outside cierra. Es un **shell de tres zonas** (header / body / footer) y el footer lleva el estado de cambios sin guardar (`footerStatus` + `dirty`).
- `<SearchableSelect>` para referencias buscables a otra entidad: filtra por `label` y `description` con `normalizeSearch`, navegable por teclado, con `role="combobox"`.
- `<ErrorBoundary>` **es class component** — única excepción justificada a "no class".

**Conventions (§4.7) — todo esto es no negociable:**
- `strict: true` + `verbatimModuleSyntax: true` + `noUnusedLocals/Parameters`.
- `interface` para objetos, `type` solo para unions/intersections.
- Aislamiento de estilos por componente (sin classname global, sin cascade cross-component). La tecnología concreta (CSS Modules, Tailwind, etc.) es stack — ver tabla de flexibles.
- Single quotes para strings de código, double quotes para strings visibles al usuario.
- `useCallback` para handlers que pasan como props; `useMemo` solo para cálculos pesados.

**Anti-patterns (§4.9) — todos son no negociables, sin excepciones:**
- No `fetch` directo en services (rompe el interceptor 401).
- No duplicar lógica de auth/headers fuera de `fetchWithAuth`.
- No hardcodear `BASE_URL` ni strings user-facing.
- No barrel exports nuevos (excepto `components/UI/index.ts`).
- No `useEffect` para sincronizar state derivado (usar `useMemo`).
- No `useCrudForm` para auth (login/register son casos especiales de 2-5 campos).
- No mezclar español/inglés en la MISMA entidad.
- No `pickKeys` con DTOs que traen arrays o campos vacíos.
- No re-implementar el modal de borrado en la página (usar `useDeleteConfirm`).
- No `<select>` para referencias con muchos registros (usar `combobox`).
- No hooks de dominio sin call site.

### Flexibles (elegir según el stack del proyecto destino)

> **Sobre el alcance de esta tabla**: cuando una fila está marcada con `*(pattern §X.Y)*`, significa que el **patrón subyacente** ya está fijado como no negociable en la sección previa. Esta fila lista solo la **dimensión implementación** (librería concreta); el patrón gana siempre. Filas sin marcador son stack puro (no hay pattern que defender arriba).

| Concepto | Este proyecto | Alternativas comunes |
|---|---|---|
| Estado global *(pattern §2.2)* | Zustand 4 + `persist` middleware + storage dual local/session | Redux Toolkit, Jotai, TanStack Query, Recoil, MobX |
| Fetch + auth wrapper *(pattern §2.1)* | `fetchWithAuth` + 401 → custom event + `fetchWithAuthJson<T>` | **Adapter interno** (1 archivo, 0 services): `fetch` → `axios` · `ky` · `ofetch`. **Wrapper entero** (reescribir services): TanStack Query · RTK Query · SWR · urql |
| Estilos *(pattern §4.7)* | CSS Modules + `styles/variables.css` | Tailwind, styled-components, Emotion, Linaria, Vanilla Extract |
| i18n | `react-i18next` con detección custom (sin `i18next-browser-languagedetector`) | `next-intl`, `react-intl`, i18next con detector estándar, FormatJS |
| Bundler + tests | Vite 5 + Vitest 1 (mismo config, `globals: true`) | Next.js, Remix, Webpack, Jest, Vitest con CRA |
| Routing | React Router v6 con `BrowserRouter` + `<Routes>` | TanStack Router, Next.js App Router, Remix, Wouter |
| Iconos | `lucide-react` (SVG inline) | `react-icons`, `@heroicons/react`, SVGs propios |
| Formularios *(pattern §4.5)* | `useCrudForm` declarativo + `DynamicFormFields` | React Hook Form, Formik, TanStack Form, Final Form |
| Tablas *(pattern §2.5)* | Custom `<Table<T>>` con paginación client-side | TanStack Table, Material Table, AG Grid, MUI DataGrid |
| Charts | `recharts` | Chart.js, Nivo, Visx, D3, Highcharts |
| Persistencia auth | `localStorage` + `sessionStorage` dual via flag `auth-remember` | Cookies httpOnly (server-side), IndexedDB, react-native-async-storage |
| HTTP error shape *(pattern §2.1)* | `ApiError { error: string, details?: string }` | El que devuelva tu backend — definir según contrato |

### Regla de precedencia (PRINCIPIO vs. STACK vs. quirk)

Orden de prioridad cuando hay conflicto:

1. **`[PRINCIPIO]`** gana siempre. Si una convención de §4.7/§4.9 choca con un snippet de §2, respetar §4 y reescribir el snippet.
2. **`[STACK]`** gana sobre **decisiones intencionales (§4.8)** solo si la reescritura no rompe call sites. Si toca call sites, documentar la migración en lugar de hacer el cambio silencioso.
3. **Decisiones intencionales (§4.8)** son las últimas en cambiar. Son quirks históricos con motivo. Antes de "limpiarlas", leer el porqué documentado en cada bullet.

### Implicación para la futura skill OpenCode

Una skill basada en este MD debe poder distinguir, **sin volver a leer las 3.800 líneas**:

- **Reglas duras (PRINCIPIO)** — aplicar siempre, sin preguntar.
- **Configuración de stack (STACK)** — preguntar al usuario o asumir defaults razonables según el proyecto destino (ver tabla de alternativas arriba).
- **Decisiones intencionales (§4.8)** — preservar tal cual, salvo pedido explícito del usuario.

Si la skill tiene que elegir entre dos patrones del doc, gana el de mayor nivel en el orden PRINCIPIO > STACK > quirk.

---

# FIN

Este MD es el contrato de la skill `volterp-frontend-style`. El próximo paso es:

1. Revisar este MD con el usuario.
2. Convertirlo en una skill OpenCode registrada en `~/.config/opencode/skills/volterp-frontend-style/SKILL.md`.
3. Crear un script `new-volterp-frontend.sh` que genere la estructura a partir del template.
4. Usar la skill en el próximo proyecto frontend Volterp (o derivado) que pida el usuario.