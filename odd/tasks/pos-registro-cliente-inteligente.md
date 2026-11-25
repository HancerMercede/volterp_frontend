# POS — Registro del cliente que no existe en la compañía concurrente

**Objetivo**: que la caja de Ventas **deduzca** que el cliente escrito a mano no está en el padrón de la compañía concurrente, y ofrezca **darlo de alta ahí mismo** (con el nombre escrito y el RNC del comprador que el cajero ya tipeó) en vez de dejar al cajero atascado en el warning.
**Rama**: `feature/ux12-receptor-rnc` (repo `erp-mvp`) — **sin rama nueva** ✓ (el dueño: *"no podemos minar el proyecto con ramas una de detras de la otra"* ✓).
**Delivery**: ask-on-risk
**Runner**: `yarn test --run` (Vitest) — en esta máquina **dos instancias de vitest a la vez matan el proceso**: `NODE_OPTIONS=--max-old-space-size=4096 npx vitest run --pool=threads --no-file-parallelism`.

> Esto es **front**: el backend ya resuelve la empresa desde el token (el cliente se crea en la compañía concurrente sin que el front mande `companyId`) ✓ y ya expone el RNC del comprador (`receptorTaxId`) ✓ (UX12) → **el front consume ese contrato, no lo inventa** ✓.

## Specs

### S1 — "un check que prenda y apague"

> "utilizar una bandera o algo" · "Exacto un check que prenda y apague" · "por seguridad solo se puede typear en la caja de texto si la bandera esta encendida y solo debe aparecer la caja de texto del rnc si esta encendida de lo contrario conviene dejar la ui como estaba original y que aparesca tanto el input del RNC si es que el cliente no existe"

La caja tiene **un check que prende y apaga** ("El comprador no está registrado") y con él **dos modos**:

| | **Bandera apagada** (el comprador está en el padrón) | **Bandera prendida** (el comprador no tiene ficha) |
|---|---|---|
| Picker de cliente | ✅ | ❌ (desaparece) |
| Caja "Nombre del comprador" | ❌ | ✅ (lo único que se escribe) |
| Caja "RNC del comprador" | ❌ | ✅ |

- **Por seguridad**: el nombre solo se puede escribir con la bandera prendida (con la apagada la caja no existe) ✓.
- **Con la bandera apagada la UI queda como estaba original** (solo el picker) ✓ → y el front **no manda RNC**: lo pone la ficha del cliente ✓ (verificado en el back: `ResolveReceptorTaxIdAsync` ✓).
- El check va en el riel, entre el picker de cliente y el RNC del comprador.

### S2 — "No champ no es que vas a buscar nada ejemplo si el cliente no esta registrado en el sistema que vas a buscar, lo unico es que el te puede dar su RNC y asi la factura sale a nombre de dicha empresa"

**No hay búsqueda ni consulta al padrón** → si el comprador no está en el sistema, el cajero le pide el RNC y la venta lo nombra con lo escrito:

| Dato de la venta | De dónde sale |
|---|---|
| `clienteId` | `null` (no hay ficha) |
| `clienteName` | el nombre escrito en la caja |
| `receptorTaxId` | el RNC que escribió el cajero |

- El contrato ya lo admite (`CreateSaleRequest.clienteId: string | null` ✓ · `clienteName: string | null` ✓ → `domain/types/index.ts:219-220`).
- **El padrón no se toca**: no se da de alta ningún cliente ✓.

### S3 — "lo unico es que el te puede dar su RNC y asi la factura sale a nombre de dicha empresa"

El comprobante que tiene que **nombrar a su comprador** (crédito fiscal E31 siempre; consumo E32 desde el umbral que dice el readiness) exige el RNC → el aviso que ya existe salta igual ✓ (`ventas.fiscalCreditNeedsTaxId` ✓ · `ventas.buyerTaxIdRequired` ✓).

Con el RNC escrito, la factura sale a nombre de esa empresa ✓ (UX12: el back nombra al comprador con el `receptorTaxId` ✓).

### S4 — "utilizar una bandera o algo": la guarda cambia de forma, no de sitio

- **Bandera apagada**: la venta sigue exigiendo un cliente del padrón → el aviso *"Seleccione un cliente, por favor."* no cambia ✓.
- **Bandera prendida**: la venta **no** exige cliente → exige el **nombre escrito** → sin nombre, avisa y no sale ✓.

### S5 — fuera de alcance: del RNC al nombre de la empresa

> "investiguemos si existe un mecanismo de determinar por via de una api el nombre de la empresas etc. pero eso seria para otra cosa"

Lo que hay (investigado, **no se implementa acá**): la **DGII no expone un API REST público** (en su foro lo confirman: solo la página web; lo que circula son scrapers frágiles) → hay **APIs de terceros** que consultan su padrón (`idfiscal.com` → `GET /v1/do/rnc/{rnc}` · Indexa API · `directoriornc.com/api-docs` · `api-dgii.dominicantechnology.com` con `X-API-Key` · `rnc.megaplus.com.do`) y el **padrón completo como dataset** (~798.859 registros, diario → se puede buscar localmente; el paquete npm `dgii-rnc`).

Eso serviría para precargar la razón social al escribir el RNC y **validar que el RNC existe** → **otra feature** ✓.

### S6 — "el rnc seguira mandandoce en la info del cliente"

> "el rnc seguira mandandoce en la info del cliente lo unico que no se visualizara en el imput porque cualquiera lo puede modificar ya que no esta en solo lectura"

El RNC del comprador **vive en la ficha del cliente** → el back lo resuelve con `client.TaxId` cuando la venta no trae RNC ✓ (verificado) → y **el formulario de Clientes tiene que poder cargarlo**:

- `ClientDto.taxId` existe en el DTO ✓ (`domain/types/index.ts:256`) pero **el formulario de Clientes no lo pide** ✓ → ese es el hueco que esta spec cierra ✓.
- El RNC **no se muestra en una caja editable** para un cliente del padrón (cualquiera lo puede cambiar) → por eso la caja de RNC es del modo sin ficha ✓ (S1).

## Tasks

| ID | Specs | Route | Repo | Estado | Commit | Evidencia |
|---|---|---|---|---|---|---|
| T1 | S1-S6 | inline (parent) | erp-mvp | DONE | `7900f9b` | El doc reescrito con el diseño de la bandera (S1-S6) + el log L1-L13 |
| T2 | S1, S2 | handoff (worker) | erp-mvp | DONE | `7900f9b` | El check "El comprador no está registrado" y los dos modos: apagada el riel queda como antes de UX12 (solo el picker, sin caja de RNC), prendida las dos cajas (nombre + RNC) |
| T3 | S2 | handoff (worker) | erp-mvp | DONE | `7900f9b` | La venta sale sin ficha: `clienteId: null` + `clienteName` escrito + `receptorTaxId`; con la bandera apagada el RNC no viaja (lo pone la ficha) |
| T4 | S3, S4 | handoff (worker) | erp-mvp | DONE | `7900f9b` | La guarda: con la bandera prendida se exige el nombre escrito; apagada sigue exigiendo cliente del padrón; los avisos del RNC no se tocan |
| T5 | S1-S6 | handoff (worker) | erp-mvp | DONE | `7900f9b` | i18n `es`/`en` (4 claves de la caja + `clientes.clientTaxId`; se fue `buyerTaxIdHint` sin uso) + snippet del template + 6 tests nuevos y 5 del UX12 actualizados |
| T6 | S6 | handoff (worker) | erp-mvp | DONE | `7900f9b` | El RNC en la ficha del cliente: campo opcional en `CLIENTE_FIELDS` + `defaultValues` + `mapEntityToForm` (§4.5) + `taxId: trim() || null` en el alta y la edición |
| T7 | S6 | handoff (worker) | erp-mvp | **PENDING** | — | **Cobertura de la ficha**: la página de Clientes no tiene archivo de test → el campo `taxId` (alta, edición y la normalización del `null` del DTO) queda sin prueba de página. Hay 22 sondas verdes del verificador listas para llevar al repo (17 de la caja + 5 de Clientes) |

## Log

### L1 — 2026-11-24 — el dueño abre la feature

> "champ excelete ya el front homologado con el backend pero hay un hueco ejemplo si el cliente no esta registrado escribimos el comprobante eso esta ok, pero el cliente cuando lo escribimos salta el warning de que escriba el nombre del cliente o mas bien que lo seleccione, en ese caso debemos hacer que el sistema sea bastante inteligente para decifrar que si el cliente no se selecciona posiblemente es porque no existe para la compania concurrente."

- **Es un pedido de front** ✓ (confirmado por el dueño: *"y te hablo del front"*) → el backend no se toca ✓.
- **El backend ya está listo** ✓: la empresa la resuelve el token ✓ · el `receptorTaxId` del comprador ya viaja ✓ (UX12) → el front **no inventa contrato** ✓.
- **El hoy del front** (por confirmar contra el código en T1): el picker de cliente es el combobox unificado (`SearchableSelect`) y el texto escrito **no es** una selección → la caja avisa "seleccione un cliente" ✓.

### L2 — 2026-11-24 — corrección del dueño: sin rama nueva

> "vamos mal champ porque creaste otra rama eso no es lo que te pedi no podemos minar el proyecto con ramas una de detras de la otra eso se podia hacer en la misma rama donde estabamos"

- **Se borró** la rama `feature/pos-registro-cliente-inteligente` (nunca tuvo commits) ✓ → el trabajo sigue en `feature/ux12-receptor-rnc` ✓.
- **Es una regla ya sabida**: el dueñocommitear directo en la rama en curso, sin abrir `feature/*` nuevas ✓ → queda anotada en la memoria de reglas duras ✓.

### L3 — 2026-11-24 — mapa del código (explorador read-only)

- **Una sola caja**: `src/pages/Ventas/components/NuevaVenta.tsx` (ruta `src/pages/NuevaVenta/NuevaVentaPage.tsx`) → `src/pages/POS/` está **vacío** ✓.
- **El cliente**: no hay campo de texto libre → es el combobox `SearchableSelect` (`ClienteSelector.tsx:66-79`) → el texto escrito **no es** una selección (`ClienteSelector.tsx:74-77` ignora `""`) ✓.
- **El warning**: `NuevaVenta.tsx:267-271` → `addToast(t("ventas.selectClientWarning"), "warning")` → *"Seleccione un cliente, por favor."* ✓ (la variante "escriba el nombre" **no existe** ✓).
- **El RNC del comprador**: `receptorTaxId` (`NuevaVenta.tsx:141-143`) · resolución `rncDelComprador = receptorTaxId.trim() || clienteData?.taxId` (`:147`) · input `:390-405` · envío `receptorTaxId.trim() || undefined` ✓.
- **El alta de cliente**: `clienteStore.addCliente` → `clientService` → `POST /api/clients` ✓ · `ClientRequest = Partial<ClientDto>` ✓ · **sin `companyId`** → el tenant sale del JWT ✓ · **`ClientDto.taxId` existe** ✓ pero el formulario de `Clientes.tsx` **no lo pide** ✓ (hueco real: la ficha del cliente no tiene RNC en la UI ✓).
- **La venta**: `clienteId` + `clienteName` denormalizado ✓ → la caja **siempre** lo deriva del cliente seleccionado (`NuevaVenta.tsx:304`/`:327`) ✓ → hoy no hay nombre tipeado a mano ✓.

### L4 — 2026-11-24 — el dueño corrige el enfoque: bandera, no búsqueda

> "utilizar una bandera o algo"

> "No champ no es que vas a buscar nada ejemplo si el cliente no esta registrado en el sistema que vas a buscar, lo unico es que el te puede dar su RNC y asi la factura sale a nombre de dicha empresa o algo asi investiguemos si existe un mecanismo de determinar por via de una api el nombre de la empresas etc. pero eso seria para otra cosa"

- **Lo que NO se hace**: buscar el RNC en el padrón, dar de alta un cliente, cualquier llamada nueva ✓ → si el comprador no está, no hay nada que buscar ✓.
- **Lo que SÍ**: un check que prende y apaga + el nombre escrito + el RNC → la venta sale sin ficha (`clienteId: null`) ✓.
- **El RNC → razón social queda afuera** (otra feature) ✓ → pero se investigó y está documentado en S5 ✓.

### L5 — 2026-11-24 — el check, confirmado

> "Exacto un check que prenda y apague"

- Es un **check**, no un segmented control ni un select ✓.
- Prendido → el comprador se nombra a mano ✓. Apagado → la caja pide un cliente del padrón ✓.

### L6 — 2026-11-24 — el dueño manda seguir el template

> "sigue el template para que te guies con el naming convention y todo eso" · "0 ia slop"

- **El template manda** (§4.1 naming · §4.4 i18n · §4.7 estilo · §4.8 quirks · §4.9 anti-patrones · §4.11 contrato auditable) ✓.
- **0 IA slop**: comentarios de una línea sólo donde el porqué no se ve · sin abstracciones gratis · sin ramas "por si acaso" ✓.
- El estado local de la caja sigue en **español** (`compradorSinRegistro` · `nombreComprador`) porque la entidad de este módulo es `cliente` (§4.1: no mezclar idiomas en la misma entidad) ✓.
- **El snippet de la caja en el template** (§2.9, el `limpiarLaCaja`) se actualiza en el mismo commit ✓.

### L7 — 2026-11-24 — el contrato del back, verificado (no supuesto)

> (el dueño: *"nunca asumir"* · *"siempre debes leer el template para trabajar en cualquier proyecto el back o el front"*)

Verificado leyendo el repo `D:\source\my_projects\Volterp` (solo lectura, autorizado por el dueño):

| Qué | Dónde | Veredicto |
|---|---|---|
| `ClienteId` y `ClienteName` son nullable | `CreateSaleRequest.cs:9` (`Guid? ClienteId`, `string? ClienteName`) | ✓ la venta sin ficha se puede crear |
| `MapTo()` copia nombre y RNC | `CreateSaleRequest.cs:36-37` | ✓ |
| La creación no exige cliente | `SaleService.cs:52-54` → los únicos guards son `Items.Count > 0` y el RNC válido | ✓ |
| El RNC que viaja manda | `SaleService.cs:95` + `ResolveReceptorTaxIdAsync` (`:498-513`) | ✓ el back lo normaliza con el VO `Rnc` → el front puede mandar "101-500-018" |
| Sin RNC y sin ficha | `ResolveReceptorTaxIdAsync` (`:506`) | el RNC queda null → el back falla cerrado al completar ✓ |
| **El nombre del comprobante** | `SaleEcfDocumentMapper.cs:164` → `name = sale.ClienteName` | ✓ **el nombre escrito en la caja es el que sale en la factura** |
| El back exige nombre y RNC según el perfil del documento | `SaleEcfDocumentMapper.cs:167-171` | ✓ la guarda del front (con la bandera prendida se exige el nombre) calza con el back ✓ |

→ **"la factura sale a nombre de dicha empresa"** ✓ verificado, no supuesto.

> El repo del back tiene su propio template: `NET-API-SKELETON-TEMPLATE.md` ✓ (se lee antes de tocar el back).

### L8 — 2026-11-24 — revisión del padre sobre el diff del worker

El diff implementa las specs tal cual ✓ (el check, el nombre escrito, `clienteId: null`, la guarda plana, el hint condicional, `limpiarLaCaja`, CSS solo con tokens, 4 claves en `es` y `en`, 4 tests, snippet del template + la línea de regla). **Tres cosas para corregir**:

1. **`.compradorFlag` sin `align-items: center`** → el default de flex es `stretch` y el checkbox se deforma en vertical.
2. **Acentos: el worker acertó** → la casa escribe los comentarios del código **sin acentos** ("despues", "lineas", "escribio") y la copy al usuario **con** acentos ("El carrito está vacío") → el padre los había puesto con acentos y los revirtió (L10).
3. **El nombre se precarga desde cualquier venta**, incluso la que tiene cliente → al prender el check en una venta que sí traía cliente, el campo del nombre aparece con el nombre del cliente anterior (y la venta saldría con ese nombre). El nombre debe venir **solo** de una venta sin ficha.

### L9 — 2026-11-24 — el dueño fija el cierre

> "luego que pruebe y de el OK vamos a mergear a dev y a pushear"

- **Orden**: tests en verde → commit de unidad de trabajo en `feature/ux12-receptor-rnc` → merge a `development` (**fast-forward**: `development` es ancestro ✓) → `git push origin development` ✓.
- **El push lleva 4 commits**: el de manuales que ya estaba en `development` sin pushear ✓ + los 2 de UX12 ✓ + el de esta feature ✓.

### L10 — 2026-11-24 — el padre se equivocó con los acentos (y lo verificó)

El padre "corrigió" los comentarios del worker poniéndoles acentos. Al verificar contra el archivo (`grep` de comentarios con acentos en `src/pages/Ventas/components/*.tsx` → los únicos eran los dos que él mismo había metido) sale que **la casa escribe los comentarios sin acentos** ("despues", "lineas", "reenvia", "escribio") y **la copy al usuario con acentos** ("El carrito está vacío") → el worker estaba bien → el padre lo revirtió ✓.

**Regla operativa**: el estilo de un archivo se **mide**, no se supone → igual que el contrato del back: se lee o se declara que no se verificó.

### L11 — 2026-11-24 — el dueño fija los dos modos y el RNC en la ficha

> "por seguridad solo se puede typear en la caja de texto si la bandera esta encendida y solo debe aparecer la caja de texto del rnc si esta encendida de lo contrario conviene dejar la ui como estaba original y que aparesca tanto el input del RNC si es que el cliente no existe"

> "el rnc seguira mandandoce en la info del cliente lo unico que no se visualizara en el imput porque cualquiera lo puede modificar ya que no esta en solo lectura"

> "no se si me entiendes pero dime como haciamos antes para resolver el rnc?"

- **La caja tiene dos modos** (S1): con la bandera apagada, el riel queda como antes de UX12 (solo el picker) y **el front no manda RNC** → lo pone la ficha ✓; con la bandera prendida, las dos cajas (nombre + RNC) y el RNC viaja ✓.
- **El RNC vive en la ficha del cliente** (S6) → el formulario de Clientes tiene que poder cargarlo → se agrega el campo ✓.
- **Cómo se resolvía el RNC antes** (respondido con el código del back, no de memoria): antes de UX12 el front **nunca** mandaba el RNC → el back lo sacaba de la ficha (`SaleService.ResolveReceptorTaxIdAsync`) → el comprobante lo armaba con ese RNC (`SaleEcfDocumentMapper.MapBuyer`) → **el RNC era dato de la ficha y nadie lo editaba en el mostrador** ✓. UX12 le agregó una caja **editable** → ése es el punto que el dueño señala: cualquiera la puede cambiar → por eso la caja de RNC queda solo en el modo sin ficha ✓.
- **Lo que cambia en los tests**: 5 tests del UX12 asumían que la caja de RNC siempre estaba visible → se actualizan a propósito (el diff lo muestra) ✓ + 1 test nuevo para la regla nueva ✓.

### L12 — 2026-11-24 — el dueño pregunta si el back cambia

> "Ojo el backend no cambia es solo el frontend verdad a nivel visual" · "No, no podemos sacar el campo porque cuando se vaya a registrar una nueva empresa al sistema debe tener el RNC si tiene sino se deja vacio"

- **El back NO cambia** ✓ (verificado en `D:\source\my_projects\Volterp`): `CreateClientDto` y `UpdateClientDto` ya declaran `string? TaxId = null` y su `MapTo()` lo copia ✓ · `ClientDto.TaxId` ya lo expone ✓ · el back ya resuelve el RNC del comprador desde la ficha ✓. Lo que faltaba era que **el front se lo mandara** → no hay endpoint nuevo, ni esquema, ni código en el back ✓.
- **El campo del RNC en la ficha se queda** ✓ y es **opcional**: si el cliente lo tiene se carga; si no, queda vacío ✓ (`ClientDto.taxId?: string | null` → opcional, no `required`).
- **Qué es visual y qué no**: la caja es visual + payload (todo dentro del contrato existente ✓); el formulario de Clientes es el único punto donde el front **escribe un dato que antes no viajaba** (el RNC del cliente).

### L13 — 2026-11-24 — verificación y entrega

- **Verificación independiente** (`gentle-ai-verify` sobre el diff `9b17188..7900f9b`): **0 bloqueantes** · S1-S4 **cumple** con evidencia `path:line` · el snippet del §2.9 del template coincide **literalmente** con el código (0 líneas faltantes) · baseline vs candidato: la caja 32/32 → **39/39**, la suite completa 644 → **651 tests** en 76 archivos, `tsc` exit 0 en ambos y `eslint` exit 0 (los mismos 5 errores preexistentes) · los 5 tests del UX12 actualizados **no se debilitaron** ✓.
- **Lo que el padre verificó por su cuenta**: el contrato del back leído en el código (`CreateSaleRequest` · `SaleService` · `MapBuyer` · `Rnc` · `CreateClientDto`/`UpdateClientDto` · `ClientService` · `Client.UpdateTaxId` · `Sale.SetReceptorTaxId`) · la focal 39/39 · la suite 76 archivos / 651 tests · `tsc -p tsconfig.app.json` exit 0 · eslint exit 0.
- **Advisory del back (no se toca: es regla intencional)**: `Sale.SetReceptorTaxId` **no borra** el RNC cuando el request no trae uno (*"A request that does not name a buyer does not erase the one the sale already has"*) → si en una venta se cambia el comprador de "sin ficha" a "del padrón", el RNC del comprador anterior sobrevive ✓ (comportamiento del back, fuera de alcance).
- **Hueco declarado**: la página de Clientes **no tiene archivo de test** → el campo `taxId` de la ficha no tiene cobertura de página (el verificador lo tapó y dejó 22 sondas verdes en un scratch que ya se borró).
- **Entrega**: commit `7900f9b` → merge fast-forward a `development` → `git push origin development` (`0e0e358..7900f9b`) ✓. El push lleva 4 commits: el de manuales que estaba sin pushear + los 2 de UX12 + este.

### L14 — 2026-11-24 — lo que queda pendiente

> "Ok manana cubrimos con los test lo que quedo pendiente"

- **T7 (PENDIENTE)**: la página de Clientes **no tiene archivo de test** → el campo `taxId` de la ficha (alta, edición y la normalización del `null` del DTO) queda sin cobertura de página.
- El verificador dejó **22 sondas verdes** en un scratch (`VerifierPos.test.tsx`: 17 de la caja · `VerifierClientes.test.tsx`: 5 de la ficha) → el scratch se borró, pero el contenido exacto está en su reporte → es lo que hay que llevar al repo.
- Los **5 errores preexistentes** de `npx eslint .` (`PoncheCard` · `Issuers` · `Ranges` · `VentaDetail`×2) siguen sin tocarse ✓.
- El **advisory del back** (`Sale.SetReceptorTaxId` no borra el RNC si el request no trae uno) queda como está: es regla intencional del back ✓.

## Relevant Files

- `src/pages/Ventas/components/NuevaVenta.tsx` — la caja: el cliente, el RNC del comprador y el guard de cliente.
- `src/pages/Ventas/components/ClienteSelector.tsx` — el picker de cliente del POS (el texto escrito vive acá).
- `src/pages/Clientes/Clientes.tsx` + `src/infrastructure/api/clientService.ts` + `src/stores/clienteStore.ts` — el alta de cliente que ya existe (la que se reutiliza).
- `src/i18n/locales/es.json`, `src/i18n/locales/en.json` — la copia (español neutro, sin voseo).
- `FRONTEND-SKELETON-TEMPLATE.md` — el patrón del front (y los snippets que hay que actualizar).
