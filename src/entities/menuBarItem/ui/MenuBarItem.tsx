import type { MenuBarItemType } from "../model/types.ts";

import styles from "./menuBarItem.module.css";
import defaultFont from "../../../shared/ui/defaultFont/defaultFont.module.css";

export type MenuBarItemProps = {
  menuBarItem: MenuBarItemType;
};

export function MenuBarItem(props: MenuBarItemProps) {
  const { menuBarItem } = props;

  return (
    <span className={`${styles.menuBarItem} ${defaultFont.defaultFont}`}>
      {menuBarItem.title}
    </span>
  );
}
