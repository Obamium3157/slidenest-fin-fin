import { ResizePointView } from "../../resizePointView/ui/ResizePointView.tsx";
import styles from "./AllResizePoints.module.css";
import type { Rect } from "../../../shared/types/rect/Rect.ts";
import type { ResizePointType } from "../../../entities/resizePointType/model/types.ts";

type AllResizePointsProps = {
  parentRect: Rect;
  onResize: (rect: Rect) => void;
};

export function AllResizePoints(props: AllResizePointsProps) {
  const { parentRect, onResize } = props;
  const points: ResizePointType[] = [
    "TOP_LEFT",
    "TOP",
    "TOP_RIGHT",
    "RIGHT",
    "BOTTOM_LEFT",
    "BOTTOM",
    "BOTTOM_RIGHT",
    "LEFT",
  ];
  return (
    <div className={styles.allResizePointsWrapper}>
      {points.map((type, idx) => (
        <ResizePointView
          key={idx}
          type={type}
          parentRect={parentRect}
          onResize={onResize}
        />
      ))}
    </div>
  );
}
