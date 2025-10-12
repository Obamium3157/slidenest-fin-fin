import type { SlideText } from "../types.ts";
import type { Rect } from "../../../../shared/types/rect/Rect.ts";
import { generateId } from "../../../../shared/lib/generateId.ts";
import { makeFont } from "../../../../shared/types/font/test/data.ts";

export function newTextObj(rect: Rect, text: string): SlideText {
  return {
    id: generateId(),
    type: "text",
    text,
    font: makeFont(),
    rect,
  };
}
