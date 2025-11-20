import type { SlideObj } from "../../../../entities/slide/model/types.ts";
import type { Rect } from "../../rect/Rect.ts";

export const MIN_FONT_SIZE = 8;

export function parseFontSize(fontSize: string | undefined): {
  value: number;
  unit: string;
} {
  if (!fontSize) {
    return { value: 14, unit: "px" };
  }

  const str = fontSize.trim();
  if (str.length === 0) {
    return { value: 14, unit: "px" };
  }

  let i = 0;
  let hasDot = false;
  let numberPart = "";

  if (str[i] === "-" || str[i] === "+") {
    numberPart += str[i];
    i++;
  }

  for (; i < str.length; i++) {
    const ch = str[i];
    if (ch >= "0" && ch <= "9") {
      numberPart += ch;
    } else if (ch === "." && !hasDot) {
      hasDot = true;
      numberPart += ch;
    } else {
      break;
    }
  }

  const rest = str.slice(i).trim();
  const num = Number(numberPart);
  if (Number.isNaN(num)) {
    return { value: 14, unit: "px" };
  }

  const unit = rest.length > 0 ? rest : "px";
  return { value: num, unit };
}

export function computeResizedFontSize(
  startRect: Rect,
  clampedRect: Rect,
  textObj: SlideObj,
  minFontSize: number,
): string | null {
  if (textObj.type !== "text") return null;

  const oldW = startRect.w;
  const oldH = startRect.h;
  const newW = clampedRect.w;
  const newH = clampedRect.h;

  if ((oldW === 0 && oldH === 0) || (newW === 0 && newH === 0)) {
    return null;
  }

  let scale = 1;
  if (newH < oldH) {
    scale = Math.hypot(newW, newH) / Math.hypot(oldW || 0, oldH || 0);
  }

  const rawFontSize = textObj.font?.fontSize;
  const { value: oldFontSizeNum, unit } = parseFontSize(rawFontSize);

  if (!oldFontSizeNum || !unit) {
    return null;
  }

  const newFontSizeNum = Math.max(
    Math.round(oldFontSizeNum * scale),
    minFontSize,
  );

  return `${newFontSizeNum}${unit}`;
}
