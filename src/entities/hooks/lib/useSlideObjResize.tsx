import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { clampResizeRect } from "../../../shared/types/rect/lib/functions.ts";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";
import { dispatch } from "../../editor/lib/modifyEditor.ts";
import {
  changeFontSize,
  changeSlideObjectPosition,
  changeSlideObjSize,
  MIN_FONT_SIZE,
} from "../../editor/lib/editor.ts";
import { computeResizedFontSize } from "../../../shared/types/font/lib/lib.ts";
import type { SlideObj } from "../../slide/model/types.ts";

type SlideObjResizeArgs = {
  slideId: string;
  slideObj: SlideObj;
};

export function useSlideObjResize(args: SlideObjResizeArgs) {
  const { slideId, slideObj } = args;

  const handleResize = (newRect: Rect) => {
    const startRect = slideObj.rect;

    const clamped = clampResizeRect(
      startRect,
      newRect,
      SLIDE_WIDTH,
      SLIDE_HEIGHT,
    );

    dispatch(changeSlideObjSize, [slideId, slideObj.id, clamped.w, clamped.h]);
    dispatch(changeSlideObjectPosition, [
      slideId,
      slideObj.id,
      clamped.x,
      clamped.y,
    ]);

    if (slideObj.type === "text") {
      const newFontSizeStr = computeResizedFontSize(
        startRect,
        clamped,
        slideObj,
        MIN_FONT_SIZE,
      );

      if (newFontSizeStr) {
        dispatch(changeFontSize, [slideId, slideObj.id, newFontSizeStr]);
      }
    }
  };

  return { handleResize };
}
