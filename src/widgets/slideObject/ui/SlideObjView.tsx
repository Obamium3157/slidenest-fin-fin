import type { Slide, SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import styles from "./slideObjView.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { AllResizePoints } from "../../allResizePoints/ui/AllResizePoints.tsx";
import { useSlideObjDragAndDrop } from "../../../entities/hooks/lib/useSlideObjDragAndDrop.tsx";
import { useSlideObjResize } from "../../../entities/hooks/lib/useSlideObjResize.tsx";
import type { Rect } from "../../../shared/types/rect/Rect.ts";

export type SlideObjViewProps = {
  slide: Slide;
  slideObj: SlideObj;
  isSelected?: boolean;
  onSelect?: (isMultipleSelection: boolean) => void;
  onDeselect?: () => void;
};

export function SlideObjView(props: SlideObjViewProps) {
  const { slide, slideObj, isSelected = false, onSelect } = props;
  const slideId = slide.id;
  const [isHovered, setHovered] = React.useState(false);

  const { handleClick, onPointerDown, localRects } = useSlideObjDragAndDrop({
    slide,
    slideId,
    slideObj,
    onSelect,
  });

  const local = localRects?.[slideObj.id] ?? null;

  const {
    handleResize,
    startResize,
    localRect: resizeLocal,
  } = useSlideObjResize({
    slideId,
    slideObj,
    localRect: local,
  });

  const visualRect: Rect = resizeLocal
    ? resizeLocal
    : local
      ? local
      : slideObj.rect;

  const x = visualRect.x;
  const y = visualRect.y;
  const w = visualRect.w;
  const h = visualRect.h;

  const handlePointerDownWrapper = (e: React.PointerEvent) => {
    e.preventDefault();
    onPointerDown(e);
  };

  const className = `${styles.slideObj} ${
    isSelected
      ? styles.slideObj__selected
      : isHovered
        ? styles.slideObj__hovered
        : ""
  }`;

  const baseStyle: React.CSSProperties = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
  };

  const onResizeStart = () => {
    startResize(visualRect);
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
        <AllResizePoints
          parentRect={visualRect}
          onResize={handleResize}
          onStart={onResizeStart}
        />
      )}

      {slideObj.type === "text" ? (
        <div
          className={styles.slideObjText}
          style={getStyleFromFont(slideObj.font)}
        >
          {slideObj.text}
        </div>
      ) : slideObj.type === "image" ? (
        <img
          src={slideObj.src}
          alt="изображение на слайде"
          className={styles.slideObjImage}
        />
      ) : null}
    </div>
  );
}
