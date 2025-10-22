import type { SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import styles from "./slideObjView.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { useDraggable } from "../../../entities/useDraggable/lib/useDraggable.tsx";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import { changeSlideObjectPosition } from "../../../entities/editor/lib/editor.ts";

export type SlideObjViewProps = {
  slideId: string;
  slideObj: SlideObj;
  isSelected?: boolean;
  onSelect?: () => void;
  stopPropagation?: boolean;
};

export function SlideObjView(props: SlideObjViewProps) {
  const {
    slideId,
    slideObj,
    isSelected = false,
    onSelect,
    stopPropagation,
  } = props;

  const [isHovered, setHovered] = React.useState(false);

  const className = `${styles.slideObj} ${
    isSelected
      ? styles.slideObj__selected
      : isHovered
        ? styles.slideObj__hovered
        : ""
  }`;

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    onSelect?.();
  };

  const { x, y, w, h } = slideObj.rect;

  const { onMouseDown } = useDraggable({
    initialX: x,
    initialY: y,
    onDrag: (p) => {
      dispatch(changeSlideObjectPosition, [slideId, slideObj.id, p.x, p.y]);
    },
  });

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
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {slideObj.type === "text" ? (
        // <div
        //   className={styles.slideObj__text}
        //   style={getStyleFromFont(slideObj.font)}
        // >
        //   {slideObj.text}
        // </div>
        <input
          className={styles.slideObj__text}
          style={getStyleFromFont(slideObj.font)}
          value={slideObj.text}
          onChange={(e) => console.log(e.target.value)}
        />
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
