# Volterp Frontend — Minimalist Design System

> ## ⚠️ ABANDONADO — 2026-11-05. **No usar como fuente de verdad.**
>
> Esta dirección (naranja `#FF632B` + shell crema, estilo Coderhouse) **se probó y se abandonó**. Nunca llegó a `development`:
> - La rama `feature/minimalist-design-system` **no existe** más (sólo `development`, `feature/compras-alta-fix`, `main`).
> - El trabajo quedó en el stash `stash@{0}` (merge commit `634ab2c`, 57 archivos, +662/−691) — recuperable con `git stash pop` o `git show 634ab2c`.
> - El guard de tokens `src/test/design-tokens.test.ts` **nunca llegó a existir**.
> - `index.html` **no carga** ninguna fuente de display.
>
> **La paleta viva es la de `src/styles/variables.css`**: shell navy (`--sidebar-bg: #1F2937`) + primario **ámbar** (`--primary: #FACC15`) + glassmorphism. Ese es el sistema homologado.
>
> - **Fuente de verdad del código**: `FRONTEND-SKELETON-TEMPLATE.md`.
> - **Fuente de verdad del diseño**: `src/styles/variables.css` + la sección **"Contrato visual"** de `FRONTEND-SKELETON-TEMPLATE.md`.
>
> **Lo que sí se rescató** de este documento —los **principios**, no los valores— quedó en el "Contrato visual" del template: tokenización total del color, contraste AA como contrato y tipografía libre con licencia OFL.

Restyle del FrontEnd de Volterp hacia una estética minimalista inspirada en la referencia de Coderhouse, con `#FF632B` como color primario, shell claro y tokenización total del color.
**Branch**: `feature/minimalist-design-system` (base `development` @ `692ab4a`) · **Delivery**: `ask-on-risk` · **Test runner**: `vitest` + `tsc -b && vite build` + `eslint .`

## Specs

### S1 — Dirección del shell
> "Shell claro estilo Coderhouse (Recomendado)"

El sidebar deja de ser navy con gradiente y pasa a superficie clara. El item activo se marca con pastilla de color primario. No se conserva ningún gradiente decorativo en el shell.

### S2 — Color primario
> "un color primario me gusta este pagina para referencia:[Image 1] coderhouse"

El primario es el naranja de Coderhouse. Se usa como **relleno** (pastilla activa, botón primario, acentos), nunca como texto sobre el canvas crema — ese rol lo cumple `--primary-text`.

| Token | Valor | Rol |
|---|---|---|
| `--primary` | `#FF632B` | relleno de marca, pastilla activa, botón primario |
| `--primary-hover` | `#E8551F` | hover de relleno |
| `--primary-strong` | `#C2410C` | relleno con texto blanco (5.18 AA) |
| `--primary-text` | `#B03A0A` | naranja como texto (5.51 AA sobre crema) |
| `--primary-soft` | `#FFF0E8` | fondo teñido |
| `--primary-soft-hover` | `#FFE2D3` | hover de fondo teñido |
| `--primary-border` | `#FFD4BE` | borde de acento |

### S3 — Canvas y texto
> "quiero darle un estilo mas minimalista al FrontEnd de Volterp"

| Token | Valor | Rol |
|---|---|---|
| `--background` | `#F9F3EA` | canvas crema cálido |
| `--surface` | `#FDFCF9` | superficie de tarjeta |
| `--surface-secondary` | `#F4EDE2` | superficie recesada, sidebar |
| `--surface-tertiary` | `#EFE7DA` | superficie hundida |
| `--border` | `#E8E1D6` | borde estándar |
| `--border-light` | `#EFE9DE` | borde suave |
| `--border-strong` | `#D9D0C1` | borde enfático |
| `--text-primary` | `#171717` | negro cálido, 16.25 AAA sobre crema |
| `--text-secondary` | `#585858` | 6.45 AA sobre crema |
| `--text-muted` | `#6B6257` | 5.42 AA sobre crema |
| `--text-on-primary` | `#171717` | texto sobre `#FF632B`, 6.04 AA |

Coderhouse usa `#A2998A` como gris apagado, pero sobre crema da **2.55 (FAIL)**. Por eso Volterp usa `#6B6257` en su lugar.

### S4 — Sin glassmorphism
La receta actual `--glass-bg` + `backdrop-filter: blur(10px)` está duplicada 42 veces. Se elimina: superficies planas, sombras sutiles de 1px.

### S5 — Tipografía sin costo
> "ese tipo de fuente es de pago vere si la compro"

La display de Coderhouse es **BN Hightide** (Brandon Nickerson / BN Type Foundry, **$20 USD**, licencia estándar hasta 2 usuarios individuales). **No se compra.** Se usan alternativas libres verificadas en Google Fonts con licencia OFL para uso comercial:

- `--font-body`: `'Plus Jakarta Sans'` — **ya era la fuente del proyecto**, es también una de las que carga Coderhouse.
- `--font-display`: `'Archivo Black'` — heavy geométrica de un solo peso, la más cercana en espíritu a BN Hightide.

`--font-display` se aplica **sólo** en: hero de Login, hero de Register y título de bienvenida del Dashboard. Nunca dentro de la UI de datos.

### S6 — Tokenización total
Cero literales de color fuera de `src/styles/variables.css`. Se prohíbe en `src/**/*.module.css`: hex (`#RRGGBB`), `rgb()`, `rgba()`, `hsl()`, `hsla()`. Se permite `var()`, `color-mix(in srgb, var(--x) N%, var(--y))`, `transparent`, `currentColor`, `inherit`.

Motivo: hoy hay ~446 literales hardcodeados en 57 módulos y 38 declaraciones que duplican el amarillo primario en 16 archivos. Cambiar `--primary` no cambia la app. Con tokenización, un rebranding futuro es una edición de un solo archivo.

### S7 — Contraste como contrato
Todo par texto/fondo declarado cumple WCAG AA como mínimo. Valores verificados por cálculo, no estimados. `--primary` sobre crema da 2.69 y **no se usa como texto** en ningún lado.

### S8 — Props declarados
Toda custom property referenciada debe estar declarada. Hoy hay 6 referenciadas y nunca declaradas, que resuelven a valor inválido: `--primary-hover`, `--text-inverse`, `--text-inverse-muted`, `--surface-secondary`, `--color-primary`, `--color-background`.

### S9 — Disciplina de rama
> "pero estamos en development crearemos una rama nueva para no ensuciar esta rama"

Todo el trabajo vive en `feature/minimalist-design-system`. `development` no recibe commits de este trabajo.

### S10 — Sin cambio de comportamiento
El alcance es CSS + el link de fuentes en `index.html` + un archivo de test nuevo. Ningún componente cambia su JSX, su props, su comportamiento ni sus textos.

## Tasks

| ID | S# | Alcance | Ruta | Estado |
|---|---|---|---|---|
| T1 | S6, S7, S8 | `src/test/design-tokens.test.ts` — guard de tokens: props declaradas, cero literales, sin `backdrop-filter`, contraste AA | inline | HECHO — `cb23616` + `89eb3fe` (25 tests) |
| T2 | S2, S3, S5, S8 | `src/styles/variables.css` reescrito + `index.html` (link de fuentes) | inline | HECHO — `e71e85c` |
| T3 | S4, S6, S7 | `src/components/UI/**` — 13 primitivas a token plano | delegado | HECHO — **sin commitear** |
| T4 | S1, S4, S6, S7 | `src/components/Layout/**`, `Dashboard`, `Asistencia`, `RRHH`, `Support`, `UserManagement`, `LanguageSwitcher` | delegado | HECHO — **sin commitear** |
| T5 | S3, S5, S6, S7 | `src/pages/Login/**`, `src/pages/Register/**` — hero + display font | delegado | HECHO — **sin commitear** |
| T6 | S3, S6, S7 | `src/pages/**` restantes + `src/pages/Ventas/components/**` | delegado | HECHO — **sin commitear** |
| T7 | S6, S7, S10 | seam check: vitest + build + lint + verificación visual | inline | PENDIENTE — **ROJO** (2 fallos) |
| T8 | S4 | 20 `backdrop-filter` + uso de `--glass-bg` / `--surface-blur` → superficies planas | inline | PENDIENTE |
| T9 | S2, S7 | 9 `color: var(--primary)` → `--primary-text` (canvas crema) / `--primary-on-dark` (panel oscuro) | inline | PENDIENTE |
| T10 | S5 | `--font-display`: 8 reglas con faux bold + heroes Login/Register | inline | BLOQUEADO — decisión de S5 pendiente |
| T11 | S8 | tokens faltantes (`--primary-strong`, `--primary-soft-hover`), `--border-light`, limpieza de aliases legacy | inline | PENDIENTE |
| T12 | S6 | blind spot del guard: hex percent-encoded en data URIs (5 archivos) + `public/favicon.svg` violeta | inline | PENDIENTE |
| T13 | S10 | hero Register: texto crema sobre gradiente crema→oscuro; acento `--info` azul fuera de paleta | inline | PENDIENTE |
| T14 | S6, S7, S10 | seam check final: `vitest --pool=threads` + `tsc -b && vite build` + `eslint .` + verificación visual | inline | PENDIENTE |

T3–T6 son unidades independientes con superficies de edición disjuntas y se lanzan en paralelo una vez que T2 fija el contrato de tokens.

**Nota de entorno**: en Windows el pool `forks` de vitest no arranca (`Timeout waiting for worker to respond`). El runner correcto es `npx vitest run --pool=threads`.

## Log

### L1 — 2026-11-05
> "Champ quiero darle un estilo mas minimalista al FrontEnd de Volterp un color primario me gusta este pagina para referencia:[Image 1] coderhouse ese tipo de fuente es de pago vere si la compro. analizalo"

### L2 — 2026-11-05
> "delega el analisis"

Análisis delegado a dos exploradores read-only: mapa de tokens/tipografía y mapa de superficies visuales.

### L3 — 2026-11-05
> "pero estamos en development crearemos una rama nueva para no ensuciar esta rama"

Rama `feature/minimalist-design-system` creada desde `development` @ `692ab4a`. `development` queda intacta. Se arrastran los cambios sin commitear preexistentes (`.atl/`, `q`, `odd/`, `docs/audit/`, `FRONTEND-SKELETON-TEMPLATE.md`, `src/utils/FriendlyGuid.ts`); no se commitean.

### L4 — 2026-11-05
Decisión de dirección tomada por el usuario:
> "Shell claro estilo Coderhouse (Recomendado)"

### L5 — 2026-11-05 — evidencia de la paleta

Paleta de Coderhouse extraída de su CSS en vivo (no estimada a ojo): `#FF632B` primario, `#F9F3EA` canvas, `#FDFCF9` superficie, `#E8E1D6` borde, `#171717`/`#0A0A1A` texto, `#585858` secundario, `#A2998A` apagado, `#FDAB2E` acento ámbar.

Contraste verificado por cálculo WCAG:

| Par | Ratio | Nivel |
|---|---|---|
| `#171717` sobre `#F9F3EA` | 16.25 | AAA |
| `#585858` sobre `#F9F3EA` | 6.45 | AA |
| `#6B6257` sobre `#F9F3EA` | 5.42 | AA |
| `#171717` sobre `#FF632B` | 6.04 | AA |
| `#FFFFFF` sobre `#C2410C` | 5.18 | AA |
| `#B03A0A` sobre `#F9F3EA` | 5.51 | AA |
| `#FF632B` sobre `#F9F3EA` | 2.69 | FAIL — por eso existe `--primary-text` |
| `#A2998A` sobre `#F9F3EA` | 2.55 | FAIL — por eso `--text-muted` es `#6B6257` |

Tipografía de Coderhouse confirmada en su CSS: display `BN Hightide Regular` (h1/h2, `letter-spacing: -0.02em`, `line-height: 80%`); body `Inter` + `Plus Jakarta Sans` vía Fontshare.

### L6 — 2026-11-05 — cierre de la sesión anterior

Rama `feature/minimalist-design-system` @ `89eb3fe`. Tres commits desde `692ab4a`: `cb23616` (guard), `e71e85c` (capa de tokens), `89eb3fe` (guard extendido). **T3–T6 quedaron sin commitear**: 57 archivos, +798/−872 en el working tree.

Lo último que el usuario iteró fue el wordmark del sidebar: pidió la tipografía de la referencia, quitar el logo para verla, y el título VOLTERP con ese aire. Al retomar, `src/components/Layout/Sidebar.tsx:71-75` **sigue renderizando el `<img>` del logo** junto al wordmark, y `Sidebar.module.css:33,40` conserva un `drop-shadow`/`box-shadow` con halo naranja heredado del shell navy — incompatible con el shell claro.

### L7 — 2026-11-05 — auditoría de reanudación (explorador read-only delegado)

Estado verificado sobre disco:

- **Token layer**: en pie. `--primary #FF632B`, `--primary-text #B03A0A`, `--background #F9F3EA`, `--surface #FDFCF9`, `--text-muted #6B6257`, `--font-display 'Archivo Black'`, `--font-body 'Plus Jakarta Sans'`. Fuentes cargadas en `index.html:7-9`.
- **S6 (tokenización)**: cumplida. Cero literales `#hex`/`rgb()`/`hsl()` en `.module.css` y `.tsx` fuera de `variables.css`.
- **Guard**: `npx vitest run src/test/design-tokens.test.ts --pool=threads` → **25 tests, 23 verdes, 2 rojos**.
  - `does not use backdrop-filter anywhere` → 20 ofensores (S4 nunca aplicada).
  - `never paints text with --primary or --primary-hover` → 9 ofensores (S2/S7 incumplidas).
- **S5 invertida**: `--font-display` está en el wordmark del sidebar y en 8 títulos de página (`PageHeader`, Clientes, Compras, Configuración, Inventario, Reportes ×2, Ventas) — **no** en los 3 sitios que nombra S5 (hero Login, hero Register, título de bienvenida del Dashboard). Además 8 de esas reglas emparejan la display con `font-weight` numérico → faux bold (Archivo Black es de un solo peso).
- **Tokens faltantes**: `--primary-strong` (#C2410C) y `--primary-soft-hover` (#FFE2D3) no declarados; `--border-light` es `rgba(23,23,23,.08)` y S3 pide `#EFE9DE`. Sobreviven `--primary-gradient`, `--glass-bg`, `--glass-border`, `--surface-blur` y los aliases `--color-*`.
- **Blind spot del guard**: 5 archivos con hex percent-encoded en data URIs SVG (`%23E5E7EB`, `%236b7280`) que el guard no ve. `public/favicon.svg` sigue violeta (`#863bff`).
- **Assets**: `src/assets/logo.svg` ya repintado en naranja (`#FF632B`, `#FFD4BE`, `#B03A0A`).
- **Defecto de diseño detectado**: `Register.module.css:33-37` — el `.brandTitle` no define color, hereda `--text-inverse` (#FDFCF9) sobre un gradiente que arranca en `--sidebar-bg` (#F4EDE2) crema: texto crema sobre crema en la parte alta del panel. Además el acento `.brandTitleAccent` usa `--info` (#1D4ED8) azul, fuera de la paleta cálida de Coderhouse.

### L8 — 2026-11-05 — decisión abierta (S5)

S5 dice que la display vive **sólo** en los 3 heroes/títulos nombrados; la implementación la puso en los 8 títulos de página y no en los heroes. Hay que elegir cuál es la verdad y reescribir la spec. Bloquea T10.
