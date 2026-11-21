import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ancestorIds, filterByPermission } from "./utils";
import type { LeafProps, MenuItem, SideMenuProps } from "./types";
import "./side-menu.css";

interface MenuContext {
  activeId: string | null;
  openIds: Set<string>;
  toggle: (id: string) => void;
  renderLeaf?: (props: LeafProps) => ReactNode;
}

/** Lo que el usuario hizo a mano con un grupo: abrirlo o cerrarlo. */
interface Decision {
  abierto: boolean;
  /** La ruta en la que se decidio: el cierre dura hasta que se navega. */
  ruta: string;
}

/**
 * The side menu: the tree comes from useMenuTree and the permissions from
 * the app. The module knows no router, no translation and no domain.
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

  // The open state of the groups lives here. The user opens and closes the
  // groups by hand and the menu remembers it: a group closed by hand stays
  // closed on that route. The route that arrives opens the groups that hold
  // it, so the active screen is always visible.
  const [decisiones, setDecisiones] = useState<Record<string, Decision>>(
    () => {
      const inicial: Record<string, Decision> = {};
      for (const id of defaultOpenIds ?? []) {
        inicial[id] = { abierto: true, ruta: "" };
      }
      return inicial;
    },
  );

  const ruta = activeId ?? "";

  const abiertosPorDecision = useMemo(() => {
    const abiertos = new Set<string>();
    for (const [id, decision] of Object.entries(decisiones)) {
      if (decision.abierto) abiertos.add(id);
    }
    return abiertos;
  }, [decisiones]);

  const cerradosEnEstaRuta = useMemo(() => {
    const cerrados = new Set<string>();
    for (const [id, decision] of Object.entries(decisiones)) {
      if (!decision.abierto && decision.ruta === ruta) cerrados.add(id);
    }
    return cerrados;
  }, [decisiones, ruta]);

  const activeAncestors = useMemo(
    () => (activeId ? ancestorIds(visible, activeId) : []),
    [visible, activeId],
  );

  const openIds = useMemo(() => {
    const next = new Set(abiertosPorDecision);
    for (const id of activeAncestors) {
      if (!cerradosEnEstaRuta.has(id)) next.add(id);
    }
    return next;
  }, [abiertosPorDecision, activeAncestors, cerradosEnEstaRuta]);

  const toggle = useCallback(
    (id: string) => {
      const estabaAbierto = openIds.has(id);
      setDecisiones((previous) => ({
        ...previous,
        [id]: { abierto: !estabaAbierto, ruta },
      }));
    },
    [openIds, ruta],
  );

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
        focus, not even before the stylesheet arrives. The panel holds a
        single child: the wrapper the collapsed row clips.
      */}
      <div
        id={panelId}
        className={open ? "sm-panel" : "sm-panel sm-panel--closed"}
        style={open ? undefined : { visibility: "hidden" }}
      >
        <div className="sm-panelInner">
          <ul
            className="sm-sublist"
            style={{ paddingInlineStart: indentOf(level + 1) }}
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
        </div>
      </div>
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

const panelIdOf = (id: string): string => `sm-panel-${encodeURIComponent(id)}`;

const indentOf = (level: number): string =>
  `calc(var(--sm-indent) * ${level})`;
