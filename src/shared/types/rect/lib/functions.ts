import type { Rect } from "../Rect.ts";
import type { ResizePointType } from "../../../../entities/resizePointType/model/types.ts";

export function resizeRect(
  startRect: Rect,
  resizeType: ResizePointType,
  dx: number,
  dy: number,
): Rect {
  let newX = startRect.x;
  let newY = startRect.y;
  let newW = startRect.w;
  let newH = startRect.h;

  switch (resizeType) {
    case "TOP_LEFT": {
      newX = startRect.x + dx;
      newY = startRect.y + dy;
      newW = startRect.w - dx;
      newH = startRect.h - dy;
      break;
    }
    case "TOP_RIGHT": {
      newY = startRect.y + dy;
      newW = startRect.w + dx;
      newH = startRect.h - dy;
      break;
    }
    case "BOTTOM_RIGHT": {
      newW = startRect.w + dx;
      newH = startRect.h + dy;
      break;
    }
    case "BOTTOM_LEFT": {
      newX = startRect.x + dx;
      newW = startRect.w - dx;
      newH = startRect.h + dy;
      break;
    }
    case "TOP": {
      newY = startRect.y + dy;
      newH = startRect.h - dy;
      break;
    }
    case "BOTTOM": {
      newH = startRect.h + dy;
      break;
    }
    case "LEFT": {
      newX = startRect.x + dx;
      newW = startRect.w - dx;
      break;
    }
    case "RIGHT": {
      newW = startRect.w + dx;
      break;
    }
  }

  return { x: newX, y: newY, w: newW, h: newH };
}
