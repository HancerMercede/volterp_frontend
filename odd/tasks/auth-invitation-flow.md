# Auth Invitation Flow — Frontend

## Goal

Reemplazar el auto-registro público por un ciclo de vida de usuario basado en invitaciones: el administrador invita usuarios desde adentro del ERP, el invitado activa su cuenta con un enlace por correo y la recuperación de contraseña funciona con enlaces de restablecimiento. **Solo la interfaz**: los endpoints backend secontratan acá y se implementan del lado servidor después.

- **Branch**: `development` → `feature/auth-invitation-flow`
- **Delivery strategy**: `ask-on-risk` (default)
- **Test runner**: `npx vitest run` (unit) · `yarn build` (typecheck + bundle) · `yarn lint`

## Specs

### S1 — Quitar "Crear cuenta" del login

> "Quitar "Crear cuenta" del login."

> "ya que es un ERP y no vamos a crear usuarios de la forma tradicional los usuarios se crean desde dentro del sistema."

El login **no** ofrece creación de cuenta. Se elimina el enlace, la pantalla, la ruta, el método de servicio, el endpoint y el tipo associated:

- Se elimina el bloque `registerLink` de `src/pages/Login/Login.tsx` y sus reglas CSS de `Login.module.css`.
- Se elimina la página `src/pages/Register/` completa y la ruta `/register` de `src/App.tsx`.
- Se elimina `authService.register`, `API_CONFIG.ENDPOINTS.AUTH.REGISTER` y el tipo `RegisterRequest`.
- Se eliminan las claves i18n `auth.dontHaveAccount` y `auth.createAccount`.

**Criterio de aceptación**: no existe ninguna ruta ni enlace público que permita crear una cuenta. `grep -ri "register" src/` sólo devuelve nombres propios ajenos al flujo.

### S2 — Pantalla "olvidé mi contraseña"

> "Pantallas: olvidé mi contraseña, restablecer, activar cuenta, enlace inválido."

Ruta pública `/forgot-password`. Pide el correo y envía el enlace de restablecimiento. Mensaje **genérico** en respuesta (no revela si el correo existe — anti enumeración de usuarios).

- Estado inicial: campo de correo + botón de envío.
- Estado enviado: confirmación genérica + enlace "Volver al inicio de sesión".
- Errores de red/validación: mensaje en la pantalla.

### S3 — Pantalla "restablecer" contraseña

Ruta pública `/reset-password?token=...`. Lee el token de la query, valida el enlace y, si es válido, muestra el formulario de contraseña nueva + confirmación.

- Token ausente o inválido/expirado → estado de enlace inválido (S5).
- Contraseñas que no coinciden o con menos de 6 caracteres → error en pantalla, sin llamada al backend.

### S4 — Pantalla "activar cuenta"

Ruta pública `/activate-account?token=...`. Lee el token de la query, valida el enlace y, si es válido, muestra el correo de la cuenta (viene de la validación del enlace) + formulario de contraseña nueva + confirmación.

- Token ausente o inválido/expirado → estado de enlace inválido (S5).
- Contraseñas que no coinciden o con menos de 6 caracteres → error en pantalla, sin llamada al backend.

### S5 — Pantalla "enlace inválido"

Ruta pública `/invalid-link`. Explica que el enlace venció o no es válido y ofrece dos salidas: "Solicitar un nuevo enlace" (→ `/forgot-password`) y "Volver al inicio de sesión" (→ `/login`).

- Es un estado reutilizable dentro de S3 y S4 (mismo componente, sin ruta adicional obligatoria).

### S6 — Admin > Usuarios: botón de invitar

> "En Admin > Usuarios: botón de invitar, estados y acciones de reenviar/restablecer."

La pestaña Usuarios (Configuración → Usuarios) **invita** en lugar de crear con contraseña.

- El botón "+ Nuevo Usuario" pasa a "Invitar usuario".
- El modal pide: email (obligatorio), nombre completo (obligatorio), rol (obligatorio), usuario (opcional — si se deja vacío lo deriva el backend).
- El modal **no** pide contraseña: la define el invitado al activar la cuenta.

### S7 — Estados de usuario

La columna "Estado" distingue tres estados, derivados de `UserDto.status` con fallback a `UserDto.isActive`:

| Estado | Origen | Badge |
| --- | --- | --- |
| `invited` | `status === "invited"` | Invitado (advertencia) |
| `active` | `status === "active"` ó (`status` ausente y `isActive === true`) | Activo (éxito) |
| `inactive` | `status === "inactive"` ó (`status` ausente y `isActive === false`) | Inactivo (neutro) |

Un `status` desconocido cae en el fallback por `isActive` — nunca deja la fila sin estado.

### S8 — Acciones de reenviar invitación / restablecer contraseña

Por fila, según el estado:

| Estado | Acciones disponibles |
| --- | --- |
| `invited` | Reenviar invitación · Eliminar |
| `active` | Activar/Desactivar · Restablecer contraseña · Eliminar |
| `inactive` | Activar/Desactivar · Restablecer contraseña · Eliminar |

- "Reenviar invitación" reenvía el correo de invitación al usuario invitado.
- "Restablecer contraseña" envía un correo de restablecimiento al usuario.
- Ambas acciones muestran confirmación (toast) y error si el backend rechaza.

### S9 — Contrato de API, i18n y documentación

- Todo el copy nuevo pasa por i18n (`es` + `en`). Ningún string nuevo hardcodeado en un componente.
- Se actualizan los snippets de auth de `FRONTEND-SKELETON-TEMPLATE.md` en el mismo commit que toca el archivo (regla de mantenimiento del doc).

## Contrato de API (frontend → backend)

El backend **todavía no tiene** estos endpoints. Esta es la especificación que el frontend espera; el equipo de backend la implementa contra este contrato.

### Públicos (sin `Authorization`, sin logout por 401)

| Método | Ruta | Body | Respuesta |
| --- | --- | --- | --- |
| POST | `/api/auth/forgot-password` | `{ email }` | `204` |
| POST | `/api/auth/reset-password` | `{ token, password }` | `204` · `400/401/410` = token inválido/expirado |
| POST | `/api/auth/activate-account` | `{ token, password }` | `204` · `400/401/410` = token inválido/expirado |
| GET | `/api/auth/link-status?token={token}&purpose={activation\|password-reset}` | — | `{ valid: boolean, email: string \| null, expiresAt: string \| null }` |

### Admin (requiere token)

| Método | Ruta | Body | Respuesta |
| --- | --- | --- | --- |
| POST | `/api/users/invite` | `{ email, fullName, role, username? }` | `200` `UserDto` (estado `invited`) |
| POST | `/api/users/{id}/invite` | — | `204` (reenvío) |
| POST | `/api/users/{id}/reset-password` | — | `204` (envía correo de restablecimiento) |

`POST /api/users` (alta con contraseña) deja de usarse en el frontend: lo reemplaza `POST /api/users/invite`.

## Tasks

| ID | S# | Route | Commit | Estado |
| --- | --- | --- | --- | --- |
| T1 | S9 | inline | — | PENDIENTE — capa de contrato: tipos, config, servicios, `fetchPublicJson`, i18n, `AuthLayout`, `AuthForm` |
| T2 | S1, S9 | inline | — | PENDIENTE — login sin "Crear cuenta", borrar `Register`, rutas en `App.tsx` |
| T3 | S2, S3, S4, S5 | delegado | — | PENDIENTE — 4 pantallas públicas + tests |
| T4 | S6, S7, S8 | delegado | — | PENDIENTE — Admin > Usuarios: invitar, estados, acciones + tests |
| T5 | S9 | inline | — | PENDIENTE — seam check, verificación, doc, commits |

## Log

### L1 — 2026-11-07 — pedido original

> "Frontend (solo la interfaz)
>
> Quitar "Crear cuenta" del login.
> Pantallas: olvidé mi contraseña, restablecer, activar cuenta, enlace inválido.
> En Admin > Usuarios: botón de invitar, estados y acciones de reenviar/restablecer. ya que es un ERP y no vamos a crear usuarios de la forma tradicional los usuarios se crean desde dentro del sistema."

### L2 — 2026-11-07 — decisiones del implementador (supuestos)

- **Alcance**: "Frontend (solo la interfaz)" ⇒ se define el contrato de API acá y el backend lo implementa después. El frontend no simula datos ni mockea respuestas en runtime.
- **Borrado de `/register` completo**: no sólo se oculta el enlace. El pedido dice que los usuarios se crean desde adentro del sistema ⇒ el auto-registro público desaparece (pantalla, ruta, servicio, endpoint, tipo, claves i18n). Coherente con `docs/audit/multi-tenancy-frontend-investigation.md` (R1.1).
- **Estados = 3** (`invited` / `active` / `inactive`). Se mappinga con `isActive` para no romper la respuesta actual del backend. Estados extra (`suspended`) se agregan cuando el backend los emita.
- **`username` opcional en la invitación**: si el admin no lo escribe, lo deriva el backend desde el correo.
- **Anti enumeración**: el backend responde igual (204) exista o no el correo. El frontend nunca muestra "¿no existe esa cuenta?".
- **Pantalla "enlace inválido" reutilizable**: se implementa como componente y además como ruta `/invalid-link`, para que S3 y S4 la rendericen en el lugar y el usuario pueda navegar a ella.

## Relevant files

- `src/pages/Login/Login.tsx` — S1: se le quita el enlace a "Crear cuenta".
- `src/pages/Register/` — S1: se elimina.
- `src/App.tsx` — S1/S2/S3/S4/S5: rutas públicas.
- `src/infrastructure/api/authService.ts` — S2/S3/S4: métodos públicos.
- `src/infrastructure/api/userService.ts` — S6/S8: `inviteUser`, `resendInvitation`, `sendPasswordReset`.
- `src/infrastructure/api/fetchPublicJson.ts` — S2/S3/S4: cliente público sin `Authorization` ni logout por 401.
- `src/components/UserManagement/UserManagement.tsx` — S6/S7/S8.
- `src/domain/constants/userStatus.ts` — S7: estados y resolver.
- `src/i18n/locales/{es,en}.json` — S9: copy nuevo.
- `FRONTEND-SKELETON-TEMPLATE.md` — S9: snippets de auth.
