/** Nothing outside this module imports an internal file: everything goes through here. */
export { SideMenu } from "./SideMenu";
export { useMenuTree } from "./useMenuTree";
export type { MenuTree, UseMenuTreeOptions } from "./useMenuTree";
export { buildMenuTree, matchActiveId } from "./buildMenuTree";
export type {
  GroupMeta,
  LeafProps,
  MenuItem,
  RouteDef,
  SideMenuProps,
} from "./types";
