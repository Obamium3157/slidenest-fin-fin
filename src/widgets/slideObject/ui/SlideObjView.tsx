import type { Slide, SlideObj } from "../../../entities/slide/model/types.ts";
import * as React from "react";
import { useRef, useState } from "react";
import styles from "./slideObjView.module.css";
import richStyles from "../features/richText/SlideTextEditor/SlideRichText.module.css";
import { getStyleFromFont } from "../../../entities/slideText/lib/slideText.ts";
import { AllResizePoints } from "../../allResizePoints/ui/AllResizePoints.tsx";
import { useSlideObjDragAndDrop } from "../../../entities/hooks/lib/useSlideObjDragAndDrop.tsx";
import { useSlideObjResize } from "../../../entities/hooks/lib/useSlideObjResize.tsx";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { SlideTextEditor } from "../features/richText/SlideTextEditor/SlideTextEditor.tsx";

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
  const [editing, setEditing] = useState(false);
  const lastPointerDownAtRef = useRef<number>(0);

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

  const isText = slideObj.type === "text";

  const handlePointerDownWrapper = (e: React.PointerEvent) => {
    if (isText && !editing) {
      const now = performance.now();
      const dt = now - lastPointerDownAtRef.current;
      lastPointerDownAtRef.current = now;

      if (e.button === 0 && dt > 0 && dt < 350) {
        e.preventDefault();
        e.stopPropagation();
        setEditing(true);
        return;
      }
    }

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
      onPointerDown={editing ? undefined : handlePointerDownWrapper}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={editing ? undefined : handleClick}
      onDoubleClick={isText && !editing ? () => setEditing(true) : undefined}
    >
      {isSelected && !editing && (
        <AllResizePoints
          parentRect={visualRect}
          onResize={handleResize}
          onStart={onResizeStart}
        />
      )}

      {slideObj.type === "text" ? (
        editing ? (
          <SlideTextEditor
            slideId={slideId}
            objId={slideObj.id}
            contentHtml={slideObj.contentHtml}
            dir={slideObj.dir}
            font={slideObj.font}
            onExit={() => setEditing(false)}
          />
        ) : (
          <div
            dir={slideObj.dir ?? "auto"}
            className={`${styles.slideObjText} ${richStyles.content}`}
            style={getStyleFromFont(slideObj.font)}
            dangerouslySetInnerHTML={{ __html: slideObj.contentHtml }}
          />
        )
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
