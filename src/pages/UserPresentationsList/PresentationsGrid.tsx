import type { CSSProperties, ReactNode } from "react";
import styles from "./PresentationsGrid.module.css";

type PresentationsGridProps = {
  tileW: number;
  tileH: number;
  children: ReactNode;
};

export function PresentationsGrid({
  tileW,
  tileH,
  children,
}: PresentationsGridProps) {
  const gridStyle = {
    ["--tile-w" as string]: `${tileW}px`,
    ["--tile-h" as string]: `${tileH}px`,
  } as CSSProperties;

  return (
    <div className={styles.gridScroller}>
      <div className={styles.grid} style={gridStyle}>
        {children}
      </div>
    </div>
  );
}
