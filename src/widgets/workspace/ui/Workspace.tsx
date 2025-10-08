import type { Select } from "../../../entities/select/model/types.ts";
import type { Presentation } from "../../../entities/presentation/model/types.ts";
import {
  getOrderedMapElementById,
  getOrderedMapOrder,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import { SlideObjView } from "../../../entities/slide/ui/SlideObjView.tsx";

import styles from "./workspace.module.css";

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

  const currentSlideObjects = currentSlide.slideObjects;
  const currentSlideObjectsOrder = getOrderedMapOrder(
    currentSlide.slideObjects,
  );

  return (
    <div className={styles.workspace}>
      <div
        className={styles.slide}
        style={{
          background: currentSlide.backgroundColor.color,
        }}
      >
        {/*<p>Picked slide id: {currentSlide.id}</p>*/}

        {currentSlideObjectsOrder.map((id, idx) => {
          const obj = getOrderedMapElementById(currentSlideObjects, id);
          if (!obj) {
            return null;
          }
          return <SlideObjView key={idx} slideObj={obj} />;
        })}
      </div>
    </div>
  );
}
