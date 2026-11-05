# Volterp ERP — Inventario del sistema

> Documento de insumos para material de promoción comercial.
> Fuente: verificación directa en el código del frontend (`src/`) en la rama `development`.
> Todo lo affirmed en este documento fue verificado en código. La sección 7 lista explícitamente lo que **no** está implementado, para no sobre-prometer.

---

## 1. Resumen en 10 líneas

1. ERP web para PYMEs: una sola aplicación con ventas, compras, inventario, clientes, proveedores, contabilidad, RRHH, proyectos y configuración.
2. Backend propio REST API: 12 servicios y ~60 endpoints; el frontend ya consume 9 recursos con CRUD completo.
3. Adaptado a República Dominicana: ITBIS 18% en ventas, AFP 2.87% y SFS 1.74% en nómina, moneda DOP, RNC de empresa.
4. 6 roles de usuario con matriz de permisos sobre 11 módulos (lectura / escritura / eliminación).
5. Dashboard ejecutivo: 4 KPIs (ventas, compras, clientes activos, utilidad neta), gráficos y actividad reciente.
6. Bilingüe real: español e inglés completos y en paralelo, con selector de idioma persistido.
7. Incluye carga de imágenes (productos, clientes, proveedores, empresas), búsqueda, filtros y paginación en todos los módulos de catálogo.
8. Construido con React 19 + TypeScript, arquitectura por capas, carga diferida por ruta y 164 pruebas automatizadas.
9. Nómina y asistencia ya tienen el modelo de datos y las reglas de negocio listas; falta conectarlas al backend.
10. Es una base de producto en uso: los módulos comercialmente centrales (ventas, compras, inventario, clientes, proveedores, contabilidad, empleados, proyectos) ya funcionan contra API real.

---

## 2. Módulos y qué resuelve cada uno

| Módulo | Ruta | Qué manages | Lo que el usuario puede hacer | ¿API real? |
|---|---|---|---|---|
| **Dashboard** | `/` | Indicadores del negocio | Ver KPIs del mes (ventas, compras, clientes activos, utilidad neta), gráfico ventas vs. compras, gráfico por categoría, top productos, actividad reciente, recordatorios | Sí |
| **Ventas (POS)** | `/ventas` | Órdenes de venta con carrito de productos | Armar venta en carrito, buscar cliente, guardar borrador o completar la venta, editar sólo si está pendiente, ver detalle, eliminar, filtrar por estado, buscar, paginar. Calcula ITBIS 18% | Sí (CRUD + completar venta) |
| **Compras** | `/compras` | Órdenes de compra a proveedores | Alta, edición, eliminación, filtro por estado (pendiente/completada/cancelada), búsqueda, paginación | Sí (CRUD completo) |
| **Inventario** | `/inventario` | Productos y existencias | Alta y edición con **carga de imagen** (arrastrar y soltar), precio, stock, categoría, activar/desactivar, eliminar, buscar, paginar | Sí (CRUD completo) |
| **Clientes** | `/clientes` | Cartera de clientes | Alta, edición, eliminación, **carga de logo/foto**, marcar activo/inactivo, buscar, paginar | Sí (CRUD completo) |
| **Proveedores** | `/proveedores` | Proveedores y contactos | Alta, edición, eliminación, **carga de imagen**, categoría, persona de contacto, buscar, paginar | Sí (CRUD completo) |
| **Contabilidad** | `/contabilidad` | Transacciones de ingreso y egreso | Alta/edición (descripción, tipo, monto, categoría, estado, número de referencia), eliminar, **KPIs de Ingresos / Egresos / Balance**, filtro por tipo, buscar | Sí (CRUD completo) |
| **RRHH** | `/rrhh` | Expedientes de empleados | Alta y edición con **formulario de 3 pasos**, eliminación, filtros (búsqueda + estado), KPIs, paginación, acceso directo a Nómina y Asistencia | Sí (CRUD completo) |
| **Nómina** | `/rrhh/nomina` | Cálculo de nómina | Seleccionar empleado activo, calcular salario (bonos y deducciones), ver datos bancarios, estado del periodo | **No — cálculo local, no persiste** |
| **Asistencia** | `/rrhh/asistencia` | Ponche entrada/pausa/salida | Registrar ponche, ver historial paginado, KPIs y 4 gráficos (área, barra, pie) | **No — datos de demostración** |
| **Proyectos** | `/proyectos` | Proyectos y presupuesto | Alta/edición con presupuesto, gastado, fechas y % de avance, barra de progreso, KPIs, filtro por estado, buscar, paginar | Sí (CRUD completo) |
| **Reportes** | `/reportes` | Consolidado del negocio | 4 tarjetas resumen, Top 5 clientes, Top 10 productos, gráfico de barras de los últimos 7 días | Consume los stores |
| **Configuración** | `/configuracion` | Empresa, usuarios, preferencias | Pestañas General / Empresas / Usuarios. General: datos de empresa, IVA, moneda, zona horaria, idioma. Empresas: CRUD con búsqueda. Usuarios: crear, cambiar rol, activar/desactivar, eliminar | Sí |
| **Soporte** | `/soporte` | Chat de ayuda en la app | Chat con respuestas automáticas, accesos rápidos a preguntas frecuentes, escalado a un humano | **No — bot local por reglas** |
| **Acceso** | `/login`, `/register` | Sesión de usuario | Iniciar sesión, ver/ocultar contraseña, "recordarme", registro de cuenta, aviso de sesión expirada | Sí |

---

## 3. Roles y control de acceso

**6 roles**: Super Administrador · Administrador · Ventas · Inventario · Contabilidad · Recursos Humanos

**3 permisos** por módulo: `read` · `write` · `delete`, sobre una matriz de **11 módulos**.

| Dónde se aplica hoy | Comportamiento |
|---|---|
| Menú lateral | Oculta los módulos a los que el usuario no tiene permiso de lectura |
| Configuración | Las pestañas Empresas y Usuarios sólo las ve el Super Administrador |
| Formularios de alta y edición | Se aplican validaciones por tipo de dato (correo, número con mínimo/máximo/paso, archivo) y confirmación antes de eliminar |

---

## 4. Datos que maneja el sistema

| Entidad | Campos de negocio clave |
|---|---|
| **Venta** | Estado (pendiente/completada), total, cliente, notas, fecha; ítems con cantidad, precio unitario y subtotal |
| **Compra** | Estado (pendiente/completada/cancelada), total, proveedor, notas; ítems con cantidad, precio unitario y subtotal |
| **Producto** | Precio, existencia, categoría, empresa, activo/inactivo, imagen |
| **Cliente** | Activo/inactivo, total comprado, empresa, avatar |
| **Proveedor** | Categoría, persona de contacto, activo/inactivo |
| **Empleado** | Puesto, departamento, fecha de ingreso, salario, estado, horario, AFP, ARS, NSS, banco y número de cuenta |
| **Transacción contable** | Tipo (ingreso/egreso), monto, fecha, categoría, estado (conciliado/pendiente), número de referencia |
| **Proyecto** | Estado, presupuesto, gastado, fecha de inicio y fin, % de avance |
| **Empresa** | RNC / identificación fiscal, razón social, logotipo, activa/inactiva |
| **Categoría** | Nombre, descripción, empresa, activa/inactiva |
| **Usuario** | Rol, activo/inactivo, empresa |
| **Nómina** | Periodo, fecha de pago, salario base, bonificaciones, deducciones, salario neto, estado (borrador/procesado/pagado) |
| **Beneficios** | Vacaciones (totales, usados, disponibles), permisos (tipo, días, estado), seguro médico (póliza, vencimiento, dependientes), formación (certificado) |
| **Asistencia** | Registro de ponche (entrada/pausa/salida), estado (a tiempo/tardanza/ausencia), ubicación (lat, lng), horario del empleado, horas regulares y extras |

---

## 5. Capacidades transversales

**Idiomas** — Español e inglés con archivos de traducción completos y en paralelo (30+ secciones). El idioma elegido se recuerda entre sesiones; por defecto se detecta el del navegador.

**Sesión y seguridad** — Inicio de sesión con token JWT, expiración detectada en vivo (el usuario es desconectado solo al vencer el token), opción "recordarme" (si la marca, la sesión sobrevive al cierre del navegador), rutas protegidas con redirección automática al login.

**Avisos y control de errores** — Notificaciones tipo toast (éxito, error, advertencia, información), modales de confirmación para acciones destructivas, pantalla de error global con reintento y acceso al dashboard.

**Dashboard** — KPIs de ventas del mes, compras del mes, clientes activos y utilidad neta, con gráficos de barras (ventas vs. compras) y dona (distribución por categoría), más top de productos, actividad reciente y recordatorios.

**Carga de imágenes** — En productos, clientes, proveedores y empresas, con arrastrar y soltar, previsualización y validación de formato.

**Consistencia de las pantallas** — Búsqueda, filtros y paginación (10 registros por página) en todos los módulos de catálogo; componentes reutilizables de formulario, tabla, paginación, botones de acción, modal, tarjetas y badges.

**Rendimiento** — Cada módulo se carga bajo demanda (carga diferida por ruta), de modo que el usuario descarga sólo la pantalla que va a usar.

**Arquitectura** — Separación en capas: `domain` (entidades, tipos, reglas de negocio puras), `application` (casos de uso), `infrastructure` (API), `stores` (estado), `components` y `pages` (presentación). Permite evolucionar la API sin romper las pantallas.

**Calidad** — 18 archivos de pruebas automatizadas, 164 pruebas en verde al momento de este documento, con linter y typecheck estricto.

---

## 6. Integración con backend

- **REST API** con autenticación por token. Base configurable por variable de entorno (por defecto `http://localhost:5106`).
- **CRUD completo** en 9 recursos: clientes, ventas, compras, proveedores, productos, empleados, transacciones contables, proyectos, empresas y usuarios.
- **Endpoints de estado**: completar una venta, cambiar el rol de un usuario, activar/desactivar un usuario, listar ventas por estado y pendientes.
- **Manejo de sesión vencida centralizado**: cualquier respuesta 401 cierra la sesión y redirige al login de forma consistente en toda la app.

---

## 7. Estado de madurez — qué funciona y qué no (leer antes de vender)

| Capacidad | Estado | Observación |
|---|---|---|
| Ventas, Compras, Inventario, Clientes, Proveedores, Contabilidad, RRHH, Proyectos, Empresas, Usuarios, Dashboard | **Listo** | CRUD completo contra API real |
| Búsqueda, filtros, paginación, imágenes, validaciones, notificaciones | **Listo** | En todos los módulos de catálogo |
| Roles y matriz de permisos | **Parcial** | La matriz existe y filtra el menú y las pestañas de administración; los botones de alta/edición/baja todavía se muestran a todos los usuarios |
| Nómina | **Parcial** | Modelo de datos y cálculo (AFP, SFS, bonuses, horas extras) implementados y probados en el frontend; falta endpoint para persistir |
| Asistencia | **Parcial** | Pantalla, KPIs y gráficos listos; los datos son de demostración, falta conexión con el reloj o el API del backend |
| Chat de Soporte | **Parcial** | Chat funcional con respuestas frecuentes; no es aún un asistente de IA conectado a un modelo |
| Exportar a Excel / CSV / PDF e importar planillas | **No implementado** | No existe hoy en ninguna pantalla |
| Ordenamiento de tablas por columna | **No implementado** | Los ordenamientos actuales son internos, no por el usuario |
| Vista de detalle ampliada | **Parcial** | Sólo Ventas tiene pantalla de detalle completa |
| Gestión de Categorías | **Parcial** | El backend expone crear y borrar, pero no hay pantalla ni actualización |
| Multi-empresa | **Parcial** | Existen empresa, RNC y logotipo; el registro de usuario asigna hoy una empresa por defecto |
| Traducción completa | **Parcial** | Login, Registro y algunas etiquetas del dashboard tienen textos fijos en un solo idioma |

---

## 8. Stack técnico

| Capa | Tecnología |
|---|---|
| Interfaz | React 19, TypeScript 6 |
| Build | Vite 8 |
| Navegación | React Router 7 |
| Estado | Zustand 5 |
| Gráficos | Recharts 3 |
| Iconos | Lucide React |
| Idiomas | i18next 26 + react-i18next 17 |
| Pruebas | Vitest 4, Testing Library, jsdom |
| Calidad | ESLint 10, typecheck estricto |

---

## 9. Datos que faltan para cerrar el material comercial

Completar antes de handing out:

- [ ] Nombre comercial del producto y logo
- [ ] Mercado objetivo y tamaño de empresa cliente (micro, pequeña, mediana)
- [ ] Planes, precios y qué incluye cada uno
- [ ] Qué incluye la puesta en marcha (días, migración de datos, capacitación)
- [ ] Estado del backend: URL de producción, disponibilidad, backups, quién lo opera
- [ ] Datos de contacto, redes y canal de soporte comercial
- [ ] Casos de uso verticales ya resueltos (restaurante, ferretería, consultorio, Etc.)
- [ ] Testimonios o clientes piloto
- [ ] Roadmap de las capacidades de la sección 7 marcadas como "no implementado" / "parcial"
- [ ] Si aplica: pasarela de pago, facturación electrónica y bancareidad

---

## 10. Instrucciones para Claude Code (cómo usar este documento)

Generar **una página de información (one-pager)** para promoting el sistema frente a clientes finales, en español profesional neutro.

Reglas:
1. **Usar sólo lo verificado** en las secciones 2 a 6. No inventar funciones, precios, integraciones ni métricas.
2. La sección 7 es de control de realidad: **no** presentar como disponible lo que está marcado como parcial o no implementado. Si una capacidad es comercialmente relevante y está pendiente, mencionarla como "en camino" y nunca como functionality existente.
3. Sección 9: dejar marcadores visibles `[PENDIENTE: ...]` donde falte información.
4. Estructura sugerida: titular + promise en una línea · para quién es · módulos con su beneficio en una frase cada uno ·roles y control de acceso · diferenciadores técnicos (multidioma, roles, arquitectura, carga diferida, 164 pruebas) · qué está en camino · CTA con los datos de contacto pendientes.
5. Longitud: una página, aproximadamente 600-800 palabras, más un recuadro final de "Datos a completar".
6. Tono: profesional y concreto, orientado a beneficios, sin exagerar ni usar lenguaje técnico innecesario.
7. Generar una segunda versión de una página con los marcadores `[PENDIENTE]` resueltos con datos de ejemplo claramente marcados como tales.
