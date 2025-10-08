import type { SlideObj } from "../model/types.ts";

import styles from "./slideObjView.module.css";
import * as React from "react";

export type SlideObjViewProps = {
  slideObj: SlideObj;
};

export function SlideObjView(props: SlideObjViewProps) {
  const { slideObj } = props;

  const rect = slideObj.rect ?? { x: 0, y: 0, w: 100, h: 100 };

  const baseStyle: React.CSSProperties = {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.w}px`,
    height: `${rect.h}px`,
    position: "absolute",
    transformOrigin: "top left",
  };

  switch (slideObj.type) {
    case "text": {
      const font = slideObj.font;

      const fontStyle = font?.fontStyle
        ? Array.from(font.fontStyle).join(" ")
        : "normal";

      const textDecoration = font?.textDecoration
        ? Array.from(font.textDecoration).join(" ")
        : "none";

      let fontStyleValue: React.CSSProperties["fontStyle"] = undefined;
      if (fontStyle && fontStyle.length > 0) {
        fontStyleValue = fontStyle.includes("italic") ? "italic" : "normal";
      }

      const style: React.CSSProperties = {
        fontFamily: font?.fontFamily ?? "SST",
        fontSize: font?.fontSize ? font.fontSize : "30px",
        fontWeight: font?.fontWeight,
        fontStyle: fontStyleValue,
        letterSpacing: font?.letterSpacing,
        wordSpacing: font?.wordSpacing,
        color: font?.color?.color ?? "inherit",
        textDecoration,
        textTransform: font?.textTransform,
        whiteSpace: "pre-wrap",
        overflow: "hidden",
      };

      return (
        <div className={styles.slideObj} style={baseStyle}>
          <div className={styles.slideObj__text} style={style}>
            {slideObj.text}
          </div>
        </div>
      );
    }
    case "image": {
      return (
        <div className={styles.slideObj} style={baseStyle}>
          <img
            src={slideObj.src}
            alt="aadsad"
            className={styles.slideObj__image}
          />
        </div>
      );
    }
    default: {
      return null;
    }
  }
}
