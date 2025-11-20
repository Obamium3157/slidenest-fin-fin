import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  getNewOrderedMapWithPushed,
  getNewOrderedMapWithRemoved,
  getOrderedMapElementById,
  getOrderedMapOrder,
  getNewOrderedMapWithMoved,
  newOrderedMap,
  findOrderedMapElementIndex,
} from "../../shared/types/orderedMap/OrderedMap.ts";
import { generateId } from "../../shared/lib/generateId.ts";
import { defaultTextObjectParameters } from "../slideText/model/test/data.ts";
import {
  MAX_PRESENTATION_TITLE_SIZE,
  SLIDE_HEIGHT,
  SLIDE_SIZE,
  SLIDE_WIDTH,
} from "../../shared/lib/constants/constants.ts";
import { clampResizeRect } from "../../shared/types/rect/lib/functions.ts";
import type { Presentation } from "../presentation/model/types.ts";
import type { Slide, SlideObj } from "../slide/model/types.ts";
import type { Rect } from "../../shared/types/rect/Rect.ts";
import type { SlideText } from "../slideText/model/types.ts";
import type { SlideImage } from "../slideImage/model/types.ts";
import type { Font } from "../../shared/types/font/Font.ts";
import type { Color } from "../../shared/types/color/Color.ts";
import { getMaxEditor } from "../presentation/model/test/data.ts";

const initialState: Presentation = getMaxEditor().presentation;

const presentationSlice = createSlice({
  name: "presentation",
  initialState,
  reducers: {
    setPresentationTitle: (
      state,
      action: PayloadAction<{ newTitle: string }>,
    ) => {
      const { newTitle } = action.payload;
      if (
        newTitle.length <= MAX_PRESENTATION_TITLE_SIZE &&
        state.title !== newTitle
      ) {
        state.title = newTitle;
      }
    },

    setPresentation: (_state, action: PayloadAction<Presentation>) => {
      return action.payload;
    },

    addSlide: (state) => {
      const newId = generateId();
      const newSlide: Slide = {
        id: newId,
        backgroundColor: { type: "color", color: "#ffffff" },
        slideObjects: newOrderedMap<SlideObj>(),
      };
      state.slides = getNewOrderedMapWithPushed(state.slides, newId, newSlide);
    },
    removeSlide: (state, action: PayloadAction<{ targetSlideId: string }>) => {
      const { targetSlideId } = action.payload;
      const deletedIndex = findOrderedMapElementIndex(
        state.slides,
        targetSlideId,
      );
      const newSlides = getNewOrderedMapWithRemoved(
        state.slides,
        targetSlideId,
      );
      if (deletedIndex === -1) {
        return;
      }
      state.slides = newSlides;
    },
    moveSlide: (
      state,
      action: PayloadAction<{ slideId: string; toIdx: number }>,
    ) => {
      const { slideId, toIdx } = action.payload;
      state.slides = getNewOrderedMapWithMoved(state.slides, slideId, toIdx);
    },
    moveMultipleSlides: (
      state,
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
      state,
      action: PayloadAction<{ slideId: string; newColor: string }>,
    ) => {
      const { slideId, newColor } = action.payload;
      const slide = getOrderedMapElementById(state.slides, slideId);
      if (!slide || slide.backgroundColor.color === newColor) return;

      const newSlide: Slide = {
        ...slide,
        backgroundColor: { type: "color", color: newColor },
      };
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    addTextToSlide: (state, action: PayloadAction<{ slideId: string }>) => {
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
        slideObjects: getNewOrderedMapWithPushed(
          slide.slideObjects,
          id,
          textObj,
        ),
      };
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    addImageToSlide: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    removeSlideObject: (
      state,
      action: PayloadAction<{ slideId: string; objId: string }>,
    ) => {
      const { slideId, objId } = action.payload;
      const slide = getOrderedMapElementById(state.slides, slideId);
      if (!slide) return;

      const newSlide: Slide = {
        ...slide,
        slideObjects: getNewOrderedMapWithRemoved(slide.slideObjects, objId),
      };
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    removeSlideObjects: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    updateSlideObject: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeSlideObjectPosition: (
      state,
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

      let finalX = newX;
      let finalY = newY;

      if (finalX < 0) finalX = 0;
      if (finalY < 0) finalY = 0;
      if (finalX + obj.rect.w > SLIDE_SIZE.w)
        finalX = SLIDE_SIZE.w - obj.rect.w;
      if (finalY + obj.rect.h > SLIDE_SIZE.h)
        finalY = SLIDE_SIZE.h - obj.rect.h;

      const newRect = { ...obj.rect, x: finalX, y: finalY };

      const newSlide: Slide = {
        ...slide,
        slideObjects: getNewOrderedMapWithPushed(slide.slideObjects, objId, {
          ...obj,
          rect: newRect,
        }),
      };
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeMultipleSlideObjectsPosition: (
      state,
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
        newSlideObjects = getNewOrderedMapWithPushed(
          newSlideObjects,
          id,
          newObj,
        );
      }

      const newSlide: Slide = { ...slide, slideObjects: newSlideObjects };
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },
    changeSlideObjSize: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    updateTextContent: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    updateTextFont: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeFontFamily: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeFontSize: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeFontWeight: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeFontStyle: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeFontColor: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeLetterSpacing: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeWordSpacing: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },
    changeTextDecoration: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },

    changeTextTransform: (
      state,
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
      state.slides = getNewOrderedMapWithPushed(
        state.slides,
        slideId,
        newSlide,
      );
    },
  },
});

export const {
  setPresentationTitle,
  setPresentation,
  addSlide,
  removeSlide,
  moveSlide,
  moveMultipleSlides,
  updateSlideBackgroundColor,
  addTextToSlide,
  addImageToSlide,
  removeSlideObject,
  removeSlideObjects,
  updateSlideObject,
  changeSlideObjectPosition,
  changeMultipleSlideObjectsPosition,
  changeSlideObjSize,
  updateTextContent,
  updateTextFont,
  changeFontFamily,
  changeFontSize,
  changeFontWeight,
  changeFontStyle,
  changeFontColor,
  changeLetterSpacing,
  changeWordSpacing,
  changeTextDecoration,
  changeTextTransform,
} = presentationSlice.actions;
export default presentationSlice.reducer;
