import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import {
  getNewOrderedMapWithMoved,
  getNewOrderedMapWithPushed,
  getNewOrderedMapWithRemoved,
  getOrderedMapElementById,
  getOrderedMapOrder,
  newOrderedMap,
} from "../../shared/types/orderedMap/OrderedMap.ts";
import type { Presentation } from "../presentation/model/types.ts";
import { generateId } from "../../shared/lib/generateId.ts";
import type { Rect } from "../../shared/types/rect/Rect.ts";
import type { SlideText } from "../slideText/model/types.ts";
import { defaultTextObjectParameters } from "../slideText/model/test/data.ts";
import type { Slide } from "../slide/model/types.ts";
import {
  SLIDE_HEIGHT,
  SLIDE_WIDTH,
} from "../../shared/lib/constants/constants.ts";
import type { SlideImage } from "../slideImage/model/types.ts";

export default {
  moveSlide: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{ slideId: string; toIdx: number }>,
  ) => {
    const { slideId, toIdx } = action.payload;
    state.slides = getNewOrderedMapWithMoved(state.slides, slideId, toIdx);
  },
  moveMultipleSlides: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{ slideIds: string[]; toIdx: number }>,
  ) => {
    const { slideIds, toIdx } = action.payload;
    if (slideIds.length === 0) return;

    const order = getOrderedMapOrder(state.slides);
    const movingOrdered = order.filter((id) => slideIds.includes(id));
    if (movingOrdered.length === 0) return;

    const remaining = order.filter((id) => !slideIds.includes(id));
    const clampedIdx = Math.max(0, Math.min(remaining.length, toIdx));

    const newOrder = [
      ...remaining.slice(0, clampedIdx),
      ...movingOrdered,
      ...remaining.slice(clampedIdx),
    ];

    state.slides = newOrderedMap(state.slides.collection, newOrder);
  },

  updateSlideBackgroundColor: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{ slideId: string; newColor: string }>,
  ) => {
    const { slideId, newColor } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide || slide.backgroundColor.color === newColor) return;

    const newSlide: Slide = {
      ...slide,
      backgroundColor: { type: "color", color: newColor },
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  addTextToSlide: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{ slideId: string }>,
  ) => {
    const { slideId } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const id = generateId();
    const rect: Rect = { x: 15, y: 15, w: 220, h: 50 };
    const textObj: SlideText = {
      type: "text",
      id,
      ...defaultTextObjectParameters(),
      rect,
    };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(slide.slideObjects, id, textObj),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  addImageToSlide: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      src: string;
      w: number;
      h: number;
    }>,
  ) => {
    const { slideId, src, w, h } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const id = generateId();
    const scale = Math.min(1, SLIDE_WIDTH / w, SLIDE_HEIGHT / h);
    const scaledW = Math.round(w * scale);
    const scaledH = Math.round(h * scale);

    const rect: Rect = { x: 20, y: 20, w: scaledW, h: scaledH };
    const imageObject: SlideImage = { type: "image", id, src, rect };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        id,
        imageObject,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  removeSlideObject: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{ slideId: string; objId: string }>,
  ) => {
    const { slideId, objId } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithRemoved(slide.slideObjects, objId),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  removeSlideObjects: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{ slideId: string; objIds: string[] }>,
  ) => {
    const { slideId, objIds } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    let newSlideObjects = slide.slideObjects;
    let changed = false;

    for (const objId of objIds) {
      if (objId in newSlideObjects.collection) {
        newSlideObjects = getNewOrderedMapWithRemoved(newSlideObjects, objId);
        changed = true;
      }
    }

    if (!changed) return;

    const newSlide: Slide = {
      ...slide,
      slideObjects: newSlideObjects,
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },
};
