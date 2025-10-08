import type { Entity } from "../../../shared/types/entity/Entity.ts";
import type { Rect } from "../../../shared/types/rect/Rect.ts";

export type SlideImage = Entity & {
  id: string;
  type: "image";
  src: string;
  rect: Rect;
};
