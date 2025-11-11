import {
  RESIZE_POINT_SIZE,
  type ResizePointType,
} from "../../../entities/resizePointType/model/types.ts";

import styles from "./ResizePointView.module.css";
import * as React from "react";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { useDraggable } from "../../../entities/hooks/lib/useDraggable.tsx";
import { useRef } from "react";
import { resizeRect } from "../../../shared/types/rect/lib/functions.ts";

type ResizePointViewProps = {
  type: ResizePointType;
  parentRect: Rect;
  onResize: (rect: Rect) => void;
};

export function ResizePointView(props: ResizePointViewProps) {
  const { type, parentRect, onResize } = props;

  const startRef = useRef<{ rect: Rect } | null>(null);

  const { onPointerDown } = useDraggable({
    onStart: () => {
      startRef.current = { rect: { ...parentRect } };
    },
    onDrag: ({ dx, dy }) => {
      if (!startRef.current) return;

      const startRect = startRef.current.rect;
      const newRect = resizeRect(startRect, type, dx, dy);

      onResize(newRect);
    },
    onEnd: () => {
      startRef.current = null;
    },
    preventDefault: true,
    stopPropagation: true,
  });

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

  return positionMap[type as ResizePointType] ? (
    <div
      className={styles.resizePoint}
      style={{ ...style, ...positionMap[type as ResizePointType] }}
      onPointerDown={onPointerDown}
    />
  ) : null;
}
