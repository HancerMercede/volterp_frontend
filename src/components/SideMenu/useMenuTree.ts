import { useMemo } from "react";
import { buildMenuTree, matchActiveId } from "./buildMenuTree";
import type { GroupMeta, MenuItem, RouteDef } from "./types";

export interface UseMenuTreeOptions {
  /** The path of the current location: the app gets it from its router. */
  pathname: string;
  /**
   * The metadata of the groups that are not routes, indexed by their path
   * prefix ("/ventas").
   */
  groups?: Record<string, GroupMeta>;
}

export interface MenuTree {
  /** The tree of the menu. It is immutable: nobody mutates it. */
  items: MenuItem[];
  /** The id of the leaf the pathname points at, when there is one. */
  activeId: string | null;
}

/**
 * Builds the tree of the menu out of the routes of the app and tells which
 * leaf is the active one.
 *
 * The routes and the groups have to keep the same reference (a constant of
 * the module or a useMemo): when they change the tree is built again.
 */
export function useMenuTree(
  routes: RouteDef[],
  options: UseMenuTreeOptions,
): MenuTree {
  const { pathname, groups } = options;

  return useMemo(() => {
    const items = buildMenuTree(routes, groups);
    const activeId = matchActiveId(items, pathname);
    return { items, activeId };
  }, [routes, groups, pathname]);
}
