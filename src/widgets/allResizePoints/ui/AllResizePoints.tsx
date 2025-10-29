import { ResizePointView } from "../../resizePointView/ui/ResizePointView.tsx";
import styles from "./AllResizePoints.module.css";

export function AllResizePoints() {
  return (
    <div className={styles.allResizePointsWrapper}>
      <ResizePointView type={"TOP_LEFT"} />
      <ResizePointView type={"TOP_RIGHT"} />
      <ResizePointView type={"BOTTOM_LEFT"} />
      <ResizePointView type={"BOTTOM_RIGHT"} />
    </div>
  );
}
