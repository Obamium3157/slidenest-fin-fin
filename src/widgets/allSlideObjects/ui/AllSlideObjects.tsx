import {
  getOrderedMapElementById,
  getOrderedMapOrder,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import { SlideObjView } from "../../slideObject/ui/SlideObjView.tsx";
import type { Slide } from "../../../entities/slide/model/types.ts";

type SlideObjArrayProps = {
  slide: Slide;
  selectedObjectIds?: string[] | null;
  onSelectObject?: (id: string, isMultipleSelection: boolean) => void;
  onDeselectObject?: (id: string) => void;
};

export function AllSlideObjects(props: SlideObjArrayProps) {
  const {
    slide,
    selectedObjectIds = null,
    onSelectObject,
    onDeselectObject,
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
            slide={slide}
            slideObj={obj}
            isSelected={selectedObjectIds?.includes(obj.id)}
            onSelect={(isMultipleSelection: boolean) =>
              onSelectObject?.(obj.id, isMultipleSelection)
            }
            onDeselect={() => {
              onDeselectObject?.(obj.id);
            }}
          />
        );
      })}
    </>
  );
}
