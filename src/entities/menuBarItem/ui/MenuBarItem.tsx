import type { MenuBarItemType } from "../model/types.ts";

import styles from "./menuBarItem.module.css";

export type MenuBarItemProps = {
  menuBarItem: MenuBarItemType;
};

export function MenuBarItem(props: MenuBarItemProps) {
  const { title } = props.menuBarItem;

  // return (
  //   <>
  //     <select className={styles.menuBarItem}>
  //       <option className={styles.menuBarItemOption} value="" disabled selected hidden>
  //         {title}
  //       </option>
  //       {innerItems.map((item, i) => {
  //         return <option className={styles.menuBarItemOption} key={i}>{item}</option>;
  //       })}
  //     </select>
  //   </>
  // );
  return <span className={styles.menuBarItem}>{title}</span>;
}
