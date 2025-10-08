import type { Color } from "../../../shared/types/color/Color.ts";
import type { OrderedMap } from "../../../shared/types/orderedMap/OrderedMap.ts";
import type { SlideText } from "../../slideText/model/types.ts";
import type { SlideImage } from "../../slideImage/model/types.ts";

export type SlideObj = SlideText | SlideImage;

export type Slide = {
  id: string;

  backgroundColor: Color;

  slideObjects: OrderedMap<SlideObj>;
};
