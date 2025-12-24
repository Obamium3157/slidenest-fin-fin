import type { Presentation } from "./types.ts";
import type { Slide } from "../../slide/model/types.ts";
import type { SlideObj } from "../../slide/model/types.ts";
import {
  newOrderedMap,
  getNewOrderedMapWithPushed,
} from "../../../shared/types/orderedMap/OrderedMap.ts";
import { generateId } from "../../../shared/lib/generateId.ts";

export function createDefaultPresentation(
  title = "Название презентации",
): Presentation {
  const presentationId = generateId();
  const slideId = generateId();

  const slide: Slide = {
    id: slideId,
    backgroundColor: { type: "color", color: "#ffffff" },
    slideObjects: newOrderedMap<SlideObj>(),
  };

  const slides = getNewOrderedMapWithPushed(
    newOrderedMap<Slide>(),
    slideId,
    slide,
  );

  return { id: presentationId, title, slides };
}
