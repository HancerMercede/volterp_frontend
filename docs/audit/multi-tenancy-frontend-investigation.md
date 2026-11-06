# Auditoría exhaustiva de Multi-Tenancy — Frontend

**Proyecto:** Volterp ERP (React 19 + TypeScript + Vite + Zustand + React Router v7)
**Alcance:** Frontend completo (`src/`). Backend NO auditado.
**Tipo de auditoría:** READ-ONLY — no se modificó ningún archivo de la aplicación.
**Fecha:** 25/09/2026

---

## 1. Resumen ejecutivo

El frontend NO implementa multi-tenancy activo. La segregación entre empresas se delega **completamente al backend**, asumiendo que el JWT lleva el `companyId` y que cada endpoint lo filtra server-side. El frontend solo conoce dos datos: el `companyId` recibido en el body del login (almacenado en `authStore.user.companyId`) y un `currentCompany` opcional cargado perezosamente desde `companyService.getCompany(id)`.

**Hallazgos principales:**

1. 🔴 **`Register.tsx:6` hardcodea `const COMPANY_ID = 1`** — todo usuario nuevo se asigna a la empresa 1, sin importar el contexto.
2. 🔴 **`Inventario.tsx:131` usa `companyId: currentCompany?.id || 1`** — fallback a empresa 1 cuando `currentCompany` aún no está cargado (race condition real en el mount).
3. 🔴 **`fetchWithAuth.ts` no inyecta `X-Company-Id`** — la segregación depende 100% del JWT y de la enforcement del backend. No hay defensa en profundidad.
4. 🟡 **Stores con `persist` (`producto`, `venta`, `proveedor`, `category`, `company`) NO se limpian en logout** — datos stale de sesiones previas persisten en `localStorage`, accesibles a cualquier usuario que abra la app en la misma máquina.
5. 🟡 **`isAdmin` está mal definido en `usePermission.ts:23`** — solo es `true` para `SUPER_ADMIN`, pero ADMIN tiene la misma matriz de permisos que SUPER_ADMIN. Consecuencia: los administradores reales no ven las pestañas "Empresas" / "Usuarios" en `Configuracion.tsx:72`.
6. 🟡 **JWT se decodifica solo para `exp`** (`utils/jwt.ts:24`). El `companyId` del payload del token nunca se contrasta contra el `user.companyId` recibido en el body.

**Riesgo global de seguridad multi-tenant en frontend:** MEDIO-ALTO. La arquitectura es válida si (y solo si) el backend valida correctamente el `companyId` del token en cada endpoint. Sin embargo, hay tres puertas abiertas en frontend (registro, fallback de inventario, falta de limpieza post-logout) que rompen el aislamiento en escenarios concretos.

---

## 2. Arquitectura actual del multi-tenancy

### Diagrama de flujo

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                                                                          │
│  Login.tsx ──POST /api/auth/login──►                                     │
│     │                                                                     │
│     ▼                                                                     │
│  LoginResponse { token, companyId, role, ... }                          │
│     │                                                                     │
│     ├──► authStore.user.companyId  (persistido en localStorage)          │
│     └──► authStore.token           (persistido en localStorage)          │
│                                                                          │
│  fetchWithAuth (todas las requests)                                      │
│     │                                                                     │
│     ├── Authorization: Bearer <token>    ◄── ÚNICO header inyectado      │
│     └── ✗ NO envía X-Company-Id                                         │
│         ✗ NO envía ?companyId= como query                               │
│                                                                          │
│  fetchCurrentCompany(user.companyId)                                     │
│     │                                                                     │
│     ▼                                                                     │
│  companyStore.currentCompany  (NO persistido)                           │
│     │                                                                     │
│     └── usado solo en: Configuracion, Ventas, Inventario, useVentaForm   │
│                                                                          │
│  Persisted stores (post-login):                                         │
│     producto-storage, venta-storage, proveedor-storage,                  │
│     category-storage, company-storage                                    │
│     ✗ NO se limpian en logout                                           │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              │  (asume backend filtra por companyId del JWT)
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (no auditado)                       │
│     /api/products    /api/clients    /api/sales    /api/companies       │
│     etc.                                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Fuente de verdad del `companyId`

| Capa | Quién lo posee | Persistido | Confiable |
|------|----------------|------------|-----------|
| JWT (claim) | Backend | En storage como parte del token | Depende de backend |
| `authStore.user.companyId` | Backend (body del login) | Sí (`auth-storage`) | **No validado contra JWT** |
| `companyStore.currentCompany.id` | Backend (`GET /api/companies/{id}`) | **No** | Sí (roundtrip al backend) |
| Hardcoded `1` | Frontend (bug) | N/A | **No** — apertura a leakage |

**Observación crítica:** el frontend tiene DOS fuentes de `companyId` potencialmente divergentes: el del body del login (cacheado en `authStore`) y el que vive en el JWT. No existe código que los reconcilie. Si el backend modifica el `companyId` del usuario (por ejemplo, al cambiarlo de empresa) sin invalidar tokens, el frontend seguirá mostrando el `companyId` viejo hasta el siguiente login.

---

## 3. Inventario por capa

### 3.1 Autenticación y carga del `companyId`

#### `src/stores/authStore.ts`

- **Línea 10:** `companyId: number;` — el campo existe en el modelo `User`.
- **Línea 19:** `login: (user: User, token: string, rememberMe?: boolean) => void` — recibe el user con `companyId` ya seteado.
- **Línea 62-69:** `persist` con nombre `auth-storage` y storage custom que alterna entre `localStorage` y `sessionStorage` según `auth-remember`. Esto implica que el `companyId` (parte del `user`) persiste en disco.
- **Línea 50:** `getTokenExpiry(token)` se llama en cada login. Solo extrae `exp`, no `companyId`.

**Observación:** el `companyId` se persiste como parte del objeto `user` completo. No hay validación cruzada con el JWT.

#### `src/utils/jwt.ts`

- **Línea 6-18:** `decodePayload` decodifica base64url pero NO expone el payload.
- **Línea 24-28:** `getTokenExpiry` extrae solo `exp`.
- **Línea 33-37:** `isTokenExpired`.
- **Línea 43-47:** `msUntilExpiry`.

**Hallazgo 🟡:** el JWT puede contener un claim `companyId` (es práctica común en sistemas multi-tenant), pero el frontend nunca lo lee. Si el body del login miente sobre el `companyId`, el frontend no tiene forma de detectarlo.

#### `src/infrastructure/api/authService.ts`

- **Línea 10-19:** `login()` hace POST a `/api/auth/login`. Devuelve `LoginResponse` con `companyId`.
- **Línea 21-30:** `register()` hace POST a `/api/auth/register`. Acepta `companyId` desde el cliente.

**Hallazgo 🔴:** el endpoint de register acepta `companyId` desde el frontend. Combinado con `Register.tsx:6` que hardcodea `1`, esto significa que el frontend está MANDANDO al backend a qué empresa pertenece el usuario. Si el backend no hace validación cruzada (compara contra el `companyId` del token del admin que llama, o contra una lista permitida), un atacante podría registrar usuarios en cualquier empresa.

#### `src/infrastructure/api/types.ts`

- **Línea 6-13:** `LoginResponse` incluye `companyId: number`.
- **Línea 15-22:** `RegisterRequest` requiere `companyId: number` (campo obligatorio).

**Observación:** `RegisterRequest.companyId` es obligatorio. Esto refuerza el problema: si el frontend siempre manda `1`, todos los usuarios auto-registrados van a parar a la empresa 1.

#### `src/pages/Login/Login.tsx`

- **Línea 42-52:** toma la respuesta, construye un `user` con `companyId: response.companyId` y llama `login(user, response.token, rememberMe)`.
- **Línea 53:** `navigate("/")` — sin chequeo de role/company.

**Observación:** el flujo asume que el usuario pertenece a UNA sola empresa. No hay manejo de "el usuario pertenece a varias companies" porque el modelo `User` solo tiene un `companyId`.

#### `src/pages/Register/Register.tsx`

- **Línea 6:** `const COMPANY_ID = 1;` — constante hardcoded.
- **Línea 42:** `companyId: COMPANY_ID` — se envía en cada registro.

**Hallazgo 🔴 (ver §4):** ver hallazgo crítico #2.

### 3.2 Capa `infrastructure/api/**`

#### Tabla resumen

| Servicio | Archivo | ¿Filtra por company? | ¿Envía header / query explícito? | Observación |
|----------|---------|----------------------|----------------------------------|-------------|
| `authService` | `authService.ts:10-30` | N/A | Solo `Authorization` | Acepta `companyId` del cliente en `register` |
| `companyService` | `companyService.ts:5-52` | NO | Solo `Authorization` | `getCompany(id)` recibe el id arbitrario del frontend |
| `clientService` | `clientService.ts:5-50` | NO | Solo `Authorization` | CRUD plano, sin scope |
| `saleService` | `saleService.ts:10-93` | NO (en GET) | Solo `Authorization` | `createSale` SÍ envía `companyId` en el body |
| `purchaseService` | `purchaseService.ts:9-56` | NO | Solo `Authorization` | Sin scope |
| `productService` | `productService.ts:6-53` | NO | Solo `Authorization` | Sin scope |
| `supplierService` | `supplierService.ts:9-56` | NO | Solo `Authorization` | Sin scope |
| `employeeService` | `employeeService.ts:9-56` | NO | Solo `Authorization` | Sin scope |
| `accountingTransactionService` | `accountingTransactionService.ts:9-61` | NO | Solo `Authorization` | Sin scope |
| `categoryService` | `categoryService.ts:5-42` | NO | Solo `Authorization` | Sin scope |
| `proyectoService` | `proyectoService.ts:5-50` | NO | Solo `Authorization` | Sin scope |
| `dashboardService` | `dashboardService.ts:5-10` | NO | Solo `Authorization` | Un solo endpoint agregado |
| `userService` | `userService.ts:5-62` | NO | Solo `Authorization` | `createUser` NO inyecta `companyId` desde el token |

**Hallazgo 🔴 (ver §4):** ninguno de los servicios envía `X-Company-Id` ni query param de company. El grep `X-Company-Id` sobre `src/` no encontró NINGÚN match. Esto significa que el backend NO recibe ninguna señal explícita de "esta request es para la empresa X" — solo el JWT.

#### Detalles por servicio

##### `fetchWithAuth.ts`

- **Línea 11-41:** `fetchWithAuth` solo añade `Authorization: Bearer <token>`.
- **Línea 26-31:** en 401 hace `logout()` y dispatch de `auth:session-expired`.
- **No añade `X-Company-Id` en ninguna rama del flujo.**

##### `saleService.ts`

- **Línea 57-65:** `createSale(data)` recibe `CreateSaleRequest` que incluye `companyId: number` (`types.ts:73-81`). El frontend DEBE setearlo correctamente.
- **Línea 67-75:** `updateSale(id, data)` — `UpdateSaleRequest` NO incluye `companyId` (`types.ts:83-90`). Solo se manda el `companyId` en creación, no en update. Si el backend usa este campo para validar scope en update, hay inconsistencia.

##### `userService.ts`

- **Línea 25-33:** `createUser(data: CreateUserRequest)`. `CreateUserRequest.companyId` es **opcional** (`types.ts:330-337`: `companyId?: number`).
- **No se inyecta `useAuthStore.getState().user.companyId` antes de llamar al servicio.**
- **Riesgo:** un admin podría crear un usuario que termine sin `companyId`, o el backend podría asignarlo a company 1 por default. El frontend no tiene cómo enforzar "crear en mi propia empresa".

### 3.3 Capa `stores/**`

#### Tabla resumen

| Store | Archivo | ¿Guarda `companyId` en state? | ¿Filtra acciones por company? | ¿Persiste? | ¿Limpia en logout? |
|-------|---------|-------------------------------|-------------------------------|------------|--------------------|
| `authStore` | `authStore.ts` | Sí, en `user.companyId` | N/A | Sí (`auth-storage`) | Sí (logout limpia) |
| `companyStore` | `companyStore.ts` | Sí, en `currentCompany.id` y `companies[]` | Solo implícitamente via `fetchCurrentCompany(id)` | Parcial: solo `companies` persiste | NO |
| `clienteStore` | `clienteStore.ts` | NO | NO | NO | NO |
| `ventaStore` | `ventaStore.ts` | NO en state (los `SaleDto` traen `companyId` interno) | NO | Sí (`venta-storage`) | NO |
| `compraStore` | `compraStore.ts` | NO | NO | NO | NO |
| `productoStore` | `productoStore.ts` | NO en state | NO | Sí (`producto-storage`) | NO |
| `proveedorStore` | `proveedorStore.ts` | NO | NO | Sí (`proveedor-storage`) | NO |
| `empleadoStore` | `empleadoStore.ts` | NO | NO | NO | NO |
| `transaccionStore` | `transaccionStore.ts` | NO | NO | NO | NO |
| `categoryStore` | `categoryStore.ts` | NO en state (los `CategoryDto` traen `companyId` interno) | NO | Sí (`category-storage`) | NO |
| `proyectoStore` | `proyectoStore.ts` | NO | NO | NO | NO |
| `dashboardStore` | `dashboardStore.ts` | NO | NO | NO | NO |
| `asistenciaStore` | `asistenciaStore.ts` | NO (datos mock) | NO | Sí (`asistencia-storage`) | NO |
| `chatStore` | `chatStore.ts` | NO | NO | NO | NO |
| `uiStore` | `uiStore.ts` | NO | NO | NO | NO |
| `languageStore` | `languageStore.ts` | NO | NO | Sí (`language-storage`) | NO |

#### Detalles relevantes

##### `companyStore.ts`

- **Línea 158-160:** `partialize: (state) => ({ companies: state.companies })` — solo `companies` se persiste, `currentCompany` NO.
- **Línea 38-51:** `fetchCurrentCompany(companyId)` hace `companyService.getCompany(companyId)`. El `companyId` viene del caller.
- **Línea 34:** `clearCompanies` está definido pero NO se llama en ninguna parte (grep no encontró invocaciones).
- **Línea 36:** `clearCurrentCompany` está definido pero NO se llama en ninguna parte.
- **NO hay un "company-switcher"**: no existe acción para cambiar de empresa en runtime. El modelo asume 1 usuario = 1 empresa.

##### `ventaStore.ts`

- **Línea 188-190:** `partialize: (state) => ({ ventas: state.ventas })` — ventas se persisten con su `companyId` interno en cada `SaleDto` (`types.ts:49-60`).
- **Línea 50:** `console.log(result.items)` — log en producción (ver §6).
- **Línea 109-127:** `createVenta(data)` recibe `CreateSaleRequest` con `companyId` desde el caller (`useVentaForm.ts:125` o `NuevaVenta.tsx:88`).

##### `productoStore.ts`, `proveedorStore.ts`, `categoryStore.ts`

- Misma estructura: persist + sin limpieza en logout.
- Productos, proveedores y categorías se cachean en `localStorage` con sus `companyId` interno en cada DTO.

##### `asistenciaStore.ts`

- **Línea 26-29:** inicializa con datos **mock** (`configuracionAsistenciaDefault`, `horariosMock`, `registrosAsistenciaMock`) y los persiste (`name: 'asistencia-storage'`).
- **No tiene scoping por company** — el dominio de asistencia en frontend es independiente del backend.

### 3.4 Capa de UI

#### `src/components/Layout/Layout.tsx`

- **Línea 1-32:** Layout genérico, no muestra ni maneja company.
- Solo monta `useTokenExpiry` para auto-logout.

#### `src/components/Layout/Sidebar.tsx`

- **Línea 113-132:** muestra `user?.fullName` y el rol, pero **NO muestra la empresa actual**.
- **Línea 66:** filtra `MODULOS` por permisos del rol.
- **NO hay switcher de empresa** — la UI asume que el usuario pertenece a una sola empresa.

#### `src/components/UserManagement/UserManagement.tsx`

- **Línea 56:** `console.log(currentRole)` — log en producción (ver §6).
- **Línea 95-115:** `handleCreate` llama `userService.createUser({ ...newUser, role: ... })`. **NO inyecta `companyId`**.
- **Línea 24-40:** diferencia entre `BASIC_ROLES` y `ALL_ROLES` por `isSuperAdmin`. Pero:
  - **Línea 57:** `const isSuperAdmin = currentRole === Rol.SUPER_ADMIN`
  - `usePermission.ts:23`: `const isAdmin = userRole === Rol.SUPER_ADMIN`
  - **Esto significa que un usuario con rol `ADMIN` NO ve el botón "Nuevo Usuario"** porque `UserManagement` solo se monta dentro de `Configuracion.tsx:72` que gatekea con `isAdmin`. Ver §4.

#### `src/pages/Configuracion/Configuracion.tsx`

- **Línea 15:** `const { isAdmin } = usePermission()` — `isAdmin = (rol === SUPER_ADMIN)`.
- **Línea 53-57:** si hay `user.companyId`, llama `fetchCurrentCompany(user.companyId)`. Si no, queda en null.
- **Línea 72:** `{isAdmin && (<div className={styles.tabs}>...)}` — SOLO SUPER_ADMIN ve las pestañas "Empresas" y "Usuarios".

#### `src/pages/Configuracion/Empresas.tsx`

- **Línea 36-45:** usa `companyStore.companies`, llama `fetchCompanies(pageNumber, ITEMS_PER_PAGE)`.
- **Línea 90-94:** `useFilter` filtra localmente por `name`, `taxId`, `email`.
- **NO filtra por `companyId` del usuario actual** — confía en que el backend ya devuelve solo las empresas que el usuario puede ver.

#### `src/pages/Inventario/Inventario.tsx`

- **Línea 41:** `const { currentCompany } = useCompanyStore()` — lee currentCompany.
- **Línea 131:** `companyId: currentCompany?.id || 1` — 🔴 fallback a `1` (ver §4).
- **Línea 57-59:** al montar, llama `fetchProductos(pageNumber, ITEMS_PER_PAGE)` sin esperar a que `currentCompany` se cargue. Esto significa que en el primer render `currentCompany` puede ser null y la creación de producto puede usar `1` como companyId.

#### `src/pages/Ventas/Ventas.tsx`

- **Línea 36-38:** `if (!currentCompany && user?.companyId) fetchCurrentCompany(user.companyId)` — al menos intenta cargar la empresa al entrar.
- **Línea 17-23:** mismo patrón que Inventario pero más cuidadoso: primero asegura `currentCompany`.

#### `src/pages/Ventas/components/NuevaVenta.tsx`

- **Línea 26:** lee `currentCompany`.
- **Línea 81:** `if (!currentCompany) { addToast(t("ventas.NoCompanySelected"), "error"); return; }` — bloquea si no hay empresa. Buena práctica.
- **Línea 88:** `companyId: currentCompany.id` — usa el id real, sin fallback.

#### `src/application/hooks/useVentaForm.ts`

- **Línea 18:** `const { currentCompany } = useCompanyStore()`.
- **Línea 95-98 y 171-174:** bloquea la operación si `!currentCompany`.
- **Línea 125 y 201:** `companyId: currentCompany.id` — correcto, sin fallback.

### 3.5 Roles / permisos

#### `src/domain/constants/roles.ts`

- **Línea 1-8:** enum `Rol`: `SUPER_ADMIN`, `ADMIN`, `VENTAS`, `INVENTARIO`, `CONTABILIDAD`, `RRHH`.
- **Línea 39-46:** `ROLE_NUMBER_TO_STRING` mapea enteros del backend a roles. `1 → SUPER_ADMIN`, `2 → ADMIN`, etc.
- **Línea 49-55:** `normalizeRole` helper.

**Observación:** los roles son **globales**, no por-empresa. Un usuario `ADMIN` puede administrar cualquier empresa que el backend le permita.

#### `src/domain/constants/permisos.ts`

- **Línea 20-99:** `MATRIZ_PERMISOS`. **Comparando líneas 21-33 (`SUPER_ADMIN`) con líneas 34-46 (`ADMIN`): SON IDÉNTICAS.** Misma matriz para los dos roles.
- **Línea 101-113:** `MODULOS` con 11 módulos.

**Hallazgo 🟡 (ver §4):** `isAdmin` en `usePermission.ts:23` está mal definido — debería ser `userRole === Rol.SUPER_ADMIN || userRole === Rol.ADMIN`. Esto bloquea funciones a los ADMIN reales.

#### `src/hooks/usePermission.ts`

- **Línea 22-23:** `const userRole = user?.role ? (user.role.toLowerCase() as Rol) : null; const isAdmin = userRole === Rol.SUPER_ADMIN;`
- **Línea 25-28:** `hasPermission` consulta `MATRIZ_PERMISOS[userRole]?.[modulo]?.[permiso]`.

**Observación:** los permisos no se almacenan por-company. Si el usuario pertenece a varias empresas con roles distintos, el modelo no lo soporta.

### 3.6 Routing y guards

#### `src/App.tsx`

- **Línea 84-90:** `ProtectedRoute` solo chequea `isAuthenticated` y `hasHydrated`. NO chequea rol, NO chequea company.
- **Línea 92-123:** `AppRoutes` define las rutas protegidas. No hay `RequireRole` ni `RequireCompany`.
- **Línea 96-97:** `/login` y `/register` son las únicas rutas públicas.

**Observación:** el control de acceso por rol/company es enteramente client-side vía `usePermission` y `MODULOS` (Sidebar filtra). El backend DEBE enforce estas reglas independientemente.

---

## 4. Hallazgos críticos (🔴)

### 🔴 HC-1: `Register.tsx` hardcodea el `companyId` a `1`

**Archivo:** `src/pages/Register/Register.tsx`
**Línea:** 6
**Cita:**
```typescript
const COMPANY_ID = 1;
```
**Línea 42:**
```typescript
await authService.register({
  username, password, email, fullName,
  companyId: COMPANY_ID,
});
```

**Impacto:** TODOS los usuarios auto-registrados se asignan a la empresa con `id = 1`, sin importar a qué empresa pertenezcan realmente. Esto es un fallo grave de aislamiento multi-tenant: si en producción hay 3 empresas, los nuevos registros van todos a la empresa 1 por diseño del frontend.

**Recomendación:**
- Corto plazo: el flujo de auto-registro NO debería existir si el sistema es multi-tenant. La creación de usuarios debería hacerse exclusivamente desde `UserManagement` (admin invite).
- Mediano plazo: si el auto-registro se mantiene, debería pedir al usuario un código de invitación o un subdominio, y el frontend no debería mandar `companyId` — debería ser el backend quien lo asigne (o el código de invitación el que lo indique).

---

### 🔴 HC-2: `Inventario.tsx` usa `currentCompany?.id || 1` como fallback

**Archivo:** `src/pages/Inventario/Inventario.tsx`
**Línea:** 131
**Cita:**
```typescript
await createProducto({
  ...
  categoryId: catId,
  companyId: currentCompany?.id || 1,
  imageUrl: data.imageUrl || null,
});
```

**Impacto:** `currentCompany` no se persiste (ver §3.3) y se carga de forma asíncrona. Si el usuario abre el modal de crear producto antes de que `fetchCurrentCompany` haya completado (race condition real en el mount de `Inventario.tsx`, donde NO se llama `fetchCurrentCompany` como sí hace `Ventas.tsx:36`), el producto se crea con `companyId = 1`. Esto contamina la empresa 1 con productos de otras empresas.

Comparación directa:
- `Ventas.tsx:36-38`: SÍ llama `fetchCurrentCompany` al montar.
- `Inventario.tsx:57-59`: NO llama `fetchCurrentCompany`. Solo `fetchProductos` y `fetchCategories`.

**Recomendación:**
- Eliminar el fallback `|| 1`. Si `currentCompany` es null, BLOQUEAR la operación (como hace `NuevaVenta.tsx:81`).
- Llamar `fetchCurrentCompany(user.companyId)` en el `useEffect` de mount.
- Persistir `currentCompany` en `companyStore` para evitar el fetch redundante.

---

### 🔴 HC-3: `fetchWithAuth` no envía `X-Company-Id` ni query param de company

**Archivo:** `src/infrastructure/api/fetchWithAuth.ts`
**Líneas:** 11-41
**Cita:**
```typescript
const response = await fetch(url, {
  ...options,
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  },
});
```

**Búsqueda de evidencia:** `grep -ri "X-Company-Id|x-company-id" src/` → **0 matches**.

**Impacto:** toda la segregación multi-tenant depende de que:
1. El JWT incluya el `companyId` como claim.
2. El backend valide ese `companyId` en CADA query SQL / ORM filter.
3. El backend rechace requests donde el `companyId` del recurso solicitado no coincida con el del token.

**No hay defensa en profundidad.** Si el backend tiene un solo endpoint que olvida filtrar, hay leakage. El frontend no está ayudando a prevenirlo.

**Recomendación:**
- Agregar `X-Company-Id: <companyId>` (o query `?companyId=...`) en `fetchWithAuth` leyendo `useAuthStore.getState().user.companyId`. Esto permite que el backend tenga DOBLE validación (token + header) sin que el frontend pueda falsificar fácilmente el header sin falsificar el token.
- Documentar explícitamente en el README que el backend DEBE filtrar por el claim del JWT.
- Auditar el backend para confirmar que TODOS los endpoints filtran por company.

---

## 5. Hallazgos importantes (🟡)

### 🟡 HI-1: Stores con `persist` no se limpian en logout

**Archivos:**
- `src/stores/productoStore.ts:111` (`producto-storage`)
- `src/stores\ventaStore.ts:188` (`venta-storage`)
- `src/stores/proveedorStore.ts:112` (`proveedor-storage`)
- `src/stores/categoryStore.ts:53` (`category-storage`)
- `src/stores/companyStore.ts:158` (`company-storage`)
- `src/stores/asistenciaStore.ts:152` (`asistencia-storage`)
- `src/stores/languageStore.ts:21` (`language-storage` — este OK, no tiene datos sensibles)

**Cita (ejemplo `ventaStore.ts:186-191`):**
```typescript
{
  name: "venta-storage",
  partialize: (state) => ({ ventas: state.ventas }),
}
```

**Cita del logout (`authStore.ts:54-57`):**
```typescript
logout: () => {
  localStorage.removeItem("auth-remember");
  set({ user: null, token: null, expiresAt: null, isAuthenticated: false });
},
```

El logout **NO limpia** ninguno de los otros stores.

**Impacto:**
1. Un usuario A inicia sesión, carga ventas de empresa A. Cierra sesión.
2. Un usuario B abre la app en la misma máquina. `zustand/persist` rehidrata las ventas de A desde `localStorage` ANTES de que el nuevo fetch termine.
3. El usuario B ve momentáneamente datos de A.

Esto NO es un fallo de seguridad per se (los datos vienen del backend en el siguiente fetch), pero es una ventana de "stale data leak" visible. En escenarios donde dos usuarios comparten máquina (kiosko, sesión compartida, demo), es un problema de UX y de cumplimiento (GDPR / datos personales visibles).

**Recomendación:**
- En `logout` (o en el `onRehydrateStorage` de cada store) verificar que el `token` actual coincide con el del momento del persist. Si no, limpiar.
- Alternativa simple: en el logout, limpiar `localStorage`/`sessionStorage` de las keys de store persistidas.

---

### 🟡 HI-2: `isAdmin` está mal definido y bloquea a ADMIN reales

**Archivo:** `src/hooks/usePermission.ts`
**Línea:** 23
**Cita:**
```typescript
const isAdmin = userRole === Rol.SUPER_ADMIN;
```

**Archivo:** `src/domain/constants/permisos.ts`
**Líneas:** 21-46 — `SUPER_ADMIN` y `ADMIN` tienen **idéntica** matriz de permisos.

**Consecuencia:**
- `Configuracion.tsx:15, 72` — `isAdmin && (<div className={styles.tabs}>...)` — solo SUPER_ADMIN ve las pestañas "Empresas" y "Usuarios".
- `UserManagement.tsx:57` — `isSuperAdmin = currentRole === Rol.SUPER_ADMIN` — solo SUPER_ADMIN puede asignar rol `SUPER_ADMIN` (esto sí es correcto), pero un ADMIN legítimo no puede gestionar usuarios de su propia empresa.

**Impacto:** funcional. Los ADMIN no pueden usar `UserManagement` ni la pestaña `Empresas`. No es un fallo de seguridad, pero es un bug de producto.

**Recomendación:**
- Cambiar la línea 23 a: `const isAdmin = userRole === Rol.SUPER_ADMIN || userRole === Rol.ADMIN;`
- Crear dos flags: `isSuperAdmin` (solo SUPER_ADMIN) y `isAdmin` (SUPER_ADMIN || ADMIN), usarlos según contexto.

---

### 🟡 HI-3: `currentCompany` no persiste; cada componente re-fetcha

**Archivo:** `src/stores/companyStore.ts`
**Líneas:** 158-160
**Cita:**
```typescript
{
  name: "company-storage",
  partialize: (state) => ({ companies: state.companies }),
}
```

**Evidencia de re-fetches redundantes:**
- `Configuracion.tsx:53-57` — `useEffect` llama `fetchCurrentCompany(user.companyId)` al montar.
- `Ventas.tsx:36-38` — `useEffect` llama `fetchCurrentCompany(user.companyId)` si `currentCompany` es null.
- `Inventario.tsx` — NO llama, pero lo necesita (ver HC-2).

**Impacto:** UX. Cada vez que el usuario navega a Configuración, Ventas, etc., se hace un roundtrip extra al backend para obtener datos que ya teníamos. Si el usuario pierde conexión, `currentCompany` queda null y las operaciones fallan o usan el fallback `|| 1`.

**Recomendación:**
- Persistir `currentCompany` en `companyStore` (con `partialize: (state) => ({ companies, currentCompany })`).
- O, mejor aún: hidratar `currentCompany` directamente desde `authStore.user.companyId` en el boot (solo el `id`, no el objeto completo; el objeto se carga on-demand).

---

### 🟡 HI-4: JWT no se decodifica para validar `companyId`

**Archivo:** `src/utils/jwt.ts`
**Líneas:** 6-28 — `decodePayload` y `getTokenExpiry` solo exponen `exp`.

**Impacto:** el `companyId` recibido en el body del login (`LoginResponse.companyId`) podría divergir del `companyId` que el backend usa realmente (claim del JWT). El frontend no valida esto.

**Escenario:** un usuario cambia de empresa. El backend emite un nuevo token con `companyId: 2` pero, por un bug, devuelve `companyId: 1` en el body. El frontend trabaja con `1` durante toda la sesión, enviando productos/ventas a la empresa equivocada (la que el backend cree correcta es la 2; la que el frontend muestra es la 1).

**Recomendación:**
- Agregar `getCompanyIdFromToken(token): number | null` en `jwt.ts`.
- En `authStore.login`, comparar `getCompanyIdFromToken(token)` con `user.companyId`. Si difieren, rechazar el login.
- (Asume que el JWT sí incluye el claim `companyId` — confirmarlo con backend.)

---

### 🟡 HI-5: `userService.createUser` no inyecta `companyId`

**Archivo:** `src/components/UserManagement/UserManagement.tsx`
**Líneas:** 95-115
**Cita:**
```typescript
const created = await userService.createUser({
  ...newUser,
  role: newUser.role === "ventas" ? "ventas" : newUser.role,
});
```

**Archivo:** `src/domain/types/index.ts`
**Línea:** 336 — `companyId?: number;` (OPCIONAL en `CreateUserRequest`).

**Impacto:** un admin crea un usuario sin `companyId`. El frontend confía en que el backend asigne el `companyId` desde el token del admin. Si el backend NO hace esto, el usuario queda sin empresa asignada (null) y el comportamiento es indefinido.

**Recomendación:**
- En `handleCreate`, inyectar `companyId: useAuthStore.getState().user.companyId` antes de llamar al servicio.
- En el service layer (`userService.ts`), también inyectarlo como defensa en profundidad.

---

### 🟡 HI-6: `getCompanies` puede devolver TODAS las empresas del sistema

**Archivo:** `src/infrastructure/api/companyService.ts`
**Líneas:** 6-17
**Cita:**
```typescript
async getCompanies(pageNumber, pageSize) {
  ...
  return fetchWithAuthJson(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COMPANIES}?${params}`);
}
```

**Archivo:** `src/pages/Configuracion/Empresas.tsx`
**Líneas:** 36-46 — lista plana de companies.

**Observación:** no hay evidencia de que el backend filtre por `companyId` del token. Si el admin lista companies desde la pestaña `Empresas`, podría ver empresas que NO son la suya. El grep confirma que no se envía `?companyId=` ni `X-Company-Id`.

**Impacto:** depende del backend. Si el backend filtra (devuelve solo la empresa del usuario para ADMIN, todas para SUPER_ADMIN), OK. Si no, hay leakage horizontal entre empresas en la pantalla de administración.

**Recomendación:**
- Confirmar el comportamiento esperado con backend.
- Si el backend NO filtra, agregar `X-Company-Id` o similar.

---

## 6. Hallazgos menores (🟢)

### 🟢 HM-1: `console.log` en producción

**Archivo 1:** `src/stores/ventaStore.ts:50`
```typescript
console.log(result.items);
```

**Archivo 2:** `src/components/UserManagement/UserManagement.tsx:56`
```typescript
console.log(currentRole);
```

**Impacto:** ruido en consola, potencial fuga de datos (en `ventaStore`, items puede contener precios, clientes, totales).

**Recomendación:** eliminar o gatekear con `import.meta.env.DEV`.

---

### 🟢 HM-2: Roles no son por-company

**Archivos:** `src/domain/constants/roles.ts`, `src/domain/constants/permisos.ts`, `src/stores/authStore.ts`.

**Observación:** un usuario tiene UN solo `role` (string) que se aplica globalmente. Si un usuario pertenece a varias empresas con roles distintos (ej. ADMIN en empresa A, VENTAS en empresa B), el modelo no lo soporta.

**Impacto:** limitación funcional. No es un fallo de seguridad per se.

**Recomendación:** evaluar si el producto necesita multi-rol por empresa. Si sí, refactorizar `User` a `UserCompanyMembership[]` con `role` por empresa.

---

### 🟢 HM-3: No hay company-switcher en UI

**Archivos:** `Sidebar.tsx`, `Layout.tsx`.

**Observación:** el modelo asume 1 usuario = 1 empresa. Si el usuario pertenece a varias, no hay forma de cambiar.

**Recomendación:** ver HM-2.

---

### 🟢 HM-4: Inconsistencia entre `CreateSaleRequest` (incluye `companyId`) y `UpdateSaleRequest` (NO incluye `companyId`)

**Archivos:** `src/domain/types/index.ts:73-90`.

**Cita:**
```typescript
// CreateSaleRequest (línea 73-81): SÍ tiene companyId: number
// UpdateSaleRequest (línea 83-90): NO tiene companyId
```

**Impacto:** bajo si el backend resuelve scope desde el token. Alto si el backend usa el `companyId` del body para validar (entonces update queda sin esa validación).

**Recomendación:** documentar la decisión con backend.

---

### 🟢 HM-5: `companies` se persiste — posible cross-session leak

**Archivo:** `src/stores/companyStore.ts:158-160`.

Si el usuario A lista companies y luego cierra sesión, las empresas quedan en `localStorage`. El usuario B las ve hasta el próximo fetch.

**Recomendación:** limpiar en logout (ver HI-1).

---

## 7. Mapa "default company"

**Hallazgo confirmado:** existe una constante hardcoded con valor `1` en dos lugares:

### `src/pages/Register/Register.tsx:6`
```typescript
const COMPANY_ID = 1;
```
Usado en `Register.tsx:42` para asignar a TODO usuario auto-registrado.

### `src/pages/Inventario/Inventario.tsx:131`
```typescript
companyId: currentCompany?.id || 1,
```
Usado como fallback cuando `currentCompany` es null al crear un producto.

**Análisis de riesgo:**

| Ubicación | Tipo | ¿Es fallback legítimo? | ¿Es una apertura a leakage? |
|-----------|------|------------------------|----------------------------|
| `Register.tsx:6` | Default explícito | NO — es una asignación intencional y permanente | **SÍ** — todos los usuarios auto-registrados van a empresa 1 |
| `Inventario.tsx:131` | Fallback por null | NO — debería bloquearse, no caer a 1 | **SÍ** — race condition permite asignar a empresa 1 |

**No hay otras constantes mágicas `companyId = X`** (grep de `companyId:\s*1`, `companyId\s*=\s*1` solo encontró estos dos lugares en código de aplicación; los demás matches son tests).

---

## 8. Recomendaciones priorizadas

### Prioridad 1 (crítico, hacer primero)

#### R1.1 — Eliminar `COMPANY_ID = 1` de `Register.tsx`
- **Problema:** HC-1. Todo nuevo usuario se asigna a empresa 1.
- **Archivos:** `src/pages/Register/Register.tsx:6, 42`.
- **Complejidad:** baja (si se elimina el flujo de auto-registro) o media (si se reemplaza por un sistema de invitaciones).
- **Acción:** decidir si el auto-registro sigue siendo necesario. Si no, eliminar la pantalla y la ruta `/register`. Si sí, eliminar el `COMPANY_ID` y dejar que el backend lo asigne (probablemente requiriendo un código de invitación).

#### R1.2 — Eliminar `|| 1` en `Inventario.tsx`
- **Problema:** HC-2. Productos pueden asignarse a empresa 1 por race condition.
- **Archivos:** `src/pages/Inventario/Inventario.tsx:131`.
- **Complejidad:** baja.
- **Acción:** cambiar a `if (!currentCompany) { addToast(...); return; }` antes de llamar `createProducto`, igual que hace `NuevaVenta.tsx:81`. Agregar `useEffect` para llamar `fetchCurrentCompany(user.companyId)` si no hay `currentCompany`.

#### R1.3 — Confirmar backend y documentar contrato de filtrado
- **Problema:** HC-3. No hay defensa en profundidad.
- **Archivos:** ninguno (acción de coordinación con backend).
- **Complejidad:** media (auditoría del backend).
- **Acción:** confirmar con el equipo backend que TODOS los endpoints filtran por el `companyId` del claim del JWT. Documentar este contrato. Considerar agregar `X-Company-Id` en `fetchWithAuth` como segunda capa.

### Prioridad 2 (importante)

#### R2.1 — Limpiar stores persistidos en logout
- **Problema:** HI-1. Datos stale entre sesiones en la misma máquina.
- **Archivos:** `src/stores/authStore.ts:54-57` + cada store con `persist` (`producto`, `venta`, `proveedor`, `category`, `company`, `asistencia`).
- **Complejidad:** baja-media.
- **Acción:** en `authStore.logout`, después del `set`, limpiar las keys de `localStorage`/`sessionStorage` de los stores persistidos. O usar `useStore.persist.clearStorage()` en cada store.

#### R2.2 — Corregir `isAdmin` en `usePermission.ts`
- **Problema:** HI-2. ADMIN no ve pestañas de gestión.
- **Archivos:** `src/hooks/usePermission.ts:23`.
- **Complejidad:** baja.
- **Acción:** cambiar a `const isAdmin = userRole === Rol.SUPER_ADMIN || userRole === Rol.ADMIN;`. Introducir `isSuperAdmin` por separado.

#### R2.3 — Persistir `currentCompany`
- **Problema:** HI-3. Re-fetch redundante en cada navegación.
- **Archivos:** `src/stores/companyStore.ts:158-160`.
- **Complejidad:** baja.
- **Acción:** cambiar `partialize` a `({ companies: state.companies, currentCompany: state.currentCompany })`.

#### R2.4 — Validar `companyId` del JWT contra body del login
- **Problema:** HI-4. Posible divergencia.
- **Archivos:** `src/utils/jwt.ts` (nuevo método), `src/stores/authStore.ts:48-52`.
- **Complejidad:** baja-media (asume que JWT incluye claim `companyId`; si no, requiere cambio en backend).
- **Acción:** agregar `getCompanyIdFromToken(token)`. En `authStore.login`, comparar contra `user.companyId`. Si difieren, abortar.

#### R2.5 — Inyectar `companyId` en `userService.createUser`
- **Problema:** HI-5. Usuario creado sin empresa asignada.
- **Archivos:** `src/components/UserManagement/UserManagement.tsx:99-103`.
- **Complejidad:** baja.
- **Acción:** agregar `companyId: useAuthStore.getState().user.companyId` al body de `createUser`.

### Prioridad 3 (mejora)

#### R3.1 — Eliminar `console.log` de producción
- **Problema:** HM-1.
- **Archivos:** `src/stores/ventaStore.ts:50`, `src/components/UserManagement/UserManagement.tsx:56`.
- **Complejidad:** trivial.
- **Acción:** eliminar o gatekear con `if (import.meta.env.DEV)`.

#### R3.2 — Evaluar multi-empresa para un mismo usuario
- **Problema:** HM-2, HM-3.
- **Archivos:** modelo de `User`, `roles.ts`, `Sidebar.tsx`, `Login.tsx`.
- **Complejidad:** alta (refactor de modelo).
- **Acción:** reunión de producto para decidir si esto es requisito. Si sí, refactorizar `User` a `UserCompanyMembership[]` con `role` por empresa.

#### R3.3 — Resolver inconsistencia `CreateSaleRequest` vs `UpdateSaleRequest`
- **Problema:** HM-4.
- **Archivos:** `src/domain/types/index.ts:83-90`.
- **Complejidad:** baja.
- **Acción:** confirmar con backend. Si el backend usa `companyId` para validar scope en update, agregarlo a `UpdateSaleRequest`.

---

## 9. Apéndice A — Archivos auditados

### Capa de stores (16 archivos)

- `src/stores/authStore.ts`
- `src/stores/companyStore.ts`
- `src/stores/clienteStore.ts`
- `src/stores/ventaStore.ts`
- `src/stores/compraStore.ts`
- `src/stores/productoStore.ts`
- `src/stores/proveedorStore.ts`
- `src/stores/empleadoStore.ts`
- `src/stores/transaccionStore.ts`
- `src/stores/categoryStore.ts`
- `src/stores/proyectoStore.ts`
- `src/stores/dashboardStore.ts`
- `src/stores/asistenciaStore.ts`
- `src/stores/chatStore.ts`
- `src/stores/uiStore.ts`
- `src/stores/languageStore.ts`

### Capa de infrastructure/api (13 archivos)

- `src/infrastructure/api/fetchWithAuth.ts`
- `src/infrastructure/api/config.ts`
- `src/infrastructure/api/types.ts`
- `src/infrastructure/api/authService.ts`
- `src/infrastructure/api/companyService.ts`
- `src/infrastructure/api/clientService.ts`
- `src/infrastructure/api/saleService.ts`
- `src/infrastructure/api/purchaseService.ts`
- `src/infrastructure/api/productService.ts`
- `src/infrastructure/api/supplierService.ts`
- `src/infrastructure/api/employeeService.ts`
- `src/infrastructure/api/accountingTransactionService.ts`
- `src/infrastructure/api/categoryService.ts`
- `src/infrastructure/api/proyectoService.ts`
- `src/infrastructure/api/dashboardService.ts`
- `src/infrastructure/api/userService.ts`

### Capa de páginas (3 archivos críticos)

- `src/pages/Login/Login.tsx`
- `src/pages/Register/Register.tsx`
- `src/pages/Configuracion/Configuracion.tsx`
- `src/pages/Configuracion/Empresas.tsx`
- `src/pages/Ventas/Ventas.tsx`
- `src/pages/Ventas/components/NuevaVenta.tsx`
- `src/pages/Inventario/Inventario.tsx`

### Capa de UI / componentes

- `src/components/Layout/Layout.tsx`
- `src/components/Layout/Sidebar.tsx`
- `src/components/UserManagement/UserManagement.tsx`

### Capa de hooks y domain

- `src/hooks/usePermission.ts`
- `src/hooks/useTokenExpiry.ts`
- `src/domain/constants/permisos.ts`
- `src/domain/constants/roles.ts`
- `src/domain/types/index.ts`
- `src/application/hooks/useVentaForm.ts`

### Capa de routing

- `src/App.tsx`

### Utilities

- `src/utils/jwt.ts`

### Archivos NO auditados (mencionados pero no leídos)

- Tests en `src/test/stores/*` (revisados parcialmente vía grep)
- Componentes UI genéricos (Tabla, Modal, etc.) — no contienen lógica de company
- `src/data/asistenciaMockData.ts` — datos mock de asistencia, sin scope

---

## 10. Apéndice B — Preguntas abiertas

1. **¿El JWT incluye un claim `companyId`?** No se pudo confirmar con el frontend. Si lo incluye, R2.4 es viable; si no, requiere cambio en backend.

2. **¿El backend filtra TODOS los endpoints por `companyId` del token?** Crítico para confirmar. Sin esto, el frontend es solo decorativo. Se requiere auditoría del backend.

3. **¿El endpoint `/api/companies` (GET) devuelve TODAS las empresas del sistema o solo las del usuario?** No hay forma de saberlo desde el frontend. Si devuelve todas, hay leakage horizontal entre empresas en la pestaña "Empresas".

4. **¿El endpoint `/api/companies/{id}` valida que el usuario tenga acceso a esa empresa?** `companyService.getCompany(id)` recibe cualquier `id` arbitrario del frontend. Si el backend no valida ownership, un usuario podría ver/editar empresas ajenas.

5. **¿El endpoint `/api/auth/register` acepta el `companyId` desde el body del frontend?** `RegisterRequest.companyId` es obligatorio. Si el backend lo usa tal cual sin validación cruzada, es una apertura crítica. Si lo ignora o lo asigna desde otro lado, el problema es solo del frontend.

6. **¿El flujo de auto-registro (`/register`) es intencional o es legado?** Si no se usa, debería eliminarse.

7. **¿`useAuthStore.user.role` viene como string (`"admin"`) o como número (`2`)?** El código lo normaliza con `normalizeRole` (`roles.ts:49-55`) que acepta ambos, pero conviene confirmar con backend que el contrato es estable.

8. **¿Hay soporte para multi-company en un mismo usuario?** El modelo de `User` no lo soporta, pero el `LoginResponse` solo trae un `companyId`. Si el usuario pertenece a varias, el contrato del backend es deficiente.

9. **¿Cuál es la diferencia funcional esperada entre `SUPER_ADMIN` y `ADMIN`?** La matriz de permisos es idéntica, pero `usePermission.isAdmin` los trata diferente. Esto sugiere que la diferenciación está solo en la UI y no en los permisos efectivos — confirmar el diseño.

10. **¿Los datos mock de `asistenciaStore` (`horariosMock`, `registrosAsistenciaMock`) se usan en producción o solo en desarrollo?** El grep indica que se importan directamente y se persisten. Si van a producción, son datos fantasma que no corresponden a ninguna empresa real.

---

**Fin del reporte.**
