import { useMemo } from "react";
import { buildMenuTree, matchActiveId } from "./buildMenuTree";
import type { GroupMeta, MenuItem, RouteDef } from "./types";

export interface UseMenuTreeOptions {
  pathname: string;
  /** The metadata of the groups that are not routes, indexed by their path prefix. */
  groups?: Record<string, GroupMeta>;
}

export interface MenuTree {
  /** The tree of the menu. It is immutable: nobody mutates it. */
  items: MenuItem[];
  activeId: string | null;
}

/** The routes and the groups keep the same reference: when they change, the tree is built again. */
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
