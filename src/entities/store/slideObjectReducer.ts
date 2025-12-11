import type { PayloadAction, WritableDraft } from "@reduxjs/toolkit";
import {
  getNewOrderedMapWithPushed,
  getOrderedMapElementById,
} from "../../shared/types/orderedMap/OrderedMap.ts";
import type { Presentation } from "../presentation/model/types.ts";
import type { Slide, SlideObj } from "../slide/model/types.ts";
import { SLIDE_SIZE } from "../../shared/lib/constants/constants.ts";
import type { Rect } from "../../shared/types/rect/Rect.ts";
import { clampResizeRect } from "../../shared/types/rect/lib/functions.ts";
import type { SlideText } from "../slideText/model/types.ts";
import type { Font } from "../../shared/types/font/Font.ts";
import type { Color } from "../../shared/types/color/Color.ts";

function getValidatedPosition(newX: number, newY: number, obj: SlideObj) {
  let finalX = newX;
  let finalY = newY;

  if (finalX < 0) finalX = 0;
  if (finalY < 0) finalY = 0;
  if (finalX + obj.rect.w > SLIDE_SIZE.w) finalX = SLIDE_SIZE.w - obj.rect.w;
  if (finalY + obj.rect.h > SLIDE_SIZE.h) finalY = SLIDE_SIZE.h - obj.rect.h;

  return { finalX, finalY };
}

export default {
  updateSlideObject: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      updates: Partial<Omit<SlideObj, "id" | "type">>;
    }>,
  ) => {
    const { slideId, objId, updates } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const slideObj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!slideObj) return;

    const newObj = { ...slideObj, ...updates } as SlideObj;

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        newObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },
  changeSlideObjectPosition: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newX: number;
      newY: number;
    }>,
  ) => {
    const { slideId, objId, newX, newY } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj) return;

    const { finalX, finalY } = getValidatedPosition(newX, newY, obj);

    const newRect = { ...obj.rect, x: finalX, y: finalY };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(slide.slideObjects, objId, {
        ...obj,
        rect: newRect,
      }),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeMultipleSlideObjectsPosition: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      updates: Record<string, { x: number; y: number }>;
    }>,
  ) => {
    const { slideId, updates } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    let newSlideObjects = slide.slideObjects;

    for (const id of Object.keys(updates)) {
      const obj = getOrderedMapElementById(newSlideObjects, id);
      if (!obj) continue;

      let { x: newX, y: newY } = updates[id];

      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + obj.rect.w > SLIDE_SIZE.w) newX = SLIDE_SIZE.w - obj.rect.w;
      if (newY + obj.rect.h > SLIDE_SIZE.h) newY = SLIDE_SIZE.h - obj.rect.h;

      const newRect = { ...obj.rect, x: newX, y: newY };
      const newObj = { ...obj, rect: newRect };
      newSlideObjects = getNewOrderedMapWithPushed(newSlideObjects, id, newObj);
    }

    const newSlide: Slide = { ...slide, slideObjects: newSlideObjects };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeSlideObjSize: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newW: number;
      newH: number;
    }>,
  ) => {
    const { slideId, objId, newW, newH } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj) return;

    const startRect = obj.rect;
    const desiredRect: Rect = { ...startRect, w: newW, h: newH };
    const clamped = clampResizeRect(
      startRect,
      desiredRect,
      SLIDE_SIZE.w,
      SLIDE_SIZE.h,
    );
    const newRect = { ...obj.rect, w: clamped.w, h: clamped.h };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(slide.slideObjects, objId, {
        ...obj,
        rect: newRect,
      }),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  setSlideObjRect: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newRect: Rect;
    }>,
  ) => {
    const { slideId, objId, newRect } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj) return;

    const startRect = obj.rect;

    const clamped = clampResizeRect(
      startRect,
      newRect,
      SLIDE_SIZE.w,
      SLIDE_SIZE.h,
    );

    const finalW = Number.isFinite(clamped.w)
      ? Math.max(0, Math.round(clamped.w))
      : startRect.w;
    const finalH = Number.isFinite(clamped.h)
      ? Math.max(0, Math.round(clamped.h))
      : startRect.h;
    let finalX = Number.isFinite(clamped.x)
      ? Math.round(clamped.x)
      : startRect.x;
    let finalY = Number.isFinite(clamped.y)
      ? Math.round(clamped.y)
      : startRect.y;

    if (finalX < 0) finalX = 0;
    if (finalY < 0) finalY = 0;
    if (finalX + finalW > SLIDE_SIZE.w)
      finalX = Math.max(0, SLIDE_SIZE.w - finalW);
    if (finalY + finalH > SLIDE_SIZE.h)
      finalY = Math.max(0, SLIDE_SIZE.h - finalH);

    const validatedRect: Rect = { x: finalX, y: finalY, w: finalW, h: finalH };

    const newObj: SlideObj = { ...obj, rect: validatedRect };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        newObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  updateTextContent: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newText: string;
    }>,
  ) => {
    const { slideId, objId, newText } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const newObj: SlideText = { ...textObj, text: newText };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        newObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  updateTextFont: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      updater: (oldFont: Font) => Font;
    }>,
  ) => {
    const { slideId, objId, updater } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const newFont = updater(textObj.font);
    const newObj: SlideText = { ...textObj, font: newFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        newObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeFontFamily: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newFamily: string;
    }>,
  ) => {
    const { slideId, objId, newFamily } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, fontFamily: newFamily };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeFontSize: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newSize: string;
    }>,
  ) => {
    const { slideId, objId, newSize } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, fontSize: newSize };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeFontWeight: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newWeight: Font["fontWeight"];
    }>,
  ) => {
    const { slideId, objId, newWeight } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, fontWeight: newWeight };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeFontStyle: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newStyle: Font["fontStyle"];
    }>,
  ) => {
    const { slideId, objId, newStyle } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, fontStyle: newStyle };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeFontColor: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      newColor: Color;
    }>,
  ) => {
    const { slideId, objId, newColor } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, color: newColor };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeLetterSpacing: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      spacing: string;
    }>,
  ) => {
    const { slideId, objId, spacing } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, letterSpacing: spacing };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeWordSpacing: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      spacing: string;
    }>,
  ) => {
    const { slideId, objId, spacing } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, wordSpacing: spacing };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },
  changeTextDecoration: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      decoration: Font["textDecoration"];
    }>,
  ) => {
    const { slideId, objId, decoration } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, textDecoration: decoration };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },

  changeTextTransform: (
    state: WritableDraft<Presentation>,
    action: PayloadAction<{
      slideId: string;
      objId: string;
      transform: Font["textTransform"];
    }>,
  ) => {
    const { slideId, objId, transform } = action.payload;
    const slide = getOrderedMapElementById(state.slides, slideId);
    if (!slide) return;

    const obj = getOrderedMapElementById(slide.slideObjects, objId);
    if (!obj || obj.type !== "text") return;

    const textObj = obj as SlideText;
    const updatedFont = { ...textObj.font, textTransform: transform };
    const updatedObj: SlideText = { ...textObj, font: updatedFont };

    const newSlide: Slide = {
      ...slide,
      slideObjects: getNewOrderedMapWithPushed(
        slide.slideObjects,
        objId,
        updatedObj,
      ),
    };
    state.slides = getNewOrderedMapWithPushed(state.slides, slideId, newSlide);
  },
};
