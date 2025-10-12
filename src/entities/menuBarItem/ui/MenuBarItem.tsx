import type { MenuBarItemType } from "../model/types.ts";

import styles from "./menuBarItem.module.css";

export type MenuBarItemProps = {
  menuBarItem: MenuBarItemType;
};

export function MenuBarItem(props: MenuBarItemProps) {
  const { title } = props.menuBarItem;

  return <span className={styles.menuBarItem}>{title}</span>;
}
