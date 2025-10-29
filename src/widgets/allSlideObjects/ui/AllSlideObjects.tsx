import {
  getOrderedMapElementById,
  getOrderedMapOrder,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import { SlideObjView } from "../../slideObject/ui/SlideObjView.tsx";
import type { Slide } from "../../../entities/slide/model/types.ts";

type SlideObjArrayProps = {
  slide: Slide;
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
  stopPropagation: boolean;
};

export function AllSlideObjects(props: SlideObjArrayProps) {
  const {
    slide,
    selectedObjectId = null,
    onSelectObject,
    stopPropagation,
  } = props;

  const currentSlideObjects = slide.slideObjects;
  const currentSlideObjectsOrder = getOrderedMapOrder(slide.slideObjects);

  return (
    <>
      {currentSlideObjectsOrder.map((id, idx) => {
        const obj = getOrderedMapElementById(currentSlideObjects, id);
        if (!obj) {
          return null;
        }
        return (
          <SlideObjView
            key={idx}
            slideId={slide.id}
            slideObj={obj}
            isSelected={selectedObjectId === obj.id}
            onSelect={() => onSelectObject?.(obj.id)}
            onDeselect={() => {
              onSelectObject?.(null);
            }}
            stopPropagation={stopPropagation}
          />
        );
      })}
    </>
  );
}
