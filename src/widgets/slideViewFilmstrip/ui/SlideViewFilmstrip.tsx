import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./slideViewFilmstrip.module.css";
import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import * as React from "react";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import { selectSlide } from "../../../entities/editor/lib/editor.ts";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";
import { useDraggable } from "../../../entities/hooks/lib/useDraggable.tsx";

export type SlideViewFilmstripProps = {
  slide: Slide;
  scaleFactor: number;
  idx: number;
  preview?: boolean;
  onDragStart?: () => void;
  onDrag?: (state: { clientX: number; clientY: number }) => void;
  onDragEnd?: (moved?: boolean) => void;
  isDragging?: boolean;
};

export function SlideViewFilmstrip(props: SlideViewFilmstripProps) {
  const {
    slide,
    scaleFactor,
    idx,
    onDrag,
    onDragStart,
    onDragEnd,
    preview = false,
    isDragging = false,
  } = props;

  const onFilmstripSlideClick = (): void => {
    dispatch(selectSlide, [slide.id]);
  };

  const outerWidth = SLIDE_WIDTH / scaleFactor;
  const outerHeight = SLIDE_HEIGHT / scaleFactor;

  const innerStyle: React.CSSProperties = {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    transform: `scale(${1 / scaleFactor})`,
    transformOrigin: "top left",
  };

  const preventSelection = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
  };

  const { onPointerDown } = useDraggable({
    onStart: () => {
      onDragStart?.();
    },
    onDrag: (state) => {
      onDrag?.({ clientX: state.clientX, clientY: state.clientY });
    },
    onEnd: (moved?: boolean) => {
      onDragEnd?.(moved);
    },
    preventDefault: true,
    stopPropagation: true,
    movementThreshold: 5,
  });

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
        }}
        onClick={onFilmstripSlideClick}
        onMouseDown={preventSelection}
        onDragStart={preventSelection}
        onPointerDown={onPointerDown}
      >
        <div style={innerStyle} className={innerClassName}>
          <AllSlideObjects slide={slide} stopPropagation={true} />
        </div>
      </div>
    </div>
  );
}
