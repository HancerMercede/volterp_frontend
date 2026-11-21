import type { ReactNode } from "react";
import type { GroupMeta, MenuItem, RouteDef } from "./types";

/**
 * The suffix a group gets when the group is also a route: the group does
 * not navigate and its own link becomes the first child.
 */
export const GROUP_SUFFIX = "::group";

/** The label of the link of a group that is also a route, when nobody gives one. */
const DEFAULT_INDEX_LABEL = "Resumen";

interface BuildNode {
  /** The prefix of the node inside the tree ("/ventas", "/ventas/pos"). */
  prefix: string;
  /** The path of the route the node points to, when the node is a route. */
  path?: string;
  label?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  order?: number;
  permission?: string;
  disabled?: boolean;
  indexLabel?: string;
  /** The node is the target of a route. */
  isRoute: boolean;
  /** The node is the link of a group that is also a route. */
  isIndexLink: boolean;
  /** The children of the node, indexed by their prefix. */
  children: Map<string, BuildNode>;
  /** The order of declaration, used when nobody gives an order. */
  seq: number;
}

/**
 * Builds the tree of the menu out of the flat routes of the app.
 *
 * The rules:
 * 1. Every segment of a path creates a level and the id of a node is its
 *    accumulated prefix ("/ventas/pos").
 * 2. The routes with a parameter (":id"), with a wildcard ("*") or hidden
 *    do not reach the menu.
 * 3. The label is inferred from the segment when the route does not give
 *    one. The inference does not add accents: give the label explicitly
 *    when it has them.
 * 4. The order is the "order" of the route, ascending; the routes without
 *    an order keep the order of declaration.
 * 5. A group that is also a route gets the id "<prefix>::group" and its own
 *    link becomes the first child ("Resumen" or the "indexLabel").
 *
 * The routes with a "parent" hang from the group of that prefix even when
 * their own path is not under it.
 */
export function buildMenuTree(
  routes: RouteDef[],
  groups: Record<string, GroupMeta> = {},
): MenuItem[] {
  const roots = new Map<string, BuildNode>();
  const byPrefix = new Map<string, BuildNode>();

  const createNode = (prefix: string, seq: number): BuildNode => ({
    prefix,
    isRoute: false,
    isIndexLink: false,
    children: new Map(),
    seq,
  });

  // The key of a node inside the children of its parent: the path of the
  // route it points to, or its prefix when it is not a route.
  const keyOf = (node: BuildNode): string => node.path ?? node.prefix;

  // Creates the node of a prefix and the chain of its ancestors, when they
  // do not exist yet.
  const ensureNode = (
    prefix: string,
    seq: number,
  ): BuildNode | undefined => {
    const existing = byPrefix.get(prefix);
    if (existing) return existing;
    let parent: BuildNode | undefined;
    let current = "";
    for (const segment of prefix.split("/").filter(Boolean)) {
      current = `${current}/${segment}`;
      let node = byPrefix.get(current);
      if (!node) {
        node = createNode(current, seq);
        byPrefix.set(current, node);
        if (parent) parent.children.set(keyOf(node), node);
        else roots.set(keyOf(node), node);
      }
      parent = node;
    }
    return parent;
  };

  const applyRoute = (
    node: BuildNode,
    route: RouteDef,
    path: string,
    seq: number,
  ): void => {
    node.isRoute = true;
    node.path = path;
    node.label ??= route.label;
    node.icon ??= route.icon;
    node.badge ??= route.badge;
    node.order ??= route.order;
    node.permission ??= route.permission;
    node.disabled ??= route.disabled;
    node.indexLabel ??= route.indexLabel;
    node.seq = seq;
  };

  // The routes that do not reach the menu.
  const entries = routes
    .map((route, index) => ({ route, index }))
    .filter(({ route }) => {
      if (route.hidden) return false;
      if (route.path.includes(":") || route.path.includes("*")) return false;
      return true;
    });

  // 1. The natural tree: every segment of the path creates a level.
  for (const { route, index } of entries) {
    if (route.parent) continue;
    const path = normalizePath(route.path);
    const segments = path.split("/").filter(Boolean);
    let node: BuildNode | undefined;
    if (segments.length === 0) {
      // The root path ("/"): a leaf at the root of the menu.
      node = createNode("/", index);
      byPrefix.set("/", node);
      roots.set(keyOf(node), node);
    } else {
      let prefix = "";
      for (const segment of segments) {
        prefix = `${prefix}/${segment}`;
        node = ensureNode(prefix, index);
      }
    }
    if (node) applyRoute(node, route, path, index);
  }

  // 2. The routes that hang from another group: the prefix of the group is
  //    resolved to the group node here, the app never writes an id.
  for (const { route, index } of entries) {
    if (!route.parent) continue;
    const mount = normalizePath(route.parent);
    const path = normalizePath(route.path);
    const node = createNode(mount === "/" ? path : `${mount}${path}`, index);
    applyRoute(node, route, path, index);
    if (mount === "/") {
      roots.set(keyOf(node), node);
      continue;
    }
    const group = ensureNode(mount, index);
    if (!group) continue;
    group.children.set(keyOf(node), node);
  }

  // 3. The metadata of the groups that are not routes.
  for (const [prefix, meta] of Object.entries(groups)) {
    const node = byPrefix.get(normalizePath(prefix));
    if (!node) continue;
    node.label ??= meta.label;
    node.icon ??= meta.icon;
    node.badge ??= meta.badge;
    node.order ??= meta.order;
    node.permission ??= meta.permission;
    node.disabled ??= meta.disabled;
    node.indexLabel ??= meta.indexLabel;
  }

  // 4. A group that is also a route does not navigate: its own link
  //    becomes the first child.
  const finalize = (node: BuildNode): void => {
    for (const child of node.children.values()) finalize(child);
    if (node.children.size === 0 || !node.isRoute || !node.path) return;
    const link: BuildNode = {
      prefix: node.prefix,
      path: node.path,
      label: node.indexLabel ?? DEFAULT_INDEX_LABEL,
      permission: node.permission,
      disabled: node.disabled,
      isRoute: true,
      isIndexLink: true,
      children: new Map(),
      seq: node.seq,
    };
    const children = new Map<string, BuildNode>();
    children.set(keyOf(link), link);
    for (const [key, child] of node.children) children.set(key, child);
    node.children = children;
  };
  for (const root of roots.values()) finalize(root);

  // 5. The tree of MenuItem.
  const usedIds = new Set<string>();
  const claimId = (preferred: string, fallback: string): string => {
    if (!usedIds.has(preferred)) {
      usedIds.add(preferred);
      return preferred;
    }
    if (!usedIds.has(fallback)) {
      usedIds.add(fallback);
      return fallback;
    }
    let counter = 2;
    while (usedIds.has(`${fallback}-${counter}`)) counter += 1;
    const id = `${fallback}-${counter}`;
    usedIds.add(id);
    return id;
  };

  const toMenuItem = (node: BuildNode): MenuItem | null => {
    const children = [...node.children.values()]
      .sort(compareNodes)
      .map(toMenuItem)
      .filter((child): child is MenuItem => child !== null);
    const isGroup = children.length > 0;
    if (!isGroup && !node.isRoute) return null;

    const label = node.label ?? inferLabel(node.path ?? node.prefix);
    const item: MenuItem = {
      id: isGroup
        ? claimId(
            `${node.prefix}${node.isRoute ? GROUP_SUFFIX : ""}`,
            node.prefix,
          )
        : claimId(node.path ?? node.prefix, node.prefix),
      label,
    };
    if (node.icon !== undefined) item.icon = node.icon;
    if (node.badge !== undefined) item.badge = node.badge;
    if (node.permission !== undefined) item.permission = node.permission;
    if (node.disabled !== undefined) item.disabled = node.disabled;
    if (isGroup) item.children = children;
    else item.href = node.path;
    return item;
  };

  return [...roots.values()]
    .sort(compareNodes)
    .map(toMenuItem)
    .filter((item): item is MenuItem => item !== null);
}

/**
 * The id of the leaf that the pathname points at: the href with the longest
 * prefix that matches wins. The root ("/") only matches exactly.
 */
export function matchActiveId(
  items: MenuItem[],
  pathname: string,
): string | null {
  const leaves: MenuItem[] = [];

  const visit = (nodes: MenuItem[]): void => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        visit(node.children);
        continue;
      }
      if (node.href) leaves.push(node);
    }
  };
  visit(items);

  let best: MenuItem | null = null;
  for (const leaf of leaves) {
    const href = leaf.href as string;
    if (!matchesPathname(pathname, href)) continue;
    if (!best || href.length > (best.href as string).length) best = leaf;
  }

  return best ? best.id : null;
}

/** Whether the pathname is the href itself or hangs from it. */
const matchesPathname = (pathname: string, href: string): boolean => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

/** The order of the children of a group. */
const compareNodes = (a: BuildNode, b: BuildNode): number => {
  if (a.isIndexLink !== b.isIndexLink) return a.isIndexLink ? -1 : 1;
  const orderA = a.order ?? Number.POSITIVE_INFINITY;
  const orderB = b.order ?? Number.POSITIVE_INFINITY;
  if (orderA !== orderB) return orderA < orderB ? -1 : 1;
  return a.seq - b.seq;
};

/** The paths of the routes and of the groups are compared without noise. */
const normalizePath = (path: string): string => {
  const trimmed = path.trim();
  if (!trimmed) return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (withSlash.length > 1 && withSlash.endsWith("/")) {
    return withSlash.slice(0, -1);
  }
  return withSlash;
};

/**
 * The label of a node without one: the last segment of its path. The
 * inference does not add accents: give the label explicitly when it has
 * them.
 */
const inferLabel = (value: string): string => {
  const segments = value.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return value;
  const words = last.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};
