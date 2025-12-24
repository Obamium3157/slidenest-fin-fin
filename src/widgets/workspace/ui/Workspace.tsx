import { getOrderedMapElementById } from "../../../shared/types/orderedMap/OrderedMap.ts";

import styles from "./workspace.module.css";
import { SlideView } from "../../slideView/ui/SlideView.tsx";
import { useAppSelector } from "../../../entities/store/hooks.ts";
import type { Slide } from "../../../entities/slide/model/types.ts";

export function Workspace() {
  const presentation = useAppSelector(
    (state) => state.presentation.history.present,
  );
  const select = useAppSelector((state) => state.presentation.selection);
  const currentSlide = getOrderedMapElementById(
    presentation.slides,
    select.selectedSlideIds[0],
  ) as Slide;

  if (!currentSlide) {
    return null;
  }

  return (
    <div className={styles.workspace}>
      <SlideView slide={currentSlide} />
    </div>
  );
}
