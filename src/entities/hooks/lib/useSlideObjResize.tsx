import { useEffect, useRef, useState } from "react";
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
  localRect?: Rect | null;
};

type UseSlideObjResizeReturn = {
  handleResize: (newRect: Rect) => void;
  startResize: (initialRect?: Rect) => void;
  localRect: Rect | null;
};

export function useSlideObjResize(
  args: SlideObjResizeArgs,
): UseSlideObjResizeReturn {
  const { slideId, slideObj, localRect: externalLocalRect } = args;

  const { setSlideObjRect, changeFontSize } = useAppActions();

  const [localRect, setLocalRect] = useState<Rect | null>(null);
  const localRectRef = useRef<Rect | null>(null);

  const startRectRef = useRef<Rect | null>(null);

  const startedRef = useRef(false);
  const onPointerUpRef = useRef<() => void>(() => {});

  useEffect(() => {
    return () => {
      if (startedRef.current && onPointerUpRef.current) {
        window.removeEventListener("pointerup", onPointerUpRef.current);
        window.removeEventListener("pointercancel", onPointerUpRef.current);
        startedRef.current = false;
      }
    };
  }, []);

  const commitChanges = () => {
    const clamped = localRectRef.current;
    const startRect =
      startRectRef.current ?? externalLocalRect ?? slideObj.rect;

    if (!clamped) {
      localRectRef.current = null;
      setLocalRect(null);
      startRectRef.current = null;
      return;
    }

    setSlideObjRect({ slideId, objId: slideObj.id, newRect: clamped });

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

    localRectRef.current = null;
    setLocalRect(null);
    startRectRef.current = null;
  };

  onPointerUpRef.current = () => {
    commitChanges();
    if (startedRef.current && onPointerUpRef.current) {
      window.removeEventListener("pointerup", onPointerUpRef.current);
      window.removeEventListener("pointercancel", onPointerUpRef.current);
      startedRef.current = false;
    }
  };

  const startResize = (initialRect?: Rect) => {
    if (!startRectRef.current) {
      if (initialRect) startRectRef.current = { ...initialRect };
      else if (externalLocalRect)
        startRectRef.current = { ...externalLocalRect };
      else startRectRef.current = { ...slideObj.rect };
    }
    if (!startedRef.current) {
      window.addEventListener("pointerup", onPointerUpRef.current);
      window.addEventListener("pointercancel", onPointerUpRef.current);
      startedRef.current = true;
    }
  };

  const handleResize = (newRect: Rect) => {
    if (!startRectRef.current) {
      startRectRef.current = externalLocalRect
        ? { ...externalLocalRect }
        : { ...slideObj.rect };
    }

    const clamped = clampResizeRect(
      startRectRef.current,
      newRect,
      SLIDE_WIDTH,
      SLIDE_HEIGHT,
    );

    localRectRef.current = clamped;
    setLocalRect(clamped);

    if (!startedRef.current) {
      window.addEventListener("pointerup", onPointerUpRef.current);
      window.addEventListener("pointercancel", onPointerUpRef.current);
      startedRef.current = true;
    }
  };

  return { handleResize, startResize, localRect };
}
