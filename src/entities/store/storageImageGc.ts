import type { RootState, AppThunk } from "./types.ts";
import { getCurrentStatePresentation } from "./selectors.ts";
import { deleteImageFromStorageBySrc } from "../../shared/lib/appwrite/repo/presentationRepo.ts";
import { getOrderedMapElementById } from "../../shared/types/orderedMap/OrderedMap.ts";

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function isImageSrcReferenced(state: RootState, src: string): boolean {
  const p = getCurrentStatePresentation(state);

  for (const slideId of p.slides.order) {
    const slide = getOrderedMapElementById(p.slides, slideId);
    if (!slide) continue;

    for (const objId of slide.slideObjects.order) {
      const obj = getOrderedMapElementById(slide.slideObjects, objId);
      if (!obj || obj.type !== "image") continue;
      if (obj.src === src) return true;
    }
  }

  return false;
}

export function scheduleDeleteImageIfOrphaned(
  src: string,
  delayMs: number = 20000,
): AppThunk {
  return (_dispatch, getState) => {
    if (!src) return;
    if (timers.has(src)) return;

    const timer = setTimeout(
      () => {
        timers.delete(src);

        const state = getState();
        if (isImageSrcReferenced(state, src)) return;

        void deleteImageFromStorageBySrc(src);
      },
      Math.max(0, Math.floor(delayMs)),
    );

    timers.set(src, timer);
  };
}
