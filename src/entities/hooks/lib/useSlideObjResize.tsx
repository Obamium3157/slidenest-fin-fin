import type { Rect } from "../../../shared/types/rect/Rect.ts";
import { clampResizeRect } from "../../../shared/types/rect/lib/functions.ts";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../../shared/lib/constants/constants.ts";
import {
  computeResizedFontSize,
  MIN_FONT_SIZE,
} from "../../../shared/types/font/lib/lib.ts";
import type { SlideObj } from "../../slide/model/types.ts";
import { useAppActions } from "../../store/actions.ts";

type SlideObjResizeArgs = {
  slideId: string;
  slideObj: SlideObj;
};

export function useSlideObjResize(args: SlideObjResizeArgs) {
  const { slideId, slideObj } = args;

  const { changeSlideObjSize, changeSlideObjectPosition, changeFontSize } =
    useAppActions();

  const handleResize = (newRect: Rect) => {
    const startRect = slideObj.rect;

    const clamped = clampResizeRect(
      startRect,
      newRect,
      SLIDE_WIDTH,
      SLIDE_HEIGHT,
    );

    changeSlideObjSize({
      slideId,
      objId: slideObj.id,
      newW: clamped.w,
      newH: clamped.h,
    });
    changeSlideObjectPosition({
      slideId,
      objId: slideObj.id,
      newX: clamped.x,
      newY: clamped.y,
    });

    if (slideObj.type === "text") {
      const newFontSizeStr = computeResizedFontSize(
        startRect,
        clamped,
        slideObj,
        MIN_FONT_SIZE,
      );

      if (newFontSizeStr) {
        changeFontSize({
          slideId,
          objId: slideObj.id,
          newSize: newFontSizeStr,
        });
      }
    }
  };

  return { handleResize };
}
