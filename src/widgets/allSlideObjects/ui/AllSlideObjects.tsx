import {
  getOrderedMapElementById,
  getOrderedMapOrder,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import { SlideObjView } from "../../../entities/slideObject/ui/SlideObjView.tsx";
import type { Slide } from "../../../entities/slide/model/types.ts";

type SlideObjArrayProps = {
  slide: Slide;
};

export function AllSlideObjects(props: SlideObjArrayProps) {
  const { slide } = props;

  const currentSlideObjects = slide.slideObjects;
  const currentSlideObjectsOrder = getOrderedMapOrder(slide.slideObjects);

  return (
    <>
      {currentSlideObjectsOrder.map((id, idx) => {
        const obj = getOrderedMapElementById(currentSlideObjects, id);
        if (!obj) {
          return null;
        }
        return <SlideObjView key={idx} slideObj={obj} />;
      })}
    </>
  );
}
