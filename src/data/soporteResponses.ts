export const AI_RESPONSES: Record<string, string> = {
  inventario: `Para gestionar el inventario en Volterp:

1. Ve al módulo "Inventario" en el menú lateral
2. Aquí puedes ver todos tus productos con su stock actual
3. Para agregar un nuevo producto, haz clic en "+ Nuevo Producto"
4. Rellena los campos: nombre, categoría, stock, precio y proveedor
5. El stock se actualiza automáticamente cuando registras ventas o compras

¿Necesitas ayuda con algo más específico?`,

  empleado: `Para gestionar empleados en Volterp:

1. Ve al módulo "RRHH" en el menú lateral
2. Verás la lista de empleados con sus estados (activo, inactivo, en permiso)
3. Para crear un nuevo empleado, haz clic en "+ Nuevo Empleado"
4. Completa el formulario multi-paso con datos personales, salario y beneficios
5. Cada empleado tiene acceso según su rol y permisos asignados

¿Hay algo más que quieras saber?`,

  ventas: `Para registrar una venta en Volterp:

1. Ve al módulo "Ventas" en el menú lateral
2. Haz clic en "+ Nueva Venta"
3. Selecciona o busca un cliente
4. Agrega productos al carrito desde el catálogo
5. Ajusta cantidades y verifica el total (incluye ITBIS 18%)
6. Confirma la venta - se actualizará el stock automáticamente

¿Necesitas más información?`,

  compras: `Para registrar una compra en Volterp:

1. Ve al módulo "Compras" en el menú lateral
2. Haz clic en "+ Nueva Compra"
3. Ingresa los datos del proveedor y producto
4. Especifica la cantidad y el total de la compra
5. La compra afecta el inventario cuando se marca como "recibida"

¿Tienes alguna otra pregunta?`,

  reportes: `Para generar reportes en Volterp:

1. Ve al módulo "Reportes" en el menú lateral
2. Encontrarás:
   - Resumen de ventas y compras
   - Productos más vendidos
   - Top clientes por compras
   - Ventas de los últimos 7 días con gráfico
3. Los datos se actualizan en tiempo real según las transacciones

¿Necesitas ayuda con algún reporte específico?`,

  configuracion: `Para configurar Volterp:

1. Ve al módulo "Configuración" en el menú lateral
2. Aquí puedes ajustar:
   - Datos de la empresa
   - Preferencias de sistema
   - Roles y permisos de usuarios
3. Solo los administradores tienen acceso a esta sección

¿Hay algo específico que quieras configurar?`,

  clientes: `Para gestionar clientes en Volterp:

1. Ve al módulo "Clientes" en el menú lateral
2. Verás la lista de todos los clientes registrados
3. Para agregar un cliente, haz clic en "+ Nuevo Cliente"
4. Complete los datos: nombre, email, teléfono, dirección y empresa (opcional)
5. El sistema hace seguimiento de las compras totales por cliente

¿Necesitas más información?`,

  proyectos: `Para gestionar proyectos en Volterp:

1. Ve al módulo "Proyectos" en el menú lateral
2. Podrás crear proyectos asociados a clientes
3. Cada proyecto tiene: presupuesto, gasto, progreso y estado
4. Estados disponibles: Pendiente, En Progreso, Completado
5. El sistema calcula el porcentaje de avance automáticamente

¿Tienes alguna pregunta sobre proyectos?`,

  contabilidad: `Para gestión contable en Volterp:

1. Ve al módulo "Contabilidad" en el menú lateral
2. Registra transacciones como ingresos o egresos
3. Cada transacción tiene: descripción, tipo, monto, fecha, categoría y estado
4. El sistema calcula automáticamente:
   - Total de ingresos
   - Total de egresos
   - Balance general
5. Estados: Pendiente o Conciliada

¿Necesitas más detalles?`,

  nomina: `Para procesar nómina en Volterp:

1. Ve a RRHH > Nómina
2. Selecciona un empleado de la lista
3. El sistema calcula automáticamente:
   - Salario bruto
   - Descuentos (AFP, ARS, IRS)
   - Salario neto
4. Verás el desglose completo de ingresos y deducciones

¿Hay algo más que quieras saber sobre nómina?`,

  farewell: `¡Perfecto! Me alegra haber podido ayudarte.

Recuerda que puedes volver a este chat en cualquier momento si tienes más preguntas.

¡Que tengas un excelente día! 👋`,

  default: `Gracias por tu pregunta. Déjame ver si puedo ayudarte...

Para el tema que mencionas, te recomiendo:

1. Revisa el módulo específico relacionado en el menú lateral
2. Consulta la documentación del sistema
3. Si no encuentras la respuesta, puedo conectarte con nuestro equipo de soporte humano que te ayudará directamente.

¿En qué otro tema puedo ayudarte?`
};

const FAREWELL_KEYWORDS = [
  'gracias', 'thank', 'ok', 'perfecto', 'listo', 'todo bien',
  'eso es todo', 'eso es todo gracias', 'ya está', 'ya esta',
  'ya terminé', 'ya termine', 'ya terminé', 'terminamos',
  'salir', 'chao', 'hasta luego', 'nos vemos', 'adiós',
  'adiós', 'muchas gracias', 'muchas gracias', 'me ajudou',
  'me ayudo', 'resolved', 'solucionado', 'perfecto gracias',
  'todo klar', 'alles gut', 'danke', 'fine', 'good', 'great',
  'awesome', 'thanks', 'that\'s all', 'thats all', 'close',
  'cerrar', 'cerrar chat', 'finalizar'
];

const MODULE_KEYWORDS = [
  'inventario', 'producto', 'stock', 'mercancía',
  'empleado', 'rrhh', 'recurso humano', 'trabajador',
  'venta', 'ventas', 'cobrar', 'factura',
  'compra', 'compras', 'orden',
  'reporte', 'reportes', 'estadística', 'métricas',
  'configuración', 'configuracion', 'ajustes', 'settings',
  'cliente', 'clientes', 'contacto',
  'proyecto', 'proyectos', 'tarea',
  'contabilidad', 'transacción', 'transaccion', 'egreso', 'ingreso',
  'nomina', 'nómina', 'pago', 'salario', 'AFP', 'ARS'
];

function isFarewell(message: string): boolean {
  const lower = message.toLowerCase().trim();

  if (FAREWELL_KEYWORDS.some(keyword => lower === keyword)) {
    return true;
  }

  if (lower.includes('gracias') && (lower.includes('ok') || lower.includes('perfecto') || lower.includes('todo'))) {
    return true;
  }

  if (lower === 'gracias' || lower === 'ok' || lower === 'listo' || lower === 'perfecto') {
    return true;
  }

  if (lower.startsWith('gracias') && lower.length < 30) {
    return true;
  }

  return false;
}

function containsModuleKeyword(message: string): boolean {
  const lower = message.toLowerCase();
  return MODULE_KEYWORDS.some(keyword => lower.includes(keyword));
}

export function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim();

  if (isFarewell(lowerMessage)) {
    return AI_RESPONSES.farewell;
  }

  for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
    if (keyword !== 'default' && keyword !== 'farewell' && lowerMessage.includes(keyword)) {
      return response;
    }
  }

  if (containsModuleKeyword(message)) {
    return AI_RESPONSES.default;
  }

  return `Entiendo tu consulta. Para ayudarte mejor, ¿podrías ser más específico?

Puedo asistirte con temas como:
- Inventario y productos
- Ventas y compras
- Empleados y RRHH
- Reportes y estadísticas
- Configuración del sistema

¿En qué módulo necesitas ayuda?`;
}