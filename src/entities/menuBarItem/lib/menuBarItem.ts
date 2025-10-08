import type { MenuBarItemType } from "../model/types.ts";

export function newMenuBarItem(
  title: string,
  innerItems: Array<string>,
): MenuBarItemType {
  return {
    title,
    innerItems,
  };
}
