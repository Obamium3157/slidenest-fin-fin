import { MenuBarItem } from "../../../entities/menuBarItem/ui/MenuBarItem.tsx";
import type { MenuBarItemType } from "../../../entities/menuBarItem/model/types.ts";

import styles from "./menuBar.module.css";

export type MenuBarProps = {
  items: Array<MenuBarItemType>;
};

export function MenuBar(props: MenuBarProps) {
  const { items } = props;
  return (
    <div className={styles.menuBar}>
      {items.map((item, idx) => {
        return <MenuBarItem key={idx} menuBarItem={item} />;
      })}
    </div>
  );
}
