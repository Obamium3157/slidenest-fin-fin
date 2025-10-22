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

export type SlideViewFilmstripProps = {
  slide: Slide;
  scaleFactor: number;
  idx: number;
};

export function SlideViewFilmstrip(props: SlideViewFilmstripProps) {
  const { slide, scaleFactor, idx } = props;

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

  return (
    <div className={styles.slideViewContainer}>
      <span className={styles.index}>{idx + 1}</span>

      <div
        className={`${styles.slideView} ${styles.noSelect}`}
        style={{
          background: slide.backgroundColor.color,
          width: outerWidth,
          height: outerHeight,
        }}
        onClick={onFilmstripSlideClick}
        onMouseDown={preventSelection}
        onDragStart={preventSelection}
      >
        <div style={innerStyle} className={styles.slideViewInner}>
          <AllSlideObjects slide={slide} stopPropagation={false} />
        </div>
      </div>
    </div>
  );
}
