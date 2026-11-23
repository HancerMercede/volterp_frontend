# Manual del usuario de Volterp

> Para quien vende, administra y usa el sistema. No hace falta saber nada de programación: este manual explica, pantalla por pantalla, **qué hace cada cosa y cómo se hace**.

## Cómo leer este manual

- **El menú de la izquierda** agrupa las pantallas por módulo (Ventas, Contabilidad, Facturación, RRHH…). El título del grupo es un botón: si lo tocás, abre la primera pantalla del grupo.
- **Los botones** se nombran como los llamás en la pantalla: **Nueva Venta**, **Guardar Borrador**, **Completar Venta**, **Descartar**, **Cancelar**…
- **Las capturas** son de una sesión real: si una pantalla cambió, la foto es una foto de la fecha en que se armó este manual.
- **Los avisos** (los mensajes verdes o amarillos) son la respuesta del sistema. Si algo no se puede hacer, el sistema lo dice y por qué.

## 1. El panel

![El panel con los indicadores del negocio](manuales/capturas/01-dashboard.png)

El panel (Dashboard) es lo primero que ves al entrar. Arriba tenés los **filtros de período**: Hoy, Esta semana, Este mes. Todo lo de la pantalla cambia con el filtro.

- **Ventas, Compras, Clientes, Utilidad**: las cuatro cifras del negocio.
- **Ventas vs. Compras**: la gráfica de los dos lados en el tiempo.
- **Top productos**: qué se está vendiendo más.
- **Recordatorios**: lo que el sistema te recuerda hacer (ventas pendientes por cobrar, cosas por revisar).

## 2. Ventas

![La lista de ventas](manuales/capturas/02-ventas.png)

La pantalla de **Ventas** es la lista de todas las ventas: las completadas, las pendientes y las canceladas. Tiene buscador, filtros y paginación.

Desde acá se entra a la caja con el botón **+ Nueva Venta**.

### 2.1 La caja: registrar una venta

![La caja de venta nueva](manuales/capturas/03-caja-nueva-venta.png)

La caja (la venta nueva) es una **pantalla completa**: no tiene el menú de la izquierda, y la barra del navegador dice que estás vendiendo. Es la pantalla donde se hace todo el día a día.

**Cómo se registra una venta:**

1. **Busca o escanea el producto.** La tecla **F2** lleva el cursor al buscador. También podés elegir por categoría, con las pestañas de arriba.
2. **Tocá el producto** → se agrega al carrito (la tarjeta del producto es el botón).
3. **Elegí el cliente** con el buscador. Cuando lo tenés, aparece su tarjeta con el botón **Cambiar** (por si te equivocaste).
4. **Ajustá el carrito**: cada línea tiene **−** y **+** para la cantidad, y **Quitar del carrito** para sacarla. El botón **Vaciar** deja la caja en blanco.
5. **Revisá el resumen**: Subtotal, **ITBIS** (18%) y **TOTAL**. Arriba dice cuántos artículos hay.
6. **Elegí el comprobante** (abajo a la derecha):
   - **Consumo (E32)** — la factura de consumo: es la de siempre.
   - **Crédito fiscal (E31)** — para un cliente con RNC: es la que le descuenta el ITBIS. **Si el cliente no tiene RNC, el sistema no te deja elegirla** y te avisa *"El crédito fiscal necesita el RNC del cliente."*
   - **Factura comercial (sin comprobante)** — la venta sin comprobante fiscal: no consume número de la DGII. Es la que se usa en el modo normal.
7. Tocá **Completar Venta $X** (el botón verde con el total).

**Lo que el sistema te avisa:**

| Aviso | Qué pasó |
|---|---|
| *El carrito está vacío* | No hay nada que cobrar todavía. |
| *Seleccione un cliente, por favor.* | La venta necesita saber a quién es. |
| *No hay empresa seleccionada* | La empresa es la que emite; revisá la configuración. |
| *Venta realizada exitosamente* | Se emitió el comprobante fiscal. |
| *Venta realizada sin comprobante* | Fue una factura comercial: no salió comprobante. |
| *Puedes cobrar, pero el comprobante no se va a emitir* | Falta algo para facturar (certificado, rango). Podés cobrar igual, pero el comprobante no sale. |

> **El aviso de "puedes cobrar pero…"** sale apenas abrís la caja si al sistema le falta algo. No te frena la venta: te dice que el comprobante no se va a emitir. Para saber qué falta, mirá el **estado de facturación** en Configuración fiscal (§9.7).

### 2.2 Guardar un borrador y volver a él

Si el cliente se va y todavía no sabés si cierra, tocá **Guardar Borrador**.

- La venta queda en estado **Pendiente** (no está cobrada).
- **La caja se queda limpia** y vos seguís en la misma pantalla: podés seguir vendiendo.
- El sistema avisa *Borrador guardado*.

Para volver a una venta pendiente: en **Ventas**, tocá el ícono de editar de la fila → la caja se abre con lo que cargaste antes (los productos y el tipo de comprobante original).

### 2.3 Cancelar una venta

Hay dos formas, y hacen lo mismo:

- **Desde la caja** (editando una venta pendiente): el botón **Descartar** → te pregunta *"¿Cancelar la venta?"* → **Sí, cancelar**.
- **Desde la lista** de ventas: el botón **Cancelar** de la fila (solo aparece en las pendientes).

**Lo que pasa:** la venta queda en estado **Cancelada** (no se borra: queda el registro) y **el stock que había reservado vuelve al inventario**. El sistema avisa *Venta cancelada*.

### 2.4 Ver el detalle de una venta

Tocá una venta **Completada** o **Cancelada** de la lista → se abre el modal **Detalle de Venta #código**.

- Si la venta está completada, el aviso dice *"Venta completada — solo vista"* (no se puede editar una venta cobrada).
- Ves: el cliente, la tabla de productos, el **Resumen** (Subtotal / ITBIS / Total) y los detalles (artículos, líneas, actualizado).
- **Copiar ID** te lleva el identificador de la venta al portapapeles.
- **Descargar PDF** imprime la vista (usa la impresión del navegador).

### 2.5 El comprobante fiscal de una venta

Cuando la venta tiene comprobante fiscal, el modal **Detalle de Venta** agrega la sección **Comprobante fiscal**:

- La **insignia de estado**, con las palabras de la DGII: Borrador, Firmado, Enviado, En proceso, **Aceptado**, **Aceptado condicional**, **Rechazado**, Anulado.
- El **e-NCF** (el número del comprobante) y el **Track ID** (el número que te dio la DGII).
- El **Veredicto de la DGII**: lo que la DGII respondió.
- El **Código QR del comprobante** (el mismo que va impreso en la factura de papel).
- Si quedó **Rechazado** o **Requiere revisión**, aparece el botón **Reintentar emisión**.

> **En la lista de ventas el estado fiscal no se ve**, a propósito: la lista es de ventas y el estado fiscal vive en el detalle. La lista se mantiene simple y el que necesita el dato entra al detalle.

**Una venta con comprobante ya enviado a la DGII no se puede eliminar**: el sistema te avisa *"No se puede eliminar: el comprobante fiscal ya fue enviado a la DGII"*.

## 3. Inventario

![El inventario de productos](manuales/capturas/05-inventario.png)

En **Inventario** manejás los productos: nombre, categoría, código (se genera solo), precio, stock, imagen y si está activo.

- Los filtros de arriba: **Todos**, **Stock bajo**, **Sin stock**.
- El **stock se edita a mano**: el sistema descuenta cuando vendés y devuelve cuando cancelás, pero la carga inicial (y las correcciones) las hacés vos.

## 4. Compras

![Las compras](manuales/capturas/04-compras.png)

En **Compras** registrás las compras: el proveedor, las líneas de productos y el total (se calcula solo). Los estados son **Pendiente**, **Recibida** y **Cancelada**.

## 5. Clientes y proveedores

![Los clientes](manuales/capturas/06-clientes.png)

**Clientes**: nombre, email, teléfono, dirección, foto y si está activo. Es la ficha que usa la caja.

> **Ojo**: hoy la ficha de cliente **no tiene campo para el RNC**. Si el cliente necesita crédito fiscal (E31), el RNC tiene que estar cargado en la ficha por el administrador; la caja no lo puede escribir. Es una limitación conocida (§12).

**Proveedores**: igual, más la categoría y la persona de contacto.

## 6. Contabilidad

![La contabilidad](manuales/capturas/08-contabilidad.png)

- **Contabilidad**: los movimientos de ingreso y egreso, con los tres indicadores (Ingresos, Egresos, Balance).
- **Cuentas** (`/contabilidad/cuentas`): el catálogo de cuentas contables (código, tipo, cuenta padre, si permite movimiento). Editar es de Admin y SuperAdmin.
- **Cuentas por cobrar** (`/contabilidad/cxc`): las ventas pendientes de cobro, agrupadas por cliente, con el saldo y cuántas ventas hay.
- **Cuentas por pagar** (`/contabilidad/cxp`): las compras pendientes de pago, agrupadas por proveedor.

## 7. Recursos humanos

![Los expedientes de los empleados](manuales/capturas/12-rrhh.png)

- **RRHH**: los expedientes de los empleados (el alta es un formulario de 3 pasos), con los indicadores y filtros.
- **Nómina**: la calculadora de nómina por empleado (salario bruto, deducciones y neto). **Calcula y muestra; no guarda.**
- **Asistencia**: los ponches (entrada, pausa, salida) con sus indicadores. Hoy son **datos de demostración**.

## 8. Proyectos y reportes

- **Proyectos**: presupuesto, gastado, fechas y porcentaje de avance.
- **Reportes**: el resumen de ventas y compras, los mejores clientes, el top 10 de productos y la gráfica de los últimos 7 días. **Se arma con los datos que están en memoria**: no es un reporte del servidor.

## 9. Facturación electrónica

![El hub de facturación electrónica](manuales/capturas/17-facturacion.png)

Esta sección es **administración**: no es donde se vende, es donde se deja listo al sistema para poder emitir. Entrás por **Facturación electrónica** y hay seis pantallas.

### 9.1 El estado de facturación (¿puedo facturar?)

![La configuración fiscal con el estado de facturación](manuales/capturas/23-configuracion-fiscal.png)

En **Configuración fiscal** está el checklist **Estado de facturación**, que responde la pregunta que importa: *¿puedo emitir comprobantes ahora?*

- **Listo para facturar** — todo está en su lugar.
- **No se puede facturar ahora** — con el motivo: falta el certificado, el rango no existe, venció, se agotó o se anuló.
- **La ruta de emisión**: **Electrónica (e-NCF)** o **Papel (NCF)**. Sale del **modo de emisión** que declaró la empresa y de si está en contingencia.
- **Certificado de firma**: si existe, cuándo vence.
- **Tipos de comprobante**: los que podés emitir, con cuántos números quedan, cuándo vencen y su estado.

> En la **caja** el mismo checklist aparece como un aviso rápido (*"Puedes cobrar, pero el comprobante no se va a emitir"*). Acá está la versión completa, con el detalle.

### 9.2 Emisores

![Los emisores](manuales/capturas/18-emisores.png)

Un emisor es el **RNC que emite**: el de la empresa o el de otra marca de la misma empresa. Con **+ Nuevo emisor** cargás el RNC y la razón social.

Al editar, **el RNC no se puede cambiar** (la DGII no lo permite); solo la razón social y si está activo.

### 9.3 Rangos de e-NCF

![Los rangos de e-NCF](manuales/capturas/19-rangos.png)

El **rango** es el tramo de números que la DGII le autorizó a un emisor para un tipo de comprobante: desde, hasta, posición actual y fecha de vencimiento.

- **+ Nuevo rango**: RNC emisor, tipo, desde, hasta, posición y vencimiento.
- Al editar, el emisor, el tipo y el inicio son **solo lectura**.
- **Anular rango** es lo único que destruye: avisa con los mensajes de la DGII.

### 9.4 Certificados

![Los certificados de firma](manuales/capturas/20-certificados.png)

El **certificado** es el `.p12` con el que se firma el comprobante. **+ Nuevo certificado**: nombre, RNC, fecha de vencimiento y la credencial.

La credencial es **opaca**: se pega una sola vez y nunca se vuelve a mostrar. Por eso no hay edición ni borrado (el backend no los expone).

### 9.5 Comprobantes

![Los comprobantes emitidos](manuales/capturas/21-comprobantes.png)

El estado de cada comprobante emitido. Arriba, las tarjetas de conteo: pendientes de emitir, en proceso, rechazados, requieren revisión y el total.

Por fila: **Reintentar** (solo si está rechazado o requiere revisión), **Ver QR** e **Imprimir** (abre la representación impresa en una pestaña nueva).

### 9.6 Recepción

![La recepción de comprobantes](manuales/capturas/22-recepcion.png)

El comprobante que **te envía un cliente** (el proveedor de tu proveedor, por ejemplo) llega con el certificado de él. Acá se registra la decisión comercial: **+ Registrar decisión** → el id del comprobante, **Aprobar** o **Rechazar**, y el motivo.

Abajo queda la ficha de la última decisión: RNC emisor y receptor, e-NCF, firmado, recibido, estado de aprobación, quién decidió, la fecha y el motivo.

> **No hay listado**: por el modelo de seguridad del backend (mutual TLS) el comprobante recibido se busca por su id.

### 9.7 Configuración fiscal

- **Modo de emisión**: **Guardar el modo de emisión** (Electrónico / Normal). Es la declaración ante la DGII: en modo normal se factura con NCF (B01/B02) y no hace falta certificado.
- **Contingencia**: estado y las fechas de inicio y fin → **Guardar la contingencia**. Dentro de una contingencia el camino es el papel.
- **Credenciales de API**: **+ Nueva credencial** para las integraciones y **Revocar**. El secret se muestra **una sola vez**.
- **Secuencias normales**: **+ Nueva secuencia normal** (el tramo de números de NCF del camino en papel).

## 10. Configuración y usuarios

![La configuración](manuales/capturas/24-configuracion.png)

**Configuración** tiene tres pestañas: **General** (los datos de la empresa, incluido su RNC), **Empresas** y **Usuarios**.

Ahí se da de alta a los usuarios y se les asignan los **permisos**: lo que puede ver cada persona depende de los permisos que tiene, y el botón de una pantalla desaparece si no lo tiene.

## 11. Soporte

![El chat de soporte](manuales/capturas/25-soporte.png)

El chat de ayuda: responde por reglas y, si hace falta, escala a una persona.

## 12. Lo que hoy no se puede hacer

Lo que el sistema todavía no resuelve, para que no pierdas tiempo buscándolo:

- **El RNC del cliente no se captura en la UI.** El formulario de clientes no tiene ese campo y la caja tampoco lo pide: el crédito fiscal (E31) necesita un cliente que **ya tenga el RNC cargado en su ficha** (lo carga el administrador). La caja avisa *"El crédito fiscal necesita el RNC del cliente"* cuando no lo tiene.
- **La venta a consumidor final por encima de RD$250,000 sin RNC** no se frena en la caja: la DGII exige el RNC del comprador a partir de ese monto y el comprobante puede ser rechazado al enviarse.
- **No hay movimientos de inventario**: el stock se edita a mano y solo lo ajustan las ventas (descontan al completarse y devuelven al cancelarse).
- **No hay pantalla de categorías**: existen en el sistema y se usan en el producto, pero no se crean ni se editan desde la app.
- **Nómina y asistencia no se guardan**: la nómina se calcula y se muestra; la asistencia es de demostración.
- **Reportes se arma con los datos en memoria**, no con una consulta al servidor.
- **El "Descargar PDF" de una venta imprime** la vista del navegador: no genera un PDF propio.
- **Los emisores y los rangos no se borran**: un rango se anula, un emisor se desactiva.
- **Recepción no tiene listado**: se registra por id de comprobante.
