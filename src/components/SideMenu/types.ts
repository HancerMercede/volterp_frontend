import type { ReactNode } from "react";

/** A group with children (it expands, it does not navigate) or a leaf (it navigates to its href). */
export interface MenuItem {
  /** The accumulated prefix ("/ventas/pos"); a group that is also a route adds "::group". */
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /** A group never has one. */
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
  indexLabel?: string;
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
  indexLabel?: string;
}

export interface LeafProps {
  item: MenuItem;
  /** The leaf is the active one: it carries aria-current="page". */
  active: boolean;
  /** The leaf is disabled: it does not navigate. */
  disabled: boolean;
  onSelect: () => void;
}

export interface SideMenuProps {
  items: MenuItem[];
  /** When present the menu follows it and opens the groups that hold it. */
  activeId?: string | null;
  /** The filtering lives here and nowhere else. */
  permissions?: string[];
  /** The app passes its own router link: the module knows no router. */
  renderLeaf?: (props: LeafProps) => ReactNode;
  ariaLabel?: string;
  defaultOpenIds?: string[];
  className?: string;
}
