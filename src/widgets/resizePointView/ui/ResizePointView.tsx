import {
  RESIZE_POINT_SIZE,
  type ResizePointType,
} from "../../../entities/resizePointType/model/types.ts";

import styles from "./ResizePointView.module.css";
import * as React from "react";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { useResizePointDrag } from "../../../entities/hooks/lib/useResizePointDrag.tsx";

type ResizePointViewProps = {
  type: ResizePointType;
  parentRect: Rect;
  onResize: (rect: Rect) => void;
  onStart?: () => void;
};

export function ResizePointView(props: ResizePointViewProps) {
  const { type, parentRect, onResize, onStart } = props;

  const { onPointerDown } = useResizePointDrag({ type, parentRect, onResize });

  const style: React.CSSProperties = {
    width: RESIZE_POINT_SIZE,
    height: RESIZE_POINT_SIZE,
  };

  const positionMap: Record<ResizePointType, { top: string; left: string }> = {
    TOP_LEFT: { top: "0%", left: "0%" },
    TOP: { top: "0%", left: "50%" },
    TOP_RIGHT: { top: "0%", left: "100%" },
    RIGHT: { top: "50%", left: "100%" },
    BOTTOM_RIGHT: { top: "100%", left: "100%" },
    BOTTOM: { top: "100%", left: "50%" },
    BOTTOM_LEFT: { top: "100%", left: "0%" },
    LEFT: { top: "50%", left: "0%" },
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onStart?.();
    onPointerDown(e);
  };

  return positionMap[type as ResizePointType] ? (
    <div
      className={styles.resizePoint}
      style={{ ...style, ...positionMap[type as ResizePointType] }}
      onPointerDown={handlePointerDown}
    />
  ) : null;
}
