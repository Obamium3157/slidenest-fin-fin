import type { SlideText } from "../types.ts";
import type { Rect } from "../../../../shared/types/rect/Rect.ts";
import { generateId } from "../../../../shared/lib/generateId.ts";
import { defaultFont } from "../../../../shared/types/font/test/data.ts";
import type { Font } from "../../../../shared/types/font/Font.ts";

export function newTextObj(rect: Rect, text: string): SlideText {
  return {
    id: generateId(),
    type: "text",
    text,
    font: defaultFont(),
    rect,
  };
}

/**
 * Returns object with these fields:
 *
 * `text`: "Введите текст"
 *
 * `font`:
 *
 *     fontFamily: "SST",
 *
 *     fontSize: "30px",
 *
 *     fontWeight: "normal",
 *
 *     fontStyle: [],
 *
 *     letterSpacing: "0px",
 *
 *     wordSpacing: "5px",
 *
 *     color: #222222,
 *
 *     textDecoration: [],
 *
 *     textTransform: "none",
 *
 */
export function defaultTextObjectParameters(): {
  text: string;
  font: Font;
} {
  return {
    text: "Введите текст",
    font: defaultFont(),
  };
}
