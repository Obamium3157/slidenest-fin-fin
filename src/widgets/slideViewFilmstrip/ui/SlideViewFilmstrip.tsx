import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./slideViewFilmstrip.module.css";
import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import * as React from "react";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";
import { useSlideViewFilmstripDragAndDrop } from "../../../entities/hooks/lib/useSlideViewFilmstripDragAndDrop.tsx";
import { useAppActions } from "../../../entities/store/actions.ts";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import { getOrderedMapOrder } from "../../../shared/types/orderedMap/OrderedMap.ts";

export type SlideViewFilmstripProps = {
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

  const { selectSlideRange } = useAppActions();
  const presentation = useAppSelector((state) => state.presentation);
  const select = useAppSelector((state) => state.selection);

  const onFilmstripSlideClick = (e: React.MouseEvent): void => {
    const allSlideIds = getOrderedMapOrder(presentation.slides);
    selectSlideRange({
      slideId: slide.id,
      shift: e.shiftKey,
      allSlideIds,
      currentSelectedSlideIds: select.selectedSlideIds,
    });
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
          <AllSlideObjects slide={slide} />
        </div>
      </div>
    </div>
  );
}
