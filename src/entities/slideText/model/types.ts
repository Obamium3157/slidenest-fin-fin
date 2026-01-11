import type { Entity } from "../../../shared/types/entity/Entity.ts";
import type { Font } from "../../../shared/types/font/Font.ts";

export type TextDir = "ltr" | "rtl" | "auto";

export type SlideText = Entity & {
  id: string;
  type: "text";
  contentHtml: string;
  dir?: TextDir;
  font: Font;
};
