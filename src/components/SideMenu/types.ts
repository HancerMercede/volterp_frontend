import type { ReactNode } from "react";

/** A group with children (it expands, it does not navigate) or a leaf (it navigates to its href). */
export interface MenuItem {
  /** The accumulated prefix ("/ventas/nueva-venta"); a group that is also a route adds "::group". */
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /** La hoja navega a el; un grupo que tambien es ruta lleva la pantalla de su modulo. */
  href?: string;
  permission?: string;
  disabled?: boolean;
  children?: MenuItem[];
}

/** A route of the app: the flat source of the tree. Only the path is mandatory. */
export interface RouteDef {
  path: string;
  label?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  order?: number;
  permission?: string;
  disabled?: boolean;
  hidden?: boolean;
  /** The prefix of the group the route hangs from ("/ventas"), never an id. */
  parent?: string;
}

/** The metadata of a group that is not a route of the app, indexed by its path prefix. */
export interface GroupMeta {
  label?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  order?: number;
  permission?: string;
  disabled?: boolean;
}

export interface LeafProps {
  item: MenuItem;
  /** The leaf is the active one: it carries aria-current="page". */
  active: boolean;
  /** The leaf is disabled: it does not navigate. */
  disabled: boolean;
  /** The title of a group carries the state of its panel: the control opens and closes it. */
  open?: boolean;
  onSelect: () => void;
}

export interface SideMenuProps {
  items: MenuItem[];
  /** When present the menu follows it and opens the groups that hold it. */
  activeId?: string | null;
  /** The filtering lives here and nowhere else. */
  permissions?: string[];
  /** La app pasa su propio enlace: el modulo no conoce ningun router. Dibuja las hojas y el titulo de los grupos. */
  renderLeaf?: (props: LeafProps) => ReactNode;
  ariaLabel?: string;
  defaultOpenIds?: string[];
  className?: string;
}
