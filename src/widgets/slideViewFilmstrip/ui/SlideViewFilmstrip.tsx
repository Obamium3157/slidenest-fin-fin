import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./slideViewFilmstrip.module.css";
import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import * as React from "react";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import { selectSlideRange } from "../../../entities/editor/lib/editor.ts";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";
import type { Editor } from "../../../entities/editor/model/types.ts";
import { useSlideViewFilmstripDragAndDrop } from "../../../entities/hooks/lib/useSlideViewFilmstripDragAndDrop.tsx";

export type SlideViewFilmstripProps = {
  editor: Editor;
  slide: Slide;
  scaleFactor: number;
  idx: number;
  preview?: boolean;
  isSelected?: boolean;
  onDragStart?: () => void;
  onDrag?: (state: { clientX: number; clientY: number }) => void;
  onDragEnd?: (moved?: boolean) => void;
  isDragging?: boolean;
};

export function SlideViewFilmstrip(props: SlideViewFilmstripProps) {
  const {
    editor,
    slide,
    scaleFactor,
    idx,
    isSelected = false,
    onDrag,
    onDragStart,
    onDragEnd,
    preview = false,
    isDragging = false,
  } = props;

  const { onPointerDown } = useSlideViewFilmstripDragAndDrop({
    onDrag,
    onDragStart,
    onDragEnd,
  });

  const onFilmstripSlideClick = (e: React.MouseEvent): void => {
    dispatch(selectSlideRange, [slide.id, e.shiftKey]);
  };

  const preventSelection = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };

  const outerWidth = SLIDE_WIDTH / scaleFactor;
  const outerHeight = SLIDE_HEIGHT / scaleFactor;

  const innerStyle: React.CSSProperties = {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    transform: `scale(${1 / scaleFactor})`,
    transformOrigin: "top left",
  };

  const innerClassName = preview
    ? `${styles.slideViewInner} ${styles.previewInner}`
    : styles.slideViewInner;

  return (
    <div className={styles.slideViewContainer}>
      <span className={styles.index}>{idx + 1}</span>

      <div
        className={`${styles.slideView} ${styles.noSelect}`}
        style={{
          background: slide.backgroundColor.color,
          width: outerWidth,
          height: outerHeight,
          opacity: isDragging ? 0.6 : 1,
          border: isSelected ? "2px solid #007bff" : "2px solid #423e3e4c",
          position: "relative",
        }}
        onClick={(e) => onFilmstripSlideClick(e)}
        onMouseDown={preventSelection}
        onDragStart={preventSelection}
        onPointerDown={onPointerDown}
      >
        <div style={innerStyle} className={innerClassName}>
          <AllSlideObjects editor={editor} slide={slide} />
        </div>
      </div>
    </div>
  );
}
