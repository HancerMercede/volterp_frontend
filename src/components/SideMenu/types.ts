import type { ReactNode } from "react";

/**
 * A node of the menu tree.
 *
 * A node with children is a group: it expands and it does not navigate. A
 * node without children is a leaf: it navigates to its href.
 */
export interface MenuItem {
  /**
   * The accumulated prefix that identifies the node ("/ventas/pos"). A
   * group that is also a route adds the "::group" suffix ("/ventas::group").
   */
  id: string;
  /** The text of the node. */
  label: string;
  /** The icon of the node: it arrives already rendered. */
  icon?: ReactNode;
  /** The badge of the node: it arrives already rendered. */
  badge?: ReactNode;
  /** The path a leaf navigates to. A group never has one. */
  href?: string;
  /** The permission the caller must hold to see the node. */
  permission?: string;
  disabled?: boolean;
  /** The children of a group. */
  children?: MenuItem[];
}

/**
 * A route of the app: the flat source of the tree. Only the path is
 * mandatory.
 */
export interface RouteDef {
  /** The path of the route ("/ventas/facturas"). */
  path: string;
  /** The label of the route: without it the label is inferred from the segment. */
  label?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  /**
   * The order inside its parent: ascending. The nodes without an order keep
   * the order of declaration.
   */
  order?: number;
  /** The permission the caller must hold to see the route. */
  permission?: string;
  disabled?: boolean;
  /** A hidden route does not reach the menu. */
  hidden?: boolean;
  /** The label of the link of a group that is also a route. */
  indexLabel?: string;
  /**
   * The path prefix of the group the route hangs from ("/ventas"). When it
   * is present the route is placed under that group even when its own path
   * is not under it: the POS lives in "/pos" but belongs to "/ventas".
   *
   * The value is the prefix of the group, never an id: the module resolves
   * the prefix to the group node by itself.
   */
  parent?: string;
}

/**
 * The metadata of a group that is not a route of the app, indexed by its
 * path prefix ("/ventas").
 */
export interface GroupMeta {
  label?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  order?: number;
  permission?: string;
  disabled?: boolean;
  /** The label of the link of a group that is also a route. */
  indexLabel?: string;
}

/** What the leaf renderer receives to draw a leaf. */
export interface LeafProps {
  /** The leaf that is being drawn. */
  item: MenuItem;
  /** The leaf is the active one: it carries aria-current="page". */
  active: boolean;
  /** The leaf is disabled: it does not navigate. */
  disabled: boolean;
  /** Called when the leaf is activated (click, Enter or Space). */
  onSelect: () => void;
}

export interface SideMenuProps {
  /** The tree of the menu: it comes from useMenuTree. */
  items: MenuItem[];
  /**
   * The id of the active leaf. When it is present the menu follows it and
   * opens the groups that contain it. Without it the menu keeps its own
   * state.
   */
  activeId?: string | null;
  /**
   * The permissions of the caller. The leaves without them disappear and
   * the groups left empty are pruned. The filtering lives here and nowhere
   * else.
   */
  permissions?: string[];
  /**
   * Draws a leaf. The app passes here its own router link: the module does
   * not know any router.
   */
  renderLeaf?: (props: LeafProps) => ReactNode;
  /** The label of the nav element. */
  ariaLabel?: string;
  /** The groups that start open when the menu keeps its own state. */
  defaultOpenIds?: string[];
  /** Extra class for the nav element. */
  className?: string;
}
