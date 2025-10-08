import type { Entity } from "../../../shared/types/entity/Entity.ts";
import type { Font } from "../../../shared/types/font/Font.ts";

export type SlideText = Entity & {
  id: string;
  type: "text";
  text: string;
  font: Font;
};
