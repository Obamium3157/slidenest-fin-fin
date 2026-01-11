import type { SlideText } from "../types.ts";
import type { Rect } from "../../../../shared/types/rect/Rect.ts";
import { generateId } from "../../../../shared/lib/generateId.ts";
import { defaultFont } from "../../../../shared/types/font/test/data.ts";
import type { Font } from "../../../../shared/types/font/Font.ts";
import { plainTextToHtml } from "../../../../shared/lib/html/plainTextToHtml.ts";

export function newTextObj(rect: Rect, text: string): SlideText {
  return {
    id: generateId(),
    type: "text",
    contentHtml: plainTextToHtml(text),
    dir: "auto",
    font: defaultFont(),
    rect,
  };
}

export function defaultTextObjectParameters(): {
  contentHtml: string;
  dir: "auto";
  font: Font;
} {
  return {
    contentHtml: plainTextToHtml("Введите текст"),
    dir: "auto",
    font: defaultFont(),
  };
}
