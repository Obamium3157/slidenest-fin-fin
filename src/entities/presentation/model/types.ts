import type { OrderedMap } from "../../../shared/types/orderedMap/OrderedMap.ts";
import type { Slide } from "../../slide/model/types.ts";

export type Presentation = {
  id: string;
  title: string;

  slides: OrderedMap<Slide>;
};
