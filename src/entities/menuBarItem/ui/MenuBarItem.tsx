import type { MenuBarItemType } from "../model/types.ts";

import styles from "./menuBarItem.module.css";
// import * as React from "react";

export type MenuBarItemProps = {
  menuBarItem: MenuBarItemType;
};

export function MenuBarItem(props: MenuBarItemProps) {
  const { menuBarItem } = props;

  // const withRemovedPadding: React.CSSProperties = {
  //   transform: "translateX(-7px)",
  // };
  return <span className={styles.menuBarItem}>{menuBarItem.title}</span>;
}
