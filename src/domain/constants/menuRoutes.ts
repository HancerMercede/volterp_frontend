/**
 * La declaracion del menu de la aplicacion.
 *
 * Solo datos: aqui no hay React ni traducciones. Las etiquetas y los iconos
 * se nombran por CLAVE (la app tiene dos idiomas y sus propios iconos) y el
 * hook que convierte esta declaracion en las rutas que consume el menu
 * lateral los resuelve (src/application/hooks/useMenuItems.ts).
 *
 * Los paths son los paths del router: el guard de deriva
 * (src/test/pages/menuRoutes.test.ts) revisa que los dos no se separen, para
 * que el menu nunca prometa una pantalla que no existe.
 */

/** Una pantalla de la aplicacion. */
export interface MenuRoute {
  /** El path de la ruta ("/ventas"). */
  path: string;
  /** La clave i18n de la etiqueta ("sidebar.ventas"). */
  labelKey: string;
  /** La clave del icono de la app ("ventas"). */
  iconKey: string;
  /** El permiso que el llamante necesita para verla ("ventas.read"). */
  permission?: string;
  /** El orden dentro de su padre: ascendente. */
  order: number;
  /** Una pantalla oculta no llega al menu. */
  hidden?: boolean;
  /**
   * El prefijo del grupo del que cuelga la pantalla ("/ventas"). La
   * pantalla cuelga de ese grupo aunque su propio path no este debajo: el
   * POS vive en "/pos" y pertenece a "/ventas".
   */
  parent?: string;
}

/** Un grupo de pantallas: el modulo que tiene mas de una pantalla. */
export interface MenuGroup {
  /** El prefijo del path del grupo ("/ventas"). */
  prefix: string;
  /** La clave i18n de la etiqueta del grupo ("sidebar.ventas"). */
  labelKey: string;
  /** La clave del icono del grupo ("ventas"). */
  iconKey: string;
  /** El permiso que el llamante necesita para ver el grupo. */
  permission?: string;
  /** El orden del grupo dentro del menu: ascendente. */
  order: number;
  /**
   * La clave i18n de la etiqueta del enlace del grupo que tambien es una
   * ruta (la pantalla principal del modulo).
   */
  indexLabelKey?: string;
}

/**
 * Las pantallas de la app, en el orden en que el menu las dibuja.
 *
 * La lista de modulos no cambia: lo que cambia es como se dibuja. Un
 * modulo con mas de una pantalla se dibuja como grupo (sus hijos se
 * indetan) y un modulo con una sola pantalla sigue siendo una hoja plana.
 */
export const MENU_ROUTES: MenuRoute[] = [
  {
    path: '/',
    labelKey: 'sidebar.dashboard',
    iconKey: 'dashboard',
    permission: 'dashboard.read',
    order: 10,
  },
  {
    path: '/ventas',
    labelKey: 'sidebar.ventas',
    iconKey: 'ventas',
    permission: 'ventas.read',
    order: 20,
  },
  {
    // El POS vive dentro de ventas: cuelga del grupo aunque su path no
    // este debajo de el.
    path: '/pos',
    labelKey: 'sidebar.pos',
    iconKey: 'pos',
    permission: 'pos.read',
    order: 20,
    parent: '/ventas',
  },
  {
    path: '/compras',
    labelKey: 'sidebar.compras',
    iconKey: 'compras',
    permission: 'compras.read',
    order: 30,
  },
  {
    path: '/inventario',
    labelKey: 'sidebar.inventario',
    iconKey: 'inventario',
    permission: 'inventario.read',
    order: 40,
  },
  {
    path: '/clientes',
    labelKey: 'sidebar.clientes',
    iconKey: 'clientes',
    permission: 'clientes.read',
    order: 50,
  },
  {
    path: '/proveedores',
    labelKey: 'sidebar.proveedores',
    iconKey: 'proveedores',
    permission: 'proveedores.read',
    order: 60,
  },
  {
    path: '/contabilidad',
    labelKey: 'sidebar.contabilidad',
    iconKey: 'contabilidad',
    permission: 'contabilidad.read',
    order: 70,
  },
  {
    path: '/contabilidad/cuentas',
    labelKey: 'sidebar.cuentas',
    iconKey: 'cuentas',
    permission: 'contabilidad.read',
    order: 10,
  },
  {
    path: '/contabilidad/cxc',
    labelKey: 'sidebar.cxc',
    iconKey: 'cxc',
    permission: 'contabilidad.read',
    order: 20,
  },
  {
    path: '/contabilidad/cxp',
    labelKey: 'sidebar.cxp',
    iconKey: 'cxp',
    permission: 'contabilidad.read',
    order: 30,
  },
  {
    path: '/rrhh',
    labelKey: 'sidebar.rrhh',
    iconKey: 'rrhh',
    permission: 'rrhh.read',
    order: 80,
  },
  {
    path: '/rrhh/nomina',
    labelKey: 'sidebar.nomina',
    iconKey: 'nomina',
    permission: 'rrhh.read',
    order: 10,
  },
  {
    path: '/rrhh/asistencia',
    labelKey: 'sidebar.asistencia',
    iconKey: 'asistencia',
    permission: 'rrhh.read',
    order: 20,
  },
  {
    path: '/proyectos',
    labelKey: 'sidebar.proyectos',
    iconKey: 'proyectos',
    permission: 'proyectos.read',
    order: 90,
  },
  {
    path: '/reportes',
    labelKey: 'sidebar.reportes',
    iconKey: 'reportes',
    permission: 'reportes.read',
    order: 100,
  },
  {
    path: '/configuracion',
    labelKey: 'sidebar.configuracion',
    iconKey: 'configuracion',
    permission: 'configuracion.read',
    order: 110,
  },
  {
    path: '/facturacion',
    labelKey: 'sidebar.facturacion',
    iconKey: 'facturacion',
    permission: 'facturacion.read',
    order: 120,
  },
  {
    path: '/facturacion/emisores',
    labelKey: 'sidebar.emisores',
    iconKey: 'emisores',
    permission: 'facturacion.read',
    order: 10,
  },
  {
    path: '/facturacion/rangos',
    labelKey: 'sidebar.rangos',
    iconKey: 'rangos',
    permission: 'facturacion.read',
    order: 20,
  },
  {
    path: '/facturacion/certificados',
    labelKey: 'sidebar.certificados',
    iconKey: 'certificados',
    permission: 'facturacion.read',
    order: 30,
  },
  {
    path: '/facturacion/comprobantes',
    labelKey: 'sidebar.comprobantes',
    iconKey: 'comprobantes',
    permission: 'facturacion.read',
    order: 40,
  },
  {
    path: '/facturacion/recepcion',
    labelKey: 'sidebar.recepcion',
    iconKey: 'recepcion',
    permission: 'facturacion.read',
    order: 50,
  },
  {
    path: '/facturacion/configuracion',
    labelKey: 'sidebar.facturacionConfiguracion',
    iconKey: 'facturacionConfiguracion',
    permission: 'facturacion.read',
    order: 60,
  },
  {
    // El soporte lo ve todo el mundo: no es un modulo, no tiene permiso.
    path: '/soporte',
    labelKey: 'sidebar.soporte',
    iconKey: 'soporte',
    order: 130,
  },
];

/**
 * Los grupos del menu: los modulos que tienen mas de una pantalla. El
 * grupo se dibuja como un boton que abre y cierra, y sus hijos se
 * indetan.
 */
export const MENU_GROUPS: MenuGroup[] = [
  {
    prefix: '/ventas',
    labelKey: 'sidebar.ventas',
    iconKey: 'ventas',
    permission: 'ventas.read',
    order: 20,
    indexLabelKey: 'sidebar.resumen',
  },
  {
    prefix: '/contabilidad',
    labelKey: 'sidebar.contabilidad',
    iconKey: 'contabilidad',
    permission: 'contabilidad.read',
    order: 70,
    indexLabelKey: 'sidebar.resumen',
  },
  {
    prefix: '/rrhh',
    labelKey: 'sidebar.rrhh',
    iconKey: 'rrhh',
    permission: 'rrhh.read',
    order: 80,
    indexLabelKey: 'sidebar.resumen',
  },
  {
    prefix: '/facturacion',
    labelKey: 'sidebar.facturacion',
    iconKey: 'facturacion',
    permission: 'facturacion.read',
    order: 120,
    indexLabelKey: 'sidebar.resumen',
  },
];
