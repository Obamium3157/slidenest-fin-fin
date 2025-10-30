import type { SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import styles from "./slideObjView.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { useDraggable } from "../../../entities/useDraggable/lib/useDraggable.tsx";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import {
  changeSlideObjectPosition,
  changeSlideObjSize,
} from "../../../entities/editor/lib/editor.ts";
import { useRef } from "react";
import { AllResizePoints } from "../../allResizePoints/ui/AllResizePoints.tsx";
import type { Rect } from "../../../shared/types/rect/Rect.ts";

export type SlideObjViewProps = {
  slideId: string;
  slideObj: SlideObj;
  isSelected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  stopPropagation?: boolean;
};

export function SlideObjView(props: SlideObjViewProps) {
  const {
    slideId,
    slideObj,
    isSelected = false,
    onSelect,
    onDeselect,
    stopPropagation = false,
  } = props;

  const [isHovered, setHovered] = React.useState(false);
  const startRectRef = useRef<Rect | null>(null);
  const didDragRef = useRef(false);

  const className = `${styles.slideObj} ${
    isSelected
      ? styles.slideObj__selected
      : isHovered
        ? styles.slideObj__hovered
        : ""
  }`;

  const { x, y, w, h } = slideObj.rect;

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();

    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    onSelect?.();
  };

  const { onPointerDown, isDraggingRef } = useDraggable({
    preventDefault: true,
    stopPropagation: stopPropagation,
    onStart: () => {
      startRectRef.current = slideObj.rect;
    },
    onDrag: ({ dx, dy }) => {
      const start = startRectRef.current;
      if (!start) return;

      didDragRef.current = true;
      isDraggingRef.current = true;

      const newX = Math.round(start.x + dx);
      const newY = Math.round(start.y + dy);

      dispatch(changeSlideObjectPosition, [slideId, slideObj.id, newX, newY]);
    },
    onEnd: () => {
      if (didDragRef.current) {
        onDeselect?.();
      }

      setTimeout(() => {
        didDragRef.current = false;
        isDraggingRef.current = false;
      }, 0);

      startRectRef.current = null;
    },
  });

  const handlePointerDownWrapper = (e: React.PointerEvent) => {
    if (stopPropagation) e.stopPropagation();

    onSelect?.();

    onPointerDown(e);
  };

  const baseStyle: React.CSSProperties = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    position: "absolute",
    transformOrigin: "top left",
    boxSizing: "border-box",
  };

  const handleResize = (newRect: Rect) => {
    dispatch(changeSlideObjSize, [slideId, slideObj.id, newRect.w, newRect.h]);
    dispatch(changeSlideObjectPosition, [
      slideId,
      slideObj.id,
      newRect.x,
      newRect.y,
    ]);
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onPointerDown={handlePointerDownWrapper}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {isSelected && (
        <AllResizePoints parentRect={slideObj.rect} onResize={handleResize} />
      )}
      {slideObj.type === "text" ? (
        <div
          className={styles.slideObj__text}
          style={getStyleFromFont(slideObj.font)}
        >
          {slideObj.text}
        </div>
      ) : slideObj.type === "image" ? (
        <img
          src={slideObj.src}
          alt="изображение на слайде"
          className={styles.slideObj__image}
        />
      ) : null}
    </div>
  );
}
