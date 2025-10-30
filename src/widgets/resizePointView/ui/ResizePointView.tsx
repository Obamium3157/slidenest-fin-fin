import {
  RESIZE_POINT_SIZE,
  type ResizePointType,
} from "../../../entities/resizePointType/model/types.ts";

import styles from "./ResizePointView.module.css";
import * as React from "react";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { useDraggable } from "../../../entities/useDraggable/lib/useDraggable.tsx";
import { useRef } from "react";

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
      let newX = startRect.x;
      let newY = startRect.y;
      let newW = startRect.w;
      let newH = startRect.h;

      switch (type) {
        case "TOP_LEFT": {
          newX = startRect.x + dx;
          newY = startRect.y + dy;
          newW = startRect.w - dx;
          newH = startRect.h - dy;
          break;
        }
        case "TOP_RIGHT": {
          newY = startRect.y + dy;
          newW = startRect.w + dx;
          newH = startRect.h - dy;
          break;
        }
        case "BOTTOM_RIGHT": {
          newW = startRect.w + dx;
          newH = startRect.h + dy;
          break;
        }
        case "BOTTOM_LEFT": {
          newX = startRect.x + dx;
          newW = startRect.w - dx;
          newH = startRect.h + dy;
          break;
        }
        case "TOP": {
          newY = startRect.y + dy;
          newH = startRect.h - dy;
          break;
        }
        case "BOTTOM": {
          newH = startRect.h + dy;
          break;
        }
        case "LEFT": {
          newX = startRect.x + dx;
          newW = startRect.w - dx;
          break;
        }
        case "RIGHT": {
          newW = startRect.w + dx;
          break;
        }
      }

      onResize({ x: newX, y: newY, w: newW, h: newH });
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
  switch (type) {
    case "TOP_LEFT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "0%", left: "0%" }}
          onPointerDown={onPointerDown}
        />
      );
    case "TOP":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "0%", left: "50%" }}
          onPointerDown={onPointerDown}
        />
      );
    case "TOP_RIGHT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "0%", left: "100%" }}
          onPointerDown={onPointerDown}
        />
      );
    case "RIGHT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "50%", left: "100%" }}
          onPointerDown={onPointerDown}
        />
      );
    case "BOTTOM_RIGHT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "100%", left: "100%" }}
          onPointerDown={onPointerDown}
        />
      );
    case "BOTTOM":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "100%", left: "50%" }}
          onPointerDown={onPointerDown}
        />
      );
    case "BOTTOM_LEFT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "100%", left: "0%" }}
          onPointerDown={onPointerDown}
        />
      );
    case "LEFT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "50%", left: "0%" }}
          onPointerDown={onPointerDown}
        />
      );
    default:
      return null;
  }
}
