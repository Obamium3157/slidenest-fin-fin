import {
  RESIZE_POINT_SIZE,
  type ResizePointType,
} from "../../../entities/resizePointType/model/types.ts";

import styles from "./ResizePointView.module.css";
import * as React from "react";

type ResizePointViewProps = {
  type: ResizePointType;
};

export function ResizePointView(props: ResizePointViewProps) {
  const { type } = props;

  const style: React.CSSProperties = {
    width: RESIZE_POINT_SIZE,
    height: RESIZE_POINT_SIZE,
  };
  switch (type) {
    case "TOP_LEFT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "0%", left: "0%" }}
        />
      );
    case "TOP_RIGHT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "0%", left: "100%" }}
        />
      );
    case "BOTTOM_RIGHT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "100%", left: "100%" }}
        />
      );
    case "BOTTOM_LEFT":
      return (
        <div
          className={styles.resizePoint}
          style={{ ...style, top: "100%", left: "0%" }}
        />
      );
    default:
      return null;
  }
}
