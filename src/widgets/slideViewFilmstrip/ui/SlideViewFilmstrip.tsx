import type { Slide } from "../../../entities/slide/model/types.ts";

import styles from "./slideViewFilmstrip.module.css";
import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";
import * as React from "react";
import { dispatch } from "../../../entities/editor/lib/modifyEditor.ts";
import { selectSlide } from "../../../entities/editor/lib/editor.ts";

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

  const outerWidth = 1250 / scaleFactor;
  const outerHeight = 700 / scaleFactor;

  const innerStyle: React.CSSProperties = {
    width: 1250,
    height: 700,
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
