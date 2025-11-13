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

export function clampResizeRect(
  startRect: Rect,
  desiredRect: Rect,
  slideWidth: number,
  slideHeight: number,
): Rect {
  const MIN_SIZE = 20;
  const { x, y, w, h } = desiredRect;

  const clampedW = Math.max(MIN_SIZE, Math.min(Math.round(w), slideWidth));
  const clampedH = Math.max(MIN_SIZE, Math.min(Math.round(h), slideHeight));

  let clampedX = Math.round(x);
  let clampedY = Math.round(y);

  if (clampedW !== w) {
    if (x > startRect.x) {
      clampedX = startRect.x + (startRect.w - clampedW);
    } else {
      clampedX = Math.min(Math.max(clampedX, 0), slideWidth - clampedW);
    }
  }

  if (clampedH !== h) {
    if (y > startRect.y) {
      clampedY = startRect.y + (startRect.h - clampedH);
    } else {
      clampedY = Math.min(Math.max(clampedY, 0), slideHeight - clampedH);
    }
  }

  clampedX = Math.min(Math.max(clampedX, 0), slideWidth - clampedW);
  clampedY = Math.min(Math.max(clampedY, 0), slideHeight - clampedH);

  return { x: clampedX, y: clampedY, w: clampedW, h: clampedH };
}
