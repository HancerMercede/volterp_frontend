import type { MenuItem } from "./types";

/** The chain of nodes from the root to the node; empty when the tree does not hold it. */
export function findPath(items: MenuItem[], id: string): MenuItem[] {
  for (const item of items) {
    if (item.id === id) return [item];
    if (!item.children || item.children.length === 0) continue;
    const found = findPath(item.children, id);
    if (found.length > 0) return [item, ...found];
  }
  return [];
}

/** The ids of the ancestors of a node (the node itself is not one of them). */
export function ancestorIds(items: MenuItem[], id: string): string[] {
  return findPath(items, id)
    .slice(0, -1)
    .map((item) => item.id);
}

export function containsId(items: MenuItem[], id: string): boolean {
  return findPath(items, id).length > 0;
}

/**
 * Prunes the nodes the caller may not see: a node with a permission stays
 * only when the caller holds it, and it takes its whole subtree with it.
 */
export function filterByPermission(
  items: MenuItem[],
  permissions?: string[],
): MenuItem[] {
  if (!permissions) return items;
  const granted = new Set(permissions);

  const prune = (nodes: MenuItem[]): MenuItem[] => {
    const kept: MenuItem[] = [];
    for (const node of nodes) {
      if (node.permission && !granted.has(node.permission)) continue;
      if (!node.children || node.children.length === 0) {
        kept.push(node);
        continue;
      }
      const children = prune(node.children);
      if (children.length === 0) continue;
      kept.push({ ...node, children });
    }
    return kept;
  };

  return prune(items);
}
