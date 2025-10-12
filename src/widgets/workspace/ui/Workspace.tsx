import type { Select } from "../../../entities/select/model/types.ts";
import type { Presentation } from "../../../entities/presentation/model/types.ts";
import { getOrderedMapElementById } from "../../../shared/types/orderedMap/OrderedMap.ts";

import styles from "./workspace.module.css";
import { AllSlideObjects } from "../../allSlideObjects/ui/AllSlideObjects.tsx";

export type WorkspaceProps = {
  presentation: Presentation;
  select: Select;
};

export function Workspace(props: WorkspaceProps) {
  const { presentation, select } = props;
  const currentSlide = getOrderedMapElementById(
    presentation.slides,
    select.selectedSlideId[0],
  );

  if (!currentSlide) {
    return null;
  }

  return (
    <div className={styles.workspace}>
      <div
        className={styles.slide}
        style={{
          background: currentSlide.backgroundColor.color,
        }}
      >
        <AllSlideObjects slide={currentSlide} />
      </div>
    </div>
  );
}
