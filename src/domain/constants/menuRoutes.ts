/**
 * La declaracion del menu de la aplicacion: solo datos, sin React ni
 * traducciones. Las etiquetas y los iconos viajan por CLAVE y useMenuItems
 * los resuelve. Los paths son los del router y el guard de deriva
 * (menuRoutes.test.ts) revisa que los dos no se separen.
 */

export interface MenuRoute {
  path: string;
  /** La clave i18n de la etiqueta ("sidebar.ventas"). */
  labelKey: string;
  /** La clave del icono de la app ("ventas"). */
  iconKey: string;
  permission?: string;
  /** El orden dentro de su padre: ascendente. */
  order: number;
  /** Una pantalla oculta no llega al menu. */
  hidden?: boolean;
  /**
   * El prefijo del grupo del que cuelga la pantalla ("/ventas"), nunca un id.
   * La pantalla cuelga de ese grupo aunque su path no este debajo: la venta
   * nueva vive en "/nueva-venta" y pertenece a "/ventas".
   */
  parent?: string;
}

export interface MenuGroup {
  prefix: string;
  labelKey: string;
  iconKey: string;
  permission?: string;
  /** El orden del grupo dentro del menu: ascendente. */
  order: number;
  /** La clave i18n de la etiqueta del enlace del grupo que tambien es una ruta. */
  indexLabelKey?: string;
}

/**
 * La lista de modulos no cambia: lo que cambia es como se dibuja. Un modulo
 * con mas de una pantalla se dibuja como grupo y uno con una sola pantalla
 * sigue siendo una hoja plana.
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
    // La venta nueva cuelga del grupo de ventas: su path no esta debajo.
    path: '/nueva-venta',
    labelKey: 'sidebar.nuevaVenta',
    iconKey: 'nuevaVenta',
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

/** Los grupos del menu: los modulos que tienen mas de una pantalla. */
export const MENU_GROUPS: MenuGroup[] = [
  {
    prefix: '/ventas',
    labelKey: 'sidebar.ventas',
    iconKey: 'ventas',
    permission: 'ventas.read',
    order: 20,
    indexLabelKey: 'sidebar.ventas',
  },
  {
    prefix: '/contabilidad',
    labelKey: 'sidebar.contabilidad',
    iconKey: 'contabilidad',
    permission: 'contabilidad.read',
    order: 70,
    indexLabelKey: 'sidebar.contabilidad',
  },
  {
    prefix: '/rrhh',
    labelKey: 'sidebar.rrhh',
    iconKey: 'rrhh',
    permission: 'rrhh.read',
    order: 80,
    indexLabelKey: 'sidebar.rrhh',
  },
  {
    prefix: '/facturacion',
    labelKey: 'sidebar.facturacion',
    iconKey: 'facturacion',
    permission: 'facturacion.read',
    order: 120,
    indexLabelKey: 'sidebar.facturacion',
  },
];
