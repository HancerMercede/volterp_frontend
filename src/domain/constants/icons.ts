import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  Truck,
  TrendingUp,
  UserCog,
  FolderKanban,
  FileBarChart,
  Settings,
  Receipt,
  LifeBuoy,
  // Los iconos de las pantallas que cuelgan de un grupo.
  CreditCard,
  Landmark,
  HandCoins,
  WalletCards,
  Banknote,
  CalendarCheck,
  Building2,
  Hash,
  ShieldCheck,
  FileText,
  Inbox,
  Cog,
  type LucideIcon,
} from "lucide-react";

/**
 * Los iconos del menu, por clave.
 *
 * La declaracion del menu (src/domain/constants/menuRoutes.ts) nombra el
 * icono por clave y el hook que arma el menu (useMenuItems) lo busca aqui:
 * hay un solo mapa de iconos en la app.
 */
export const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  ventas: ShoppingCart,
  compras: ShoppingBag,
  inventario: Package,
  clientes: Users,
  proveedores: Truck,
  contabilidad: TrendingUp,
  rrhh: UserCog,
  proyectos: FolderKanban,
  reportes: FileBarChart,
  configuracion: Settings,
  facturacion: Receipt,
  soporte: LifeBuoy,
  pos: CreditCard,
  cuentas: Landmark,
  cxc: HandCoins,
  cxp: WalletCards,
  nomina: Banknote,
  asistencia: CalendarCheck,
  emisores: Building2,
  rangos: Hash,
  certificados: ShieldCheck,
  comprobantes: FileText,
  recepcion: Inbox,
  facturacionConfiguracion: Cog,
};
