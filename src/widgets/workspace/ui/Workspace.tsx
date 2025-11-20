import { getOrderedMapElementById } from "../../../shared/types/orderedMap/OrderedMap.ts";

import styles from "./workspace.module.css";
import { SlideView } from "../../slideView/ui/SlideView.tsx";
import { useAppSelector } from "../../../entities/store/hooks.ts";

export function Workspace() {
  const presentation = useAppSelector((state) => state.presentation);
  const select = useAppSelector((state) => state.selection);
  const currentSlide = getOrderedMapElementById(
    presentation.slides,
    select.selectedSlideIds[0],
  );

  if (!currentSlide) {
    return null;
  }

  return (
    <div className={styles.workspace}>
      <SlideView slide={currentSlide} />
    </div>
  );
}
