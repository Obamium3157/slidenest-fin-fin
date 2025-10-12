import type { Slide } from "../model/types.ts";

import styles from "./slideView.module.css";
import { AllSlideObjects } from "../../../widgets/allSlideObjects/ui/AllSlideObjects.tsx";
import * as React from "react";

export type SlideViewProps = {
  slide: Slide;
  scaleFactor: number;
  idx: number;
};

export function SlideView(props: SlideViewProps) {
  const { slide, scaleFactor, idx } = props;

  const outerWidth = 1250 / scaleFactor;
  const outerHeight = 700 / scaleFactor;

  const innerStyle: React.CSSProperties = {
    width: 1250,
    height: 700,
    transform: `scale(${1 / scaleFactor})`,
    transformOrigin: "top left",
  };

  return (
    <div className={styles.slideViewContainer}>
      <span className={styles.index}>{idx + 1}</span>

      <div
        className={styles.slideView}
        style={{
          background: slide.backgroundColor.color,
          width: outerWidth,
          height: outerHeight,
        }}
      >
        <div style={innerStyle} className={styles.slideViewInner}>
          <AllSlideObjects slide={slide} />
        </div>
      </div>
    </div>
  );
}
