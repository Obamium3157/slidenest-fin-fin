import * as React from "react";
import type { SlideObj } from "../../entities/slide/model/types.ts";
import type { Rect } from "../../shared/types/rect/Rect.ts";
import { getStyleFromFont } from "../../entities/slideText/lib/slideText.ts";

import styles from "./ui/slideObjView.module.css";

export type SlideObjStaticViewProps = {
  slideObj: SlideObj;
};

export function SlideObjStaticView(props: SlideObjStaticViewProps) {
  const { slideObj } = props;

  const visualRect: Rect = slideObj.rect;

  const baseStyle: React.CSSProperties = {
    left: `${visualRect.x}px`,
    top: `${visualRect.y}px`,
    width: `${visualRect.w}px`,
    height: `${visualRect.h}px`,
    border: "none",
    userSelect: "none",
  };

  return (
    <div className={styles.slideObj} style={baseStyle}>
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
          draggable={false}
        />
      ) : null}
    </div>
  );
}
