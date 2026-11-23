import { createElement, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { GroupMeta, RouteDef } from "../../components/SideMenu";
import { ICON_MAP } from "../../domain/constants/icons";
import { MENU_GROUPS, MENU_ROUTES } from "../../domain/constants/menuRoutes";

const ICON_SIZE = 20;
const ICON_STROKE = 1.8;

export interface MenuItems {
  routes: RouteDef[];
  groups: Record<string, GroupMeta>;
}

/**
 * Convierte la declaracion del menu en lo que el menu lateral consume: las
 * etiquetas ya traducidas y los iconos ya resueltos. El resultado es
 * estable: el arbol se reconstruye solo cuando las rutas cambian.
 */
export function useMenuItems(): MenuItems {
  const { t } = useTranslation();

  return useMemo(() => {
    const routes: RouteDef[] = MENU_ROUTES.map((screen) => {
      const route: RouteDef = {
        path: screen.path,
        label: t(screen.labelKey),
        order: screen.order,
      };

      const Icon = ICON_MAP[screen.iconKey];
      if (Icon) {
        route.icon = createElement(Icon, {
          size: ICON_SIZE,
          strokeWidth: ICON_STROKE,
        });
      }
      if (screen.permission) route.permission = screen.permission;
      if (screen.hidden) route.hidden = true;
      if (screen.parent) route.parent = screen.parent;

      return route;
    });

    const groups: Record<string, GroupMeta> = {};
    for (const group of MENU_GROUPS) {
      const meta: GroupMeta = {
        label: t(group.labelKey),
        order: group.order,
      };

      const Icon = ICON_MAP[group.iconKey];
      if (Icon) {
        meta.icon = createElement(Icon, {
          size: ICON_SIZE,
          strokeWidth: ICON_STROKE,
        });
      }
      if (group.permission) meta.permission = group.permission;

      groups[group.prefix] = meta;
    }

    return { routes, groups };
  }, [t]);
}
