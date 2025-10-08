import type { Slide } from "../model/types.ts";

import styles from "./slideView.module.css";

export type SlideViewProps = {
  slide: Slide;
  idx: number;
};

export function SlideView(props: SlideViewProps) {
  const { slide, idx } = props;
  return (
    <div className={styles.slideViewContainer}>
      <span className={styles.index}>{idx + 1}</span>
      <div className={styles.slideView}>
        <h5>Slide id: {slide.id}</h5>
        <h5>Slide background color: {slide.backgroundColor.color}</h5>
      </div>
    </div>
  );
}
