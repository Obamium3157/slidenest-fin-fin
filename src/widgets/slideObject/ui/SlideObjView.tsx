import type { SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import styles from "./slideObjView.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { useDraggable } from "../../../entities/useDraggable/lib/useDraggable.tsx";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import { changeSlideObjectPosition } from "../../../entities/editor/lib/editor.ts";
import { useRef } from "react";
import { AllResizePoints } from "../../allResizePoints/ui/AllResizePoints.tsx";

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
    stopPropagation,
  } = props;

  const [isHovered, setHovered] = React.useState(false);
  const isDraggingRef = useRef(false);
  const pointerDownRef = useRef(false);

  const className = `${styles.slideObj} ${
    isSelected
      ? styles.slideObj__selected
      : isHovered
        ? styles.slideObj__hovered
        : ""
  }`;

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();

    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }

    onSelect?.();
  };

  const { x, y, w, h } = slideObj.rect;

  const { onMouseDown } = useDraggable({
    initialX: x,
    initialY: y,
    onDrag: (p) => {
      if (!pointerDownRef.current) return;

      isDraggingRef.current = true;
      dispatch(changeSlideObjectPosition, [slideId, slideObj.id, p.x, p.y]);
    },
  });

  const handleMouseDownWrapper = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();

    pointerDownRef.current = true;

    onSelect?.();

    onMouseDown(e);

    const onEnd = () => {
      if (isDraggingRef.current) {
        onDeselect?.();
      }
      pointerDownRef.current = false;

      setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);
    };

    window.addEventListener("pointerup", onEnd, { once: true });
    window.addEventListener("mouseup", onEnd, { once: true });
    window.addEventListener("touchend", onEnd, { once: true });
    window.addEventListener("pointercancel", onEnd, { once: true });
  };

  const baseStyle: React.CSSProperties = {
    left: `${slideObj.rect.x}px`,
    top: `${slideObj.rect.y}px`,
    width: `${w}px`,
    height: `${h}px`,
    position: "absolute",
    transformOrigin: "top left",
  };
  return (
    <div
      className={className}
      style={baseStyle}
      onMouseDown={handleMouseDownWrapper}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {isSelected && <AllResizePoints />}

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
