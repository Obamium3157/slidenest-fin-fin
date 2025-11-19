import type { Slide, SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import styles from "./slideObjView.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { AllResizePoints } from "../../allResizePoints/ui/AllResizePoints.tsx";
import type { Editor } from "../../../entities/editor/model/types.ts";
import { useSlideObjDragAndDrop } from "../../../entities/hooks/lib/useSlideObjDragAndDrop.tsx";
import { useSlideObjResize } from "../../../entities/hooks/lib/useSlideObjResize.tsx";

export type SlideObjViewProps = {
  editor: Editor;
  slide: Slide;
  slideObj: SlideObj;
  isSelected?: boolean;
  onSelect?: (isMultipleSelection: boolean) => void;
  onDeselect?: () => void;
};

export function SlideObjView(props: SlideObjViewProps) {
  const { editor, slide, slideObj, isSelected = false, onSelect } = props;
  const slideId = slide.id;
  const [isHovered, setHovered] = React.useState(false);
  const { x, y, w, h } = slideObj.rect;

  const { handleClick, onPointerDown } = useSlideObjDragAndDrop({
    editor,
    slide,
    slideId,
    slideObj,
    onSelect,
  });

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
