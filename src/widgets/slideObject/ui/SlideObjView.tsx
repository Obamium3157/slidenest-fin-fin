import type { Slide, SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import styles from "./slideObjView.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { AllResizePoints } from "../../allResizePoints/ui/AllResizePoints.tsx";
import { useSlideObjDragAndDrop } from "../../../entities/hooks/lib/useSlideObjDragAndDrop.tsx";
import { useSlideObjResize } from "../../../entities/hooks/lib/useSlideObjResize.tsx";

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
  const { w, h } = slideObj.rect;

  const { handleClick, onPointerDown, localPositions } = useSlideObjDragAndDrop(
    {
      slide,
      slideId,
      slideObj,
      onSelect,
    },
  );

  const local = localPositions?.[slideObj.id];

  const x = local ? local.x : slideObj.rect.x;
  const y = local ? local.y : slideObj.rect.y;

  const { handleResize } = useSlideObjResize({ slideId, slideObj });

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
