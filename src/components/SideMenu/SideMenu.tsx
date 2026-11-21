import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ancestorIds, filterByPermission } from "./utils";
import type { LeafProps, MenuItem, SideMenuProps } from "./types";
import "./side-menu.css";

interface MenuContext {
  /** The id of the active leaf, when there is one. */
  activeId: string | null;
  /** The ids of the groups that are open. */
  openIds: Set<string>;
  /** Opens or closes a group. */
  toggle: (id: string) => void;
  /** Draws a leaf: the app passes its own router link here. */
  renderLeaf?: (props: LeafProps) => ReactNode;
}

/**
 * The side menu.
 *
 * The tree comes from useMenuTree, the pathname and the permissions come
 * from the app: this component knows no router and no translation.
 */
export function SideMenu({
  items,
  activeId,
  permissions,
  renderLeaf,
  ariaLabel = "Main menu",
  defaultOpenIds,
  className,
}: SideMenuProps) {
  // The permissions are filtered here and nowhere else: the leaves without
  // them disappear and the groups left empty are pruned.
  const visible = useMemo(
    () => filterByPermission(items, permissions),
    [items, permissions],
  );

  const [opened, setOpened] = useState<Set<string>>(
    () => new Set(defaultOpenIds ?? []),
  );

  // With an active id the menu follows it and keeps open the groups that
  // hold the active leaf. Without it the menu keeps its own state.
  const controlled = activeId !== undefined;
  const activeAncestors = useMemo(
    () => (activeId ? ancestorIds(visible, activeId) : []),
    [visible, activeId],
  );

  const openIds = useMemo(() => {
    const next = new Set(opened);
    if (controlled) for (const id of activeAncestors) next.add(id);
    return next;
  }, [opened, activeAncestors, controlled]);

  const toggle = useCallback((id: string) => {
    setOpened((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const context: MenuContext = {
    activeId: activeId ?? null,
    openIds,
    toggle,
    renderLeaf,
  };

  return (
    <nav className={className ? `sm ${className}` : "sm"} aria-label={ariaLabel}>
      <ul className="sm-list" style={{ paddingInlineStart: indentOf(0) }}>
        {visible.map((item) => (
          <MenuNode key={item.id} item={item} level={0} context={context} />
        ))}
      </ul>
    </nav>
  );
}

interface MenuNodeProps {
  item: MenuItem;
  level: number;
  context: MenuContext;
}

function MenuNode({ item, level, context }: MenuNodeProps) {
  const children = item.children ?? [];

  if (children.length === 0) {
    return (
      <li className="sm-item sm-item--leaf">
        <Leaf item={item} context={context} />
      </li>
    );
  }

  const open = context.openIds.has(item.id);
  const panelId = panelIdOf(item.id);

  return (
    <li className="sm-item sm-item--group">
      <button
        type="button"
        className="sm-group"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={item.disabled}
        onClick={() => context.toggle(item.id)}
      >
        <NodeContent item={item} />
      </button>
      {/*
        The closed panel is hidden inline: its children never take the
        focus, not even before the stylesheet arrives.
      */}
      <ul
        id={panelId}
        className={open ? "sm-panel" : "sm-panel sm-panel--closed"}
        style={{
          paddingInlineStart: indentOf(level + 1),
          ...(open ? {} : { visibility: "hidden" }),
        }}
      >
        {children.map((child) => (
          <MenuNode
            key={child.id}
            item={child}
            level={level + 1}
            context={context}
          />
        ))}
      </ul>
    </li>
  );
}

interface LeafPropsWithContext {
  item: MenuItem;
  context: MenuContext;
}

function Leaf({ item, context }: LeafPropsWithContext) {
  const active = context.activeId === item.id;
  const disabled = Boolean(item.disabled);
  const onSelect = useCallback(() => {}, []);

  if (context.renderLeaf) {
    return <>{context.renderLeaf({ item, active, disabled, onSelect })}</>;
  }

  return (
    <DefaultLeaf
      item={item}
      active={active}
      disabled={disabled}
      onSelect={onSelect}
    />
  );
}

function DefaultLeaf({ item, active, disabled, onSelect }: LeafProps) {
  const leafClass = [
    "sm-leaf",
    active ? "sm-leaf--active" : "",
    disabled ? "sm-leaf--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (disabled) {
    return (
      <span className={leafClass} aria-disabled="true">
        <NodeContent item={item} />
      </span>
    );
  }

  return (
    <a
      className={leafClass}
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
    >
      <NodeContent item={item} />
    </a>
  );
}

function NodeContent({ item }: { item: MenuItem }) {
  return (
    <>
      {item.icon !== undefined ? (
        <span className="sm-icon" aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span className="sm-label">{item.label}</span>
      {item.badge !== undefined ? (
        <span className="sm-badge">{item.badge}</span>
      ) : null}
    </>
  );
}

/** The id of the panel of a group: it is the target of aria-controls. */
const panelIdOf = (id: string): string => `sm-panel-${encodeURIComponent(id)}`;

/** Every level is indented the same measure, taken from the theme. */
const indentOf = (level: number): string =>
  `calc(var(--sm-indent) * ${level})`;
