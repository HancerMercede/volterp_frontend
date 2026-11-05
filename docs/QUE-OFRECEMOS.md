# Volterp ERP — ¿Qué ofrecemos?

> Material de promoción. Lista de capacidades del sistema, agrupadas por área de negocio.
> Todo lo listado está implementado y verificado en el sistema. Al final están las notas de estado actual para que la persona que promueva sepa qué no prometer.

---

**Volterp** es un sistema ERP web para empresas pequeñas y medianas: una sola aplicación donde se registra la operación completa del negocio —vende, compra, controla existencias, gestiona clientes y proveedores, lleva la contabilidad, administra al personal y reporta los resultados— sin depender de planillas sueltas ni de sistemas desconectados.

---

## Ventas y punto de venta

- Carrito de venta con búsqueda de productos, control de cantidades y cálculo automático de totales.
- **ITBIS 18%** aplicado automáticamente al total de la venta.
- Selección de cliente con buscador, historial y datos de contacto.
- Estados de la venta: **pendiente** (borrador) y **completada**, con edición solo mientras está pendiente y pantalla de detalle de la venta.
- Notas y fecha de cada operación.
- Búsqueda, filtro por estado y paginación del listado.

## Manejo de productos e inventario

- Alta, edición y baja de productos con **precio, existencia, categoría y empresa** asociada.
- **Carga de imagen** del producto con arrastrar y soltar, previsualización y validación de formato.
- Activar o desactivar productos sin borrarlos del histórico.
- Listado con búsqueda, filtros y paginación (10 registros por página).
- Control de categorías de productos.

## Manejo de clientes

- Ficha de cliente con **logo o foto**, datos de contacto y empresa a la que pertenece.
- Estado **activo / inactivo**: se retiran clientes del flujo sin perder su historial.
- Total acumulado de compras por cliente, para saber de un vistazo quién compra más.
- Alta, edición y baja con confirmación antes de eliminar.
- Búsqueda y paginación del listado.

## Manejo de proveedores

- Ficha de proveedor con **categoría, persona de contacto y estado**.
- **Carga de imagen** del proveedor.
- Alta, edición y baja, con confirmación antes de eliminar.
- Búsqueda y paginación.

## Compras

- Registro de compras con proveedor, productos, cantidades y precios.
- Estados **pendiente / completada / cancelada**.
- Filtro por estado, búsqueda y paginación del listado.
- Notas asociadas a cada orden de compra.

## Contabilidad y finanzas

- Registro de transacciones con **descripción, tipo (ingreso o egreso), monto, fecha, categoría y número de referencia**.
- Estado de conciliación: **conciliada / pendiente**.
- Indicadores inmediatos de **Ingresos, Egresos y Balance**.
- Filtro por tipo de transacción, búsqueda y paginación.
- Formato de moneda en **DOP (pesos dominicanos)**.

## Recursos humanos

- Expediente del empleado con **puesto, departamento, fecha de ingreso, salario, horario y estado**.
- Datos de nómina listos: **AFP, ARS, NSS, banco y número de cuenta**.
- **Alta y edición en formulario de 3 pasos**, con menos errores de captura.
- Filtros por búsqueda y estado, indicadores y paginación.

### Nómina

- Cálculo del salario: base, **bonificaciones y deducciones**, y resultado neto.
- Deducciones configuradas: **AFP 2.87%** y **SFS 1.74%**; Impuesto sobre la Renta incluido en el modelo.
- Bonificaciones predeterminadas: **Bono Transporte (5,000)**, **Bono Alimentación (6,000)**, comisiones y horas extras.
- Periodo de nómina con **fecha de pago** y estado: borrador, procesado o pagado.

### Asistencia

- Registro de **ponche de entrada, pausa y salida**.
- Clasificación del registro: a tiempo, tardanza o ausencia, con ubicación.
- Horario del empleado, **horas regulares y horas extra**.
- Indicadores y **4 gráficos** de seguimiento (área, barra y pie).

### Beneficios del empleado

- **Vacaciones**: días totales, usados y disponibles.
- **Permisos**: tipo, días y estado.
- **Seguro médico**: póliza, fecha de vencimiento y dependientes.
- **Formación**: registro de certificaciones.

## Proyectos

- Ficha de proyecto con **presupuesto, monto gastado, fecha de inicio y fin**.
- **% de avance** con barra de progreso visual.
- Estados: en curso, completado y pendiente.
- Indicadores de total de proyectos y presupuesto total.
- Filtro por estado, búsqueda y paginación.

## Dashboard y reportes

- **Panel ejecutivo** con los 4 indicadores clave: ventas del mes, compras del mes, clientes activos y **utilidad neta**.
- **Gráfico de ventas vs. compras** y **gráfico de distribución por categoría**.
- Top de productos con más movimiento.
- Actividad reciente y recordatorios.
- **Reportes** con tarjetas resumen, **Top 5 clientes**, **Top 10 productos** y gráfico de barras de los últimos 7 días.
- Filtro de período en el dashboard (día, semana, mes).

## Administración de la empresa y usuarios

- Datos de la empresa: **RNC / identificación fiscal, razón social y logotipo**.
- Preferencias: **IVA, moneda, zona horaria y idioma**.
- Gestión de **múltiples empresas** y de **usuarios**: crear, asignar rol, activar/desactivar y eliminar.

## Seguridad y control de acceso

- **6 roles**: Super Administrador, Administrador, Ventas, Inventario, Contabilidad y Recursos Humanos.
- **3 niveles de permiso** por módulo: lectura, escritura y eliminación, con matriz sobre 11 módulos.
- El menú lateral se adapta al rol del usuario: cada quien ve sólo lo que le corresponde.
- Inicio de sesión con token, **detección de sesión vencida** y aviso al usuario.
- Opción **"recordarme"**: la sesión se conserva aunque se cierre el navegador.

## Multidioma

- **Español e inglés completos**, con selector de idioma en la configuración.
- El idioma elegido se recuerda entre sesiones.
- Por defecto se respeta el idioma del navegador.

## Usabilidad y detalle transversal

- **Carga de imágenes** en productos, clientes, proveedores y empresas.
- Búsqueda, filtros y paginación consistentes en todos los módulos.
- **Notificaciones** de éxito, error o advertencia en cada acción.
- **Confirmación antes de eliminar** cualquier registro.
- Pantalla de error general con opción de reintento.
- Interfaz **adaptada a computadora y celular**: el menú se convierte en panel lateral en pantallas pequeñas.
- **Carga diferida por módulo**: cada pantalla se descarga sólo cuando se abre, así el sistema arranca rápido.
- **164 pruebas automatizadas** en verde, con revisión de tipos y linting estrictos.

## Soporte dentro del sistema

- Chat de ayuda con **respuestas frecuentes** y accesos rápidos.
- Opción de **escalar a un humano** desde el chat.

---

## Notas de estado actual (uso interno — no es material de promoción)

Estos puntos son ciertos y conviene conocerlos antes de comprometer algo con un cliente:

| Punto | Estado |
|---|---|
| Nómina | El cálculo y el modelo están implementados y probados, pero **aún no se guardan en el servidor**: es el paso técnico pendiente para que esté disponible en la app. |
| Asistencia | La pantalla, los indicadores y los gráficos están listos; **los datos que muestra son de demostración** hasta que se conecte el reloj o el endpoint correspondiente. |
| Chat de Soporte | Funciona con un bot de respuestas frecuentes; **no está conectado a un modelo de IA** todavía. |
| Exportar a Excel, CSV o PDF, e importar planillas | **No implementado.** |
| Ordenar tablas por columna | **No implementado.** |
| Ocultar botones de alta/edición/baja según el rol | La matriz de permisos ya existe y aplica al menú y a las pestañas de administración; **falta aplicarla a los botones**. |
| Pantalla de detalle | Sólo **Ventas** tiene detalle completo; el resto muestra el listado. |
| Categorías | El backend las soporta, pero **no hay pantalla para administrarlas**. |
| Multi-empresa | La estructura existe; el alta de usuario hoy asigna una empresa por defecto. |
| Traducción | Login, Registro y algunas etiquetas del dashboard tienen textos fijos en un solo idioma. |

---

## Para completar antes de distribuir

- [ ] Nombre comercial y logo del producto
- [ ] A qué tipo de empresa va dirigido (micro, pequeña, mediana) y en qué sector
- [ ] Planes, precios y qué incluye cada uno
- [ ] Qué incluye la puesta en marcha: días, migración de datos, capacitación
- [ ] Estado del backend: URL de producción, disponibilidad, backups y quién lo opera
- [ ] Contacto, redes y canal de soporte comercial
- [ ] Casos de uso verticales ya resueltos
- [ ] Testimonios o clientes piloto
- [ ] Qué ítems de "Notas de estado actual" se comunican como "en camino"
